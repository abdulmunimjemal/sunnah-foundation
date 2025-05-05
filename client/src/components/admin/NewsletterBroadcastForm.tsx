import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MailIcon, SendIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface NewsletterBroadcastFormProps {
  subscriberCount: number;
}

const broadcastSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
});

type BroadcastFormData = z.infer<typeof broadcastSchema>;

export default function NewsletterBroadcastForm({ subscriberCount }: NewsletterBroadcastFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const { toast } = useToast();

  const form = useForm<BroadcastFormData>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: {
      subject: "",
      content: "",
    },
  });

  const broadcastMutation = useMutation({
    mutationFn: async (data: BroadcastFormData) => {
      // Add the sendToAll parameter to send to all subscribers
      return apiRequest("POST", "/api/newsletter/broadcast", {
        ...data,
        sendToAll: true
      });
    },
    onMutate: () => {
      setStatus("sending");
    },
    onSuccess: () => {
      setStatus("success");
      form.reset();
      toast({
        title: "Newsletter Sent",
        description: `Successfully sent newsletter to ${subscriberCount} subscribers.`,
        variant: "default",
      });
    },
    onError: (error) => {
      setStatus("error");
      toast({
        title: "Error",
        description: "Failed to send newsletter. Please try again.",
        variant: "destructive",
      });
      console.error("Broadcast error:", error);
    },
  });

  const onSubmit = (data: BroadcastFormData) => {
    broadcastMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MailIcon className="mr-2 h-5 w-5" />
          Send Newsletter
        </CardTitle>
        <CardDescription>
          Compose and send a newsletter to all {subscriberCount} subscribers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {subscriberCount === 0 ? (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>No subscribers</AlertTitle>
            <AlertDescription>
              There are no subscribers to send a newsletter to. Add subscribers first before sending a newsletter.
            </AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Line</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter newsletter subject" {...field} />
                    </FormControl>
                    <FormDescription>
                      Create a compelling subject line to improve open rates
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
                    <FormLabel>Email Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your newsletter content here..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Text-only content for now. HTML formatting coming soon.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {status === "success" && (
                <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                  <AlertTitle>Newsletter sent successfully!</AlertTitle>
                  <AlertDescription>
                    Your newsletter has been sent to all {subscriberCount} subscribers.
                  </AlertDescription>
                </Alert>
              )}

              {status === "error" && (
                <Alert variant="destructive">
                  <AlertTitle>Failed to send newsletter</AlertTitle>
                  <AlertDescription>
                    There was an error sending your newsletter. Please try again or contact support.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={broadcastMutation.isPending || status === "success" || subscriberCount === 0}
                className="w-full sm:w-auto"
              >
                {broadcastMutation.isPending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <SendIcon className="mr-2 h-4 w-4" />
                    Send to {subscriberCount} {subscriberCount === 1 ? "Subscriber" : "Subscribers"}
                  </>
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}