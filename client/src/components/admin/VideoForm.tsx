import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Define the form schema
const videoFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  thumbnailUrl: z.string().url("Please enter a valid URL"),
  videoUrl: z.string().url("Please enter a valid URL"),
  duration: z.string().min(1, "Duration is required"),
  category: z.string().min(1, "Category is required"),
  date: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isMainFeature: z.boolean().default(false),
});

type VideoFormValues = z.infer<typeof videoFormSchema>;

interface VideoFormProps {
  video?: {
    id: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    videoUrl: string;
    duration: string;
    category: string;
    date: string;
    isFeatured: boolean;
    isMainFeature: boolean;
    views: number;
  };
  categories: string[];
  onSuccess: () => void;
}

const VideoForm = ({ video, categories, onSuccess }: VideoFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!video;

  // Initialize the form
  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: video ? {
      ...video,
    } : {
      title: "",
      description: "",
      thumbnailUrl: "",
      videoUrl: "",
      duration: "",
      category: "",
      date: new Date().toISOString().split('T')[0],
      isFeatured: false,
      isMainFeature: false,
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: VideoFormValues) => 
      apiRequest("POST", "/api/videos", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/videos/featured'] });
      queryClient.invalidateQueries({ queryKey: ['/api/videos/main-feature'] });
      toast({
        title: "Success",
        description: "Video created successfully",
        variant: "default",
      });
      onSuccess();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create video",
        variant: "destructive",
      });
      console.error("Error creating video:", error);
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: VideoFormValues) => 
      apiRequest("PUT", `/api/videos/${video?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/videos/featured'] });
      queryClient.invalidateQueries({ queryKey: ['/api/videos/main-feature'] });
      toast({
        title: "Success",
        description: "Video updated successfully",
        variant: "default",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update video",
        variant: "destructive",
      });
      console.error("Error updating video:", error);
    }
  });

  // Function to extract YouTube ID from URL
  const getYoutubeEmbedUrl = (url: string) => {
    try {
      // Try to extract video ID from various YouTube URL formats
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      const videoId = (match && match[2].length === 11) ? match[2] : null;
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      } else {
        return url; // Return original URL if not a valid YouTube URL
      }
    } catch {
      return url;
    }
  };

  // Handle form submission
  const onSubmit = (data: VideoFormValues) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Title</FormLabel>
              <FormControl>
                <Input placeholder="Video title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Video description" 
                  {...field} 
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 10:30" {...field} />
                </FormControl>
                <FormDescription>Format: MM:SS</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL</FormLabel>
              <FormControl>
                <Input placeholder="YouTube or other video platform URL" {...field} />
              </FormControl>
              <FormDescription>
                YouTube, Vimeo, or other video streaming platform URL
              </FormDescription>
              <FormMessage />
              {field.value && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                  <div className="relative aspect-video w-full overflow-hidden rounded-md">
                    <iframe 
                      src={getYoutubeEmbedUrl(field.value)} 
                      className="absolute top-0 left-0 w-full h-full" 
                      allowFullScreen
                      frameBorder="0"
                      title="Video preview"
                    />
                  </div>
                </div>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="thumbnailUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thumbnail URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/thumbnail.jpg" {...field} />
              </FormControl>
              <FormMessage />
              {field.value && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                  <div className="relative h-40 w-full overflow-hidden rounded-md">
                    <img 
                      src={field.value} 
                      alt="Thumbnail Preview" 
                      className="object-cover w-full h-full" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x225?text=Invalid+Image+URL";
                      }}
                    />
                  </div>
                </div>
              )}
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Featured Video</FormLabel>
                  <FormDescription>
                    This video will be shown in the featured videos section
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isMainFeature"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        // If this is becoming the main feature, make sure it's also featured
                        form.setValue("isFeatured", true);
                      }
                      field.onChange(checked);
                    }}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Main Feature Video</FormLabel>
                  <FormDescription>
                    This video will be shown as the main featured video on the homepage
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending 
              ? "Saving..." 
              : isEditing ? "Update Video" : "Add Video"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default VideoForm;