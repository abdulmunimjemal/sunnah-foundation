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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

// Form validation schema
const courseFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  level: z.string().min(1, "Level is required"),
  duration: z.string().min(1, "Duration is required"),
  instructors: z.string().min(1, "At least one instructor is required"),
  imageUrl: z.string().url("Please enter a valid URL"),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

interface UniversityCourseFormProps {
  course?: {
    id: number;
    title: string;
    description: string;
    level: string;
    duration: string;
    instructors: string[];
    imageUrl: string;
  };
  onSuccess: () => void;
}

const UniversityCourseForm = ({ course, onSuccess }: UniversityCourseFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create form
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: course?.title || "",
      description: course?.description || "",
      level: course?.level || "",
      duration: course?.duration || "",
      instructors: course?.instructors ? course.instructors.join(", ") : "",
      imageUrl: course?.imageUrl || "",
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CourseFormValues) => {
      const processedData = {
        ...data,
        // Convert comma-separated instructors to array
        instructors: data.instructors.split(",").map(instructor => instructor.trim()).filter(Boolean),
      };
      return apiRequest("POST", "/api/university/courses", processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/university/courses'] });
      toast({
        title: "Success",
        description: "Course created successfully",
        variant: "default",
      });
      setIsSubmitting(false);
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: CourseFormValues) => {
      const processedData = {
        ...data,
        // Convert comma-separated instructors to array
        instructors: data.instructors.split(",").map(instructor => instructor.trim()).filter(Boolean),
      };
      return apiRequest("PUT", `/api/university/courses/${course?.id}`, processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/university/courses'] });
      toast({
        title: "Success",
        description: "Course updated successfully",
        variant: "default",
      });
      setIsSubmitting(false);
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: CourseFormValues) => {
    setIsSubmitting(true);
    if (course) {
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter course title" {...field} />
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
                      placeholder="Enter course description" 
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="All Levels">All Levels</SelectItem>
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
                      <Input placeholder="e.g., 8 weeks" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="instructors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructors</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter instructor names, separated by commas" {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate multiple instructors with commas
                  </p>
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
                  <FormLabel>Course Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-6">
              {form.watch("imageUrl") && (
                <Card className="mt-2 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-video">
                      <img 
                        src={form.watch("imageUrl")}
                        alt="Course Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/640x360?text=Course+Preview";
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
            {isSubmitting ? "Saving..." : course ? "Update Course" : "Add Course"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UniversityCourseForm;