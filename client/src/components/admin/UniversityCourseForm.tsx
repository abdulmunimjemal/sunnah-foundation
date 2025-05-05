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

// Define the form schema
const courseFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  level: z.string().min(1, "Level is required"),
  duration: z.string().min(1, "Duration is required"),
  instructors: z.array(z.string()).min(1, "At least one instructor is required"),
  imageUrl: z.string().url("Please enter a valid URL"),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

const courseLevels = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "All Levels"
];

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
  const isEditing = !!course;
  const [instructorInput, setInstructorInput] = useState("");

  // Initialize the form
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: course ? {
      ...course,
    } : {
      title: "",
      description: "",
      level: "",
      duration: "",
      instructors: [],
      imageUrl: "",
    },
  });

  // Handle adding an instructor
  const addInstructor = () => {
    if (!instructorInput.trim()) return;
    
    const currentInstructors = form.getValues("instructors") || [];
    if (!currentInstructors.includes(instructorInput.trim())) {
      form.setValue("instructors", [...currentInstructors, instructorInput.trim()]);
    }
    setInstructorInput("");
  };

  // Handle removing an instructor
  const removeInstructor = (instructor: string) => {
    const currentInstructors = form.getValues("instructors");
    form.setValue(
      "instructors", 
      currentInstructors.filter(i => i !== instructor)
    );
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CourseFormValues) => 
      apiRequest("POST", "/api/university/courses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/university/courses'] });
      toast({
        title: "Success",
        description: "Course created successfully",
        variant: "default",
      });
      onSuccess();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive",
      });
      console.error("Error creating course:", error);
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: CourseFormValues) => 
      apiRequest("PUT", `/api/university/courses/${course?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/university/courses'] });
      toast({
        title: "Success",
        description: "Course updated successfully",
        variant: "default",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive",
      });
      console.error("Error updating course:", error);
    }
  });

  // Handle form submission
  const onSubmit = (data: CourseFormValues) => {
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
              <FormLabel>Course Title</FormLabel>
              <FormControl>
                <Input placeholder="Course title" {...field} />
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
                  placeholder="Course description" 
                  {...field} 
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Level</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courseLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
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
                  <Input placeholder="e.g. 8 weeks, 3 months" {...field} />
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
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Add instructor name" 
                    value={instructorInput}
                    onChange={(e) => setInstructorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addInstructor();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addInstructor}
                  >
                    Add
                  </Button>
                </div>

                {field.value.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value.map((instructor) => (
                      <div 
                        key={instructor} 
                        className="bg-secondary/10 text-secondary rounded-full px-3 py-1 text-sm flex items-center"
                      >
                        {instructor}
                        <button 
                          type="button"
                          className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                          onClick={() => removeInstructor(instructor)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No instructors added yet</p>
                )}

                <FormMessage />
              </div>
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
              : isEditing ? "Update Course" : "Add Course"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UniversityCourseForm;