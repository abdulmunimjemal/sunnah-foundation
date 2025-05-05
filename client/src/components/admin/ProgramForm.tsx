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
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define the form schema
const programFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  longDescription: z.string().min(50, "Long description must be at least 50 characters"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().url("Please enter a valid URL"),
  slug: z.string().min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
});

type ProgramFormValues = z.infer<typeof programFormSchema>;

interface ProgramFormProps {
  program?: {
    id: number;
    title: string;
    description: string;
    longDescription: string;
    category: string;
    imageUrl: string;
    slug: string;
  };
  categories: string[];
  onSuccess: () => void;
}

const ProgramForm = ({ program, categories, onSuccess }: ProgramFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!program;

  // Initialize the form
  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programFormSchema),
    defaultValues: program ? {
      ...program,
    } : {
      title: "",
      description: "",
      longDescription: "",
      category: "",
      imageUrl: "",
      slug: "",
    },
  });

  // Handle slug generation from title
  const generateSlug = () => {
    const title = form.getValues("title");
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      form.setValue("slug", slug);
    }
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: ProgramFormValues) => 
      apiRequest("POST", "/api/programs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/programs'] });
      toast({
        title: "Success",
        description: "Program created successfully",
        variant: "default",
      });
      onSuccess();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create program",
        variant: "destructive",
      });
      console.error("Error creating program:", error);
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: ProgramFormValues) => 
      apiRequest("PUT", `/api/programs/${program?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/programs'] });
      toast({
        title: "Success",
        description: "Program updated successfully",
        variant: "default",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update program",
        variant: "destructive",
      });
      console.error("Error updating program:", error);
    }
  });

  // Handle form submission
  const onSubmit = (data: ProgramFormValues) => {
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
                <FormLabel>Program Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Program title" 
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
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
                      placeholder="program-slug" 
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief description (shown in listings)" 
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
          name="longDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Long Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Detailed program description" 
                  {...field} 
                  rows={10}
                />
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
              : isEditing ? "Update Program" : "Create Program"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProgramForm;