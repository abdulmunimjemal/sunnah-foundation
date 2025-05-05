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
const historyFormSchema = z.object({
  year: z.coerce.number().int().positive("Year must be a positive number"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageUrl: z.string().url("Please enter a valid URL").optional(),
  sortOrder: z.coerce.number().int().nonnegative("Sort order must be a non-negative number"),
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create form
  const form = useForm<HistoryFormValues>({
    resolver: zodResolver(historyFormSchema),
    defaultValues: {
      year: event?.year || new Date().getFullYear(),
      title: event?.title || "",
      description: event?.description || "",
      imageUrl: event?.imageUrl || "",
      sortOrder: event?.sortOrder || 0,
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
      setIsSubmitting(false);
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create history event",
        variant: "destructive",
      });
      setIsSubmitting(false);
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
      setIsSubmitting(false);
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update history event",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: HistoryFormValues) => {
    setIsSubmitting(true);
    if (event) {
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 1990" 
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? "0" : e.target.value;
                          field.onChange(Number(value));
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
                        placeholder="e.g., 1" 
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? "0" : e.target.value;
                          field.onChange(Number(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">
                      Lower numbers appear first
                    </p>
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
                    <Input placeholder="Enter event title" {...field} />
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
                      placeholder="Enter event description" 
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
                  <FormLabel>Image URL (Optional)</FormLabel>
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
                    <div className="aspect-video">
                      <img 
                        src={form.watch("imageUrl")}
                        alt="Event Image Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/640x360?text=Event+Image";
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
            {isSubmitting ? "Saving..." : event ? "Update Event" : "Add Event"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default HistoryEventForm;