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
import { Checkbox } from "@/components/ui/checkbox";

// Define the form schema
const teamMemberFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  imageUrl: z.string().url("Please enter a valid URL"),
  isLeadership: z.boolean().default(false),
  socialLinks: z.object({
    linkedin: z.string().url("Please enter a valid LinkedIn URL").or(z.string().length(0)).optional(),
    twitter: z.string().url("Please enter a valid Twitter URL").or(z.string().length(0)).optional(),
    email: z.string().email("Please enter a valid email").or(z.string().length(0)).optional()
  })
});

type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>;

interface TeamMemberFormProps {
  teamMember?: {
    id: number;
    name: string;
    title: string;
    bio: string;
    imageUrl: string;
    isLeadership: boolean;
    socialLinks: {
      linkedin?: string;
      twitter?: string;
      email?: string;
    };
  };
  onSuccess: () => void;
}

const TeamMemberForm = ({ teamMember, onSuccess }: TeamMemberFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!teamMember;

  // Initialize the form
  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: teamMember ? {
      ...teamMember,
      socialLinks: {
        linkedin: teamMember.socialLinks.linkedin || "",
        twitter: teamMember.socialLinks.twitter || "",
        email: teamMember.socialLinks.email || ""
      }
    } : {
      name: "",
      title: "",
      bio: "",
      imageUrl: "",
      isLeadership: false,
      socialLinks: {
        linkedin: "",
        twitter: "",
        email: ""
      }
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: TeamMemberFormValues) => 
      apiRequest("POST", "/api/team", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/team/leadership'] });
      toast({
        title: "Success",
        description: "Team member created successfully",
        variant: "default",
      });
      onSuccess();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create team member",
        variant: "destructive",
      });
      console.error("Error creating team member:", error);
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: TeamMemberFormValues) => 
      apiRequest("PUT", `/api/team/${teamMember?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/team/leadership'] });
      toast({
        title: "Success",
        description: "Team member updated successfully",
        variant: "default",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update team member",
        variant: "destructive",
      });
      console.error("Error updating team member:", error);
    }
  });

  // Handle form submission
  const onSubmit = (data: TeamMemberFormValues) => {
    // Clean up empty social links to ensure they're either valid URLs or undefined
    const socialLinks = {
      ...data.socialLinks
    };
    
    Object.keys(socialLinks).forEach(key => {
      const value = socialLinks[key as keyof typeof socialLinks];
      if (value === "") {
        delete socialLinks[key as keyof typeof socialLinks];
      }
    });

    const submitData = {
      ...data,
      socialLinks
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
                <FormLabel>Title/Position</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Executive Director" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biography</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief biography" 
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

        <FormField
          control={form.control}
          name="isLeadership"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Leadership Team Member</FormLabel>
                <FormDescription>
                  This team member will be shown in the leadership section of the website
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-medium mb-4">Social Media Links</h3>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="socialLinks.linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://linkedin.com/in/username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="socialLinks.twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://twitter.com/username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="socialLinks.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

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
              : isEditing ? "Update Team Member" : "Add Team Member"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TeamMemberForm;