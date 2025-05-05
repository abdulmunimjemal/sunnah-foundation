import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

// Form validation schema
const facultyFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  specialization: z.string().min(2, "Specialization must be at least 2 characters"),
  bio: z.string().min(10, "Biography must be at least 10 characters"),
  imageUrl: z.string().url("Please enter a valid URL"),
});

type FacultyFormValues = z.infer<typeof facultyFormSchema>;

interface FacultyMemberFormProps {
  faculty?: {
    id: number;
    name: string;
    title: string;
    specialization: string;
    bio: string;
    imageUrl: string;
  };
  onSuccess: () => void;
}

const FacultyMemberForm = ({ faculty, onSuccess }: FacultyMemberFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create form
  const form = useForm<FacultyFormValues>({
    resolver: zodResolver(facultyFormSchema),
    defaultValues: {
      name: faculty?.name || "",
      title: faculty?.title || "",
      specialization: faculty?.specialization || "",
      bio: faculty?.bio || "",
      imageUrl: faculty?.imageUrl || "",
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: FacultyFormValues) => 
      apiRequest("POST", "/api/university/faculty", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/university/faculty'] });
      toast({
        title: "Success",
        description: "Faculty member created successfully",
        variant: "default",
      });
      setIsSubmitting(false);
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create faculty member",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: FacultyFormValues) => 
      apiRequest("PUT", `/api/university/faculty/${faculty?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/university/faculty'] });
      toast({
        title: "Success",
        description: "Faculty member updated successfully",
        variant: "default",
      });
      setIsSubmitting(false);
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update faculty member",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: FacultyFormValues) => {
    setIsSubmitting(true);
    if (faculty) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter faculty member's name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title/Position</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Professor of Islamic Studies" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialization</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Tafsir, Hadith Studies, Fiqh" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biography</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter faculty member's biography" 
                      className="min-h-[150px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-6">
              {form.watch("imageUrl") && (
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-square w-48 mx-auto">
                      <img 
                        src={form.watch("imageUrl")}
                        alt="Profile Preview"
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/200x200?text=Profile";
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : faculty ? "Update Faculty Member" : "Add Faculty Member"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FacultyMemberForm;