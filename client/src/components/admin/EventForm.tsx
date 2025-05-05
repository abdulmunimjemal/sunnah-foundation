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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

// Define the form schema using zod
const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  imageUrl: z.string().url("Please enter a valid URL"),
  registrationLink: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  isPast: z.boolean().default(false),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  event?: {
    id: number;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    imageUrl: string;
    registrationLink: string | null;
    isPast: boolean;
  };
  onSuccess: () => void;
}

const EventForm = ({ event, onSuccess }: EventFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!event;
  const [previewUrl, setPreviewUrl] = useState(event?.imageUrl || "");

  // Initialize the form with default values or the event data if editing
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: event ? {
      ...event,
      registrationLink: event.registrationLink || "",
      date: new Date(event.date).toISOString().split('T')[0],
    } : {
      title: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      time: "",
      location: "",
      imageUrl: "",
      registrationLink: "",
      isPast: false,
    },
  });

  // Update preview URL when image URL changes
  const watchImageUrl = form.watch("imageUrl");
  if (watchImageUrl !== previewUrl) {
    setPreviewUrl(watchImageUrl);
  }

  // Create mutation for adding a new event
  const createMutation = useMutation({
    mutationFn: (data: EventFormValues) => 
      apiRequest("POST", "/api/events", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/past'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Success",
        description: "Event created successfully",
        variant: "default",
      });
      onSuccess();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
      console.error("Error creating event:", error);
    }
  });

  // Update mutation for editing an existing event
  const updateMutation = useMutation({
    mutationFn: (data: EventFormValues) => 
      apiRequest("PUT", `/api/events/${event?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/past'] });
      toast({
        title: "Success",
        description: "Event updated successfully",
        variant: "default",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
      console.error("Error updating event:", error);
    }
  });

  // Handle form submission
  const onSubmit = (data: EventFormValues) => {
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
                <FormLabel>Event Title</FormLabel>
                <FormControl>
                  <Input placeholder="Event title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Event location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input placeholder="6:00 PM - 8:00 PM" {...field} />
                </FormControl>
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Event description" 
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
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {previewUrl && (
          <Card className="overflow-hidden">
            <CardContent className="p-2">
              <div className="aspect-video relative overflow-hidden rounded">
                <img 
                  src={previewUrl} 
                  alt="Event preview" 
                  className="w-full h-full object-cover"
                  onError={() => setPreviewUrl("")}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <FormField
          control={form.control}
          name="registrationLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registration Link (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/register" 
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPast"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Past Event</FormLabel>
                <p className="text-sm text-gray-500">
                  Check this if the event has already passed
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="bg-accent hover:bg-accent/90 text-white"
          >
            {isEditing ? "Update" : "Create"} Event
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EventForm;