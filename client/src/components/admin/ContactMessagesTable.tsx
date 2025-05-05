import { useState } from "react";
import { formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  newsletter: boolean;
  isRead: boolean;
  createdAt: string;
}

interface ContactMessagesTableProps {
  messages: ContactMessage[];
}

export function ContactMessagesTable({ messages }: ContactMessagesTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const markAsReadMutation = useMutation({
    mutationFn: ({ id, isRead }: { id: number; isRead: boolean }) => 
      apiRequest("PUT", `/api/contact/${id}/read`, { isRead }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contact'] });
      toast({
        title: "Success",
        description: "Message status updated",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/contact/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contact'] });
      toast({
        title: "Success",
        description: "Message deleted successfully",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  });

  const handleMarkAsRead = (id: number, isRead: boolean) => {
    markAsReadMutation.mutate({ id, isRead });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this message? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
    
    // Automatically mark as read when expanding
    const message = messages.find(m => m.id === id);
    if (message && !message.isRead) {
      handleMarkAsRead(id, true);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>From</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                No contact messages found
              </TableCell>
            </TableRow>
          ) : (
            messages.map((message) => (
              <TableRow key={message.id} className={`group ${!message.isRead ? 'bg-muted/30' : ''}`}>
                <TableCell>
                  <div className="font-medium">{message.name}</div>
                  <div className="text-xs text-muted-foreground">{message.email}</div>
                </TableCell>
                <TableCell className={!message.isRead ? 'font-medium' : ''}>
                  {message.subject}
                </TableCell>
                <TableCell>{formatDate(message.createdAt)}</TableCell>
                <TableCell>
                  {message.isRead ? (
                    <Badge variant="outline">Read</Badge>
                  ) : (
                    <Badge>Unread</Badge>
                  )}
                  {message.newsletter && (
                    <Badge variant="outline" className="ml-2 bg-primary/10">Newsletter</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpand(message.id)}
                    >
                      {expandedId === message.id ? "Collapse" : "Read"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(message.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                  
                  {/* Expanded message */}
                  {expandedId === message.id && (
                    <div className="mt-4 bg-muted/50 p-4 rounded-md text-left">
                      <div className="flex justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium">From: {message.name} &lt;{message.email}&gt;</p>
                          <p className="text-sm">Subject: {message.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            Received: {formatDate(message.createdAt)}
                          </p>
                        </div>
                        <div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleMarkAsRead(message.id, !message.isRead)}
                            disabled={markAsReadMutation.isPending}
                          >
                            Mark as {message.isRead ? 'Unread' : 'Read'}
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-background rounded">
                        <p className="whitespace-pre-wrap">{message.message}</p>
                      </div>
                      {message.newsletter && (
                        <div className="mt-3 text-sm text-muted-foreground">
                          <p>* This person has requested to be added to the newsletter.</p>
                        </div>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}