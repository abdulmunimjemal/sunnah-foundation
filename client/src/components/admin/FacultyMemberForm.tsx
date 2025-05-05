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

// Define the form schema
const facultyFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  specialization: z.string().min(3, "Specialization must be at least 3 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
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
  const isEditing = !!faculty;

  // Initialize the form
  const form = useForm<FacultyFormValues>({
    resolver: zodResolver(facultyFormSchema),
    defaultValues: faculty ? {
      ...faculty,
    } : {
      name: "",
      title: "",
      specialization: "",
      bio: "",
      imageUrl: "",
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
      onSuccess();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create faculty member",
        variant: "destructive",
      });
      console.error("Error creating faculty member:", error);
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
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update faculty member",
        variant: "destructive",
      });
      console.error("Error updating faculty member:", error);
    }
  });

  // Handle form submission
  const onSubmit = (data: FacultyFormValues) => {
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Full name" {...field} />
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
                <FormLabel>Academic Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Professor, Lecturer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="specialization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specialization</FormLabel>
              <FormControl>
                <Input placeholder="Area of expertise" {...field} />
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
                  placeholder="Professional biography" 
                  {...field} 
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Photo URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/photo.jpg" {...field} />
              </FormControl>
              <FormMessage />
              {field.value && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                  <div className="relative h-40 w-40 overflow-hidden rounded-full">
                    <img 
                      src={field.value} 
                      alt="Preview" 
                      className="object-cover w-full h-full" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/200x200?text=Invalid+Image+URL";
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
              : isEditing ? "Update Faculty Member" : "Add Faculty Member"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FacultyMemberForm;