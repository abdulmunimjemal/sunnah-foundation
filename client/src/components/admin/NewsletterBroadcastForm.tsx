import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, MailIcon, SendIcon } from "lucide-react";
import { askSecrets } from "@/lib/askForSecret";

// Define form schema with Zod
const formSchema = z.object({
  subject: z.string().min(5, { message: "Subject must be at least 5 characters" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
  testEmail: z.string().email({ message: "Please enter a valid email address" }).optional().or(z.literal("")),
  sendToAll: z.boolean().default(false),
});

// Define props interface
interface NewsletterBroadcastFormProps {
  subscriberCount: number;
}

// Form component
export default function NewsletterBroadcastForm({ subscriberCount }: NewsletterBroadcastFormProps) {
  const { toast } = useToast();
  const [isSendingToAll, setIsSendingToAll] = useState(false);
  const [activeTab, setActiveTab] = useState("compose");

  // Set up form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      content: "",
      testEmail: "",
      sendToAll: false,
    },
  });

  const resetForm = () => {
    form.reset({
      subject: "",
      content: "",
      testEmail: "",
      sendToAll: false,
    });
    setIsSendingToAll(false);
    setActiveTab("compose");
  };

  // Broadcast newsletter mutation
  const broadcastMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return apiRequest("POST", "/api/newsletter/broadcast", data);
    },
    onSuccess: (data) => {
      const mode = data.testMode ? "Test email" : "Newsletter";
      toast({
        title: `${mode} sent successfully`,
        description: data.message,
        variant: "default",
      });
      resetForm();
    },
    onError: (error: any) => {
      console.error("Newsletter broadcast error:", error);
      const errorMsg = error?.message || "Unknown error";
      
      // Check for API key missing error
      if (errorMsg.includes("API key") || error?.status === 503) {
        toast({
          title: "SendGrid API Key Missing",
          description: "The SendGrid API key is missing. Please set it up to enable email functionality.",
          variant: "destructive",
        });
        
        // Ask for SendGrid API key
        askSecrets(["SENDGRID_API_KEY"], "To enable email broadcasting, please provide your SendGrid API key.");
      } else {
        toast({
          title: "Error",
          description: `Failed to send newsletter: ${errorMsg}`,
          variant: "destructive",
        });
      }
    },
  });

  // Form submission handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    // If sendToAll is checked, confirm with the user
    if (values.sendToAll && !isSendingToAll) {
      setIsSendingToAll(true);
      return;
    }
    
    // Reset confirmation if user is sending a test email
    if (!values.sendToAll) {
      setIsSendingToAll(false);
    }
    
    // Check if test email is provided or sendToAll is true
    if ((!values.testEmail || values.testEmail.trim() === "") && !values.sendToAll) {
      toast({
        title: "Invalid Form",
        description: "Please enter a test email address or select 'Send to all subscribers'",
        variant: "destructive",
      });
      return;
    }
    
    broadcastMutation.mutate(values);
  }

  const preview = {
    subject: form.watch("subject"),
    content: form.watch("content"),
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-secondary">Broadcast Newsletter</h2>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">{subscriberCount}</span> subscribers
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="compose">
            <MailIcon className="h-4 w-4 mr-2" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="preview">
            <InfoIcon className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="compose">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Newsletter subject" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      The subject line of your newsletter email.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your newsletter content here..."
                        rows={10}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The content of your newsletter. Basic formatting is supported.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="testEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Email (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="test@example.com" 
                        type="email"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Send a test email to this address before broadcasting to all subscribers.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sendToAll"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Send to all subscribers</FormLabel>
                      <FormDescription>
                        Check this to broadcast the newsletter to all {subscriberCount} subscribers.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              {isSendingToAll && (
                <Alert variant="destructive" className="my-4">
                  <AlertTitle>Warning: You are about to email {subscriberCount} subscribers</AlertTitle>
                  <AlertDescription>
                    This action cannot be undone. Are you sure you want to continue?
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("preview")}
                >
                  Preview
                </Button>
                <Button
                  type="submit"
                  disabled={broadcastMutation.isPending}
                >
                  {broadcastMutation.isPending ? (
                    <>Sending...</>
                  ) : isSendingToAll ? (
                    <>Confirm Send</>
                  ) : (
                    <>
                      <SendIcon className="h-4 w-4 mr-2" />
                      {form.watch("testEmail") && !form.watch("sendToAll") ? "Send Test" : "Send Newsletter"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="preview">
          <div className="space-y-6">
            <div className="border rounded-md p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">SUBJECT</h3>
                <p className="text-lg font-medium">{preview.subject || "No subject"}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">CONTENT</h3>
                <div className="prose max-w-none border-t pt-4">
                  {preview.content ? (
                    preview.content.split('\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))
                  ) : (
                    <p className="text-muted-foreground italic">No content</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="default" 
                onClick={() => setActiveTab("compose")}
              >
                Back to Editor
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}