import { useState, useEffect } from "react";
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
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define the form schema using zod
const newsFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  author: z.string().min(2, "Author name is required"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().url("Please enter a valid URL"),
  slug: z.string().min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  date: z.string().optional(),
});

type NewsFormValues = z.infer<typeof newsFormSchema>;

interface NewsArticleFormProps {
  article?: {
    id: number;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    category: string;
    imageUrl: string;
    slug: string;
    date: string;
  };
  categories: string[];
  onSuccess: () => void;
}

const NewsArticleForm = ({ article, categories, onSuccess }: NewsArticleFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!article;

  // Initialize the form with default values or the article data if editing
  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: article ? {
      ...article,
    } : {
      title: "",
      excerpt: "",
      content: "",
      author: "",
      category: "",
      imageUrl: "",
      slug: "",
      date: new Date().toISOString().split('T')[0],
    },
  });

  // Handle slug generation from title
  const generateSlug = () => {
    const title = form.getValues("title");
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special chars
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-"); // Remove consecutive hyphens
      form.setValue("slug", slug);
    }
  };

  // Create mutation for adding a new article
  const createMutation = useMutation({
    mutationFn: (data: NewsFormValues) => 
      apiRequest("POST", "/api/news", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      toast({
        title: "Success",
        description: "News article created successfully",
        variant: "default",
      });
      onSuccess();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create news article",
        variant: "destructive",
      });
      console.error("Error creating news article:", error);
    }
  });

  // Update mutation for editing an existing article
  const updateMutation = useMutation({
    mutationFn: (data: NewsFormValues) => 
      apiRequest("PUT", `/api/news/${article?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      toast({
        title: "Success",
        description: "News article updated successfully",
        variant: "default",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update news article",
        variant: "destructive",
      });
      console.error("Error updating news article:", error);
    }
  });

  // Handle form submission
  const onSubmit = (data: NewsFormValues) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Article title" 
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      // Automatically generate slug when title changes if this is a new article
                      if (!isEditing) {
                        generateSlug();
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <div className="flex space-x-2">
                  <FormControl>
                    <Input 
                      placeholder="article-slug" 
                      {...field} 
                    />
                  </FormControl>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generateSlug}
                  >
                    Generate
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief summary of the article (shown in listings)" 
                  {...field} 
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Full article content" 
                  {...field} 
                  rows={10}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author</FormLabel>
                <FormControl>
                  <Input placeholder="Author name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormMessage />
              {field.value && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                  <div className="relative h-40 w-full overflow-hidden rounded-md">
                    <img 
                      src={field.value} 
                      alt="Preview" 
                      className="object-cover w-full h-full" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x200?text=Invalid+Image+URL";
                      }}
                    />
                  </div>
                </div>
              )}
            </FormItem>
          )}
        />

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
              : isEditing ? "Update Article" : "Create Article"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewsArticleForm;