import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Define form schema with Zod
const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string().min(1, { message: "Please enter a time" }),
  location: z.string().min(3, { message: "Location must be at least 3 characters" }),
  imageUrl: z.string().url({ message: "Please enter a valid image URL" }),
  registrationLink: z.string().url({ message: "Please enter a valid URL" }).nullable().optional(),
  isPast: z.boolean().default(false),
});

// Define props interface
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
    createdAt: string;
  } | null;
  onSuccess: () => void;
}

// Form component
export default function EventForm({ event, onSuccess }: EventFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!event;

  // Set up form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      date: event?.date ? new Date(event.date) : new Date(),
      time: event?.time || "",
      location: event?.location || "",
      imageUrl: event?.imageUrl || "",
      registrationLink: event?.registrationLink || "",
      isPast: event?.isPast || false,
    },
  });

  // Create or update event mutation
  const eventMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const formattedDate = format(data.date, "yyyy-MM-dd");
      
      const payload = {
        ...data,
        date: formattedDate,
        registrationLink: data.registrationLink || null,
      };
      
      if (isEditing && event) {
        return apiRequest("PATCH", `/api/events/${event.id}`, payload);
      } else {
        return apiRequest("POST", "/api/events", payload);
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Event updated" : "Event created",
        description: isEditing 
          ? "The event has been updated successfully." 
          : "The new event has been created successfully.",
        variant: "default",
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/past'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      onSuccess();
    },
    onError: (error) => {
      console.error("Event form error:", error);
      toast({
        title: "Error",
        description: isEditing 
          ? "There was a problem updating the event." 
          : "There was a problem creating the event.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    eventMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Event title" {...field} />
              </FormControl>
              <FormDescription>
                The title of your event.
              </FormDescription>
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
                  placeholder="Describe the event..."
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide details about the event.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  The date of the event.
                </FormDescription>
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
                  <Input placeholder="e.g., 7:00 PM - 9:00 PM" {...field} />
                </FormControl>
                <FormDescription>
                  The time of the event.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Event location" {...field} />
              </FormControl>
              <FormDescription>
                Where the event will take place.
              </FormDescription>
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
              <FormDescription>
                URL to an image for the event.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="registrationLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registration Link (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/register" {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>
                Link where attendees can register for the event.
              </FormDescription>
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
                <FormLabel>Mark as past event</FormLabel>
                <FormDescription>
                  Check this if the event has already occurred.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={eventMutation.isPending}
          >
            {eventMutation.isPending
              ? isEditing ? "Updating..." : "Creating..."
              : isEditing ? "Update Event" : "Create Event"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}