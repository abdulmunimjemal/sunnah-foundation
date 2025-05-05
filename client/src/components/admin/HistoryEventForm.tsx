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
const historyFormSchema = z.object({
  year: z.coerce.number().int().positive("Year must be a positive number"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().nonnegative("Sort order must be a non-negative number")
});

type HistoryFormValues = z.infer<typeof historyFormSchema>;

interface HistoryEventFormProps {
  event?: {
    id: number;
    year: number;
    title: string;
    description: string;
    imageUrl?: string;
    sortOrder: number;
  };
  onSuccess: () => void;
}

const HistoryEventForm = ({ event, onSuccess }: HistoryEventFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!event;

  // Initialize the form
  const form = useForm<HistoryFormValues>({
    resolver: zodResolver(historyFormSchema),
    defaultValues: event ? {
      ...event,
      imageUrl: event.imageUrl || ""
    } : {
      year: new Date().getFullYear(),
      title: "",
      description: "",
      imageUrl: "",
      sortOrder: 0
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: HistoryFormValues) => 
      apiRequest("POST", "/api/about/history", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/about/history'] });
      toast({
        title: "Success",
        description: "History event created successfully",
        variant: "default",
      });
      onSuccess();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create history event",
        variant: "destructive",
      });
      console.error("Error creating history event:", error);
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: HistoryFormValues) => 
      apiRequest("PUT", `/api/about/history/${event?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/about/history'] });
      toast({
        title: "Success",
        description: "History event updated successfully",
        variant: "default",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update history event",
        variant: "destructive",
      });
      console.error("Error updating history event:", error);
    }
  });

  // Handle form submission
  const onSubmit = (data: HistoryFormValues) => {
    const submitData = {
      ...data,
      // If imageUrl is empty string, set it to undefined
      imageUrl: data.imageUrl && data.imageUrl.trim() !== "" ? data.imageUrl : undefined
    };

    if (isEditing) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g. 1995" 
                    {...field} 
                    onChange={(e) => {
                      const value = e.target.value === "" ? "0" : e.target.value;
                      field.onChange(parseInt(value, 10));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort Order</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Display order (lowest first)" 
                    {...field} 
                    onChange={(e) => {
                      const value = e.target.value === "" ? "0" : e.target.value;
                      field.onChange(parseInt(value, 10));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input placeholder="Title of the historical event" {...field} />
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
                  placeholder="Description of the historical event" 
                  {...field} 
                  rows={4}
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
              <FormLabel>Image URL (Optional)</FormLabel>
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
              : isEditing ? "Update Event" : "Add Event"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default HistoryEventForm;