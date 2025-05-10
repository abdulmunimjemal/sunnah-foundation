import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Setting type definition
interface Setting {
  id: number;
  key: string;
  value: string;
  label: string;
  description: string | null;
  group: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

// Schema for updating a setting
const updateSettingSchema = z.object({
  value: z.string().min(1, "Value is required"),
});

// Schema for creating a new setting
const createSettingSchema = z.object({
  key: z.string().min(2, "Key must be at least 2 characters"),
  value: z.string().min(1, "Value is required"),
  label: z.string().min(2, "Label must be at least 2 characters"),
  description: z.string().optional(),
  group: z.string().min(1, "Group is required"),
  type: z.string().min(1, "Type is required"),
});

type UpdateSettingFormValues = z.infer<typeof updateSettingSchema>;
type CreateSettingFormValues = z.infer<typeof createSettingSchema>;

export default function SettingsManager() {
  const [activeTab, setActiveTab] = useState("urls");
  const [selectedSetting, setSelectedSetting] = useState<Setting | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all settings
  const { data: settings, isLoading } = useQuery<Setting[]>({
    queryKey: ['/api/settings'],
    refetchOnWindowFocus: false,
  });

  // Group settings by their group
  const groupedSettings = settings ? 
    settings.reduce((acc, setting) => {
      if (!acc[setting.group]) {
        acc[setting.group] = [];
      }
      acc[setting.group].push(setting);
      return acc;
    }, {} as Record<string, Setting[]>) : {};

  // Update setting form
  const updateForm = useForm<UpdateSettingFormValues>({
    resolver: zodResolver(updateSettingSchema),
    defaultValues: {
      value: selectedSetting?.value || "",
    },
  });

  // Create setting form
  const createForm = useForm<CreateSettingFormValues>({
    resolver: zodResolver(createSettingSchema),
    defaultValues: {
      key: "",
      value: "",
      label: "",
      description: "",
      group: "urls",
      type: "text",
    },
  });

  // Update form values when selected setting changes
  useEffect(() => {
    if (selectedSetting) {
      updateForm.reset({
        value: selectedSetting.value,
      });
    }
  }, [selectedSetting, updateForm]);

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async (values: UpdateSettingFormValues) => {
      if (!selectedSetting) throw new Error("No setting selected");
      return await apiRequest("PATCH", `/api/settings/${selectedSetting.key}`, values);
    },
    onSuccess: () => {
      toast({
        title: "Setting updated",
        description: "The setting has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      setIsEditing(false);
      setSelectedSetting(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update setting",
        variant: "destructive",
      });
    },
  });

  // Create setting mutation
  const createSettingMutation = useMutation({
    mutationFn: async (values: CreateSettingFormValues) => {
      return await apiRequest("POST", '/api/settings', values);
    },
    onSuccess: () => {
      toast({
        title: "Setting created",
        description: "The setting has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      setIsCreating(false);
      createForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create setting",
        variant: "destructive",
      });
    },
  });

  // Delete setting mutation
  const deleteSettingMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/settings/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Setting deleted",
        description: "The setting has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      setSelectedSetting(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete setting",
        variant: "destructive",
      });
    },
  });

  // Handle update setting form submission
  const onUpdateSubmit = (values: UpdateSettingFormValues) => {
    updateSettingMutation.mutate(values);
  };

  // Handle create setting form submission
  const onCreateSubmit = (values: CreateSettingFormValues) => {
    createSettingMutation.mutate(values);
  };

  // Handle setting selection for editing
  const handleEditSetting = (setting: Setting) => {
    setSelectedSetting(setting);
    setIsEditing(true);
    setIsCreating(false);
  };

  // Start creating a new setting
  const handleCreateSetting = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedSetting(null);
  };

  // Handle setting deletion
  const handleDeleteSetting = (id: number) => {
    if (window.confirm("Are you sure you want to delete this setting?")) {
      deleteSettingMutation.mutate(id);
    }
  };

  // Cancel editing or creating
  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setSelectedSetting(null);
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  // Render settings list for a specific group
  const renderSettingsList = (group: string) => {
    const groupSettings = groupedSettings[group] || [];
    
    if (groupSettings.length === 0) {
      return <p>No settings found in this group.</p>;
    }

    return (
      <div className="space-y-4">
        {groupSettings.map((setting) => (
          <Card key={setting.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between">
                {setting.label}
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditSetting(setting)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDeleteSetting(setting.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>{setting.key}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2">
                <strong>Value:</strong> {setting.value}
              </p>
              {setting.description && (
                <p className="text-sm text-gray-500">{setting.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Settings Management</h2>
        <Button onClick={handleCreateSetting}>Create New Setting</Button>
      </div>

      {isEditing && selectedSetting && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Setting: {selectedSetting.label}</CardTitle>
            <CardDescription>Update the value for this setting</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...updateForm}>
              <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
                <FormField
                  control={updateForm.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        {selectedSetting.type === "textarea" ? (
                          <Textarea placeholder="Enter value" {...field} />
                        ) : (
                          <Input placeholder="Enter value" {...field} />
                        )}
                      </FormControl>
                      <FormDescription>{selectedSetting.description}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateSettingMutation.isPending}
                  >
                    {updateSettingMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Setting</CardTitle>
            <CardDescription>Add a new configuration setting</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., daewa_tv_url" {...field} />
                        </FormControl>
                        <FormDescription>Unique identifier for the setting</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="label"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Label</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Daewa TV URL" {...field} />
                        </FormControl>
                        <FormDescription>Human-readable name</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={createForm.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter value" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="group"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="urls">URLs</option>
                            <option value="emails">Emails</option>
                            <option value="content">Content</option>
                            <option value="social">Social Media</option>
                            <option value="general">General</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="text">Text</option>
                            <option value="textarea">Textarea</option>
                            <option value="url">URL</option>
                            <option value="email">Email</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createSettingMutation.isPending}
                  >
                    {createSettingMutation.isPending ? "Creating..." : "Create Setting"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {!isEditing && !isCreating && (
        <Tabs defaultValue="urls" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="urls">URLs</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>
          
          <TabsContent value="urls" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">URL Settings</h3>
              <p className="text-sm text-gray-500">Configure external links and URLs</p>
            </div>
            {renderSettingsList("urls")}
          </TabsContent>
          
          <TabsContent value="emails" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Email Settings</h3>
              <p className="text-sm text-gray-500">Configure email addresses and notifications</p>
            </div>
            {renderSettingsList("emails")}
          </TabsContent>
          
          <TabsContent value="content" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Content Settings</h3>
              <p className="text-sm text-gray-500">Configure website content and display settings</p>
            </div>
            {renderSettingsList("content")}
          </TabsContent>
          
          <TabsContent value="social" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Social Media Settings</h3>
              <p className="text-sm text-gray-500">Configure social media links and profiles</p>
            </div>
            {renderSettingsList("social")}
          </TabsContent>
          
          <TabsContent value="general" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">General Settings</h3>
              <p className="text-sm text-gray-500">Configure general site settings</p>
            </div>
            {renderSettingsList("general")}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}