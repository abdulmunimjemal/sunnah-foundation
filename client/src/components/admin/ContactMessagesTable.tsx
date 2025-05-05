import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Trash, Mail, MailOpen } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

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
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const markAsReadMutation = useMutation({
    mutationFn: ({ id, isRead }: { id: number; isRead: boolean }) =>
      apiRequest("PUT", `/api/contact/${id}/read`, { isRead }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact"] });
      toast({
        title: "Success",
        description: "Message status updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive",
      });
      console.error("Error updating message status:", error);
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/contact/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact"] });
      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
      setConfirmDelete(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
      console.error("Error deleting message:", error);
    },
  });

  const handleMarkAsRead = (message: ContactMessage) => {
    markAsReadMutation.mutate({ id: message.id, isRead: !message.isRead });
  };

  const handleDelete = (message: ContactMessage) => {
    setSelectedMessage(message);
    setConfirmDelete(true);
  };

  const handleViewDetails = (message: ContactMessage) => {
    setSelectedMessage(message);
    setShowDetails(true);
    
    // If message is unread, mark it as read when viewed
    if (!message.isRead) {
      markAsReadMutation.mutate({ id: message.id, isRead: true });
    }
  };

  const confirmDeleteMessage = () => {
    if (selectedMessage) {
      deleteMessageMutation.mutate(selectedMessage.id);
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No contact messages found
              </TableCell>
            </TableRow>
          )}
          {messages.map((message) => (
            <TableRow key={message.id} className={!message.isRead ? "bg-muted/30" : ""}>
              <TableCell className="font-medium">
                {formatDate(message.createdAt)}
              </TableCell>
              <TableCell>{message.name}</TableCell>
              <TableCell>{message.email}</TableCell>
              <TableCell>{message.subject}</TableCell>
              <TableCell>
                <Badge variant={message.isRead ? "outline" : "default"}>
                  {message.isRead ? "Read" : "Unread"}
                </Badge>
                {message.newsletter && (
                  <Badge variant="secondary" className="ml-2">
                    Newsletter
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewDetails(message)}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleMarkAsRead(message)}>
                      {message.isRead ? (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Mark as Unread
                        </>
                      ) : (
                        <>
                          <MailOpen className="mr-2 h-4 w-4" />
                          Mark as Read
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(message)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Message details dialog */}
      <AlertDialog open={showDetails} onOpenChange={setShowDetails}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedMessage?.subject}
              {selectedMessage?.newsletter && (
                <Badge variant="secondary" className="ml-2">
                  Newsletter Subscriber
                </Badge>
              )}
            </AlertDialogTitle>
            <div className="text-sm text-muted-foreground">
              From: {selectedMessage?.name} &lt;{selectedMessage?.email}&gt; | 
              {formatDate(selectedMessage?.createdAt || "")}
            </div>
          </AlertDialogHeader>
          <div className="mt-4 max-h-[300px] overflow-y-auto border rounded-md p-4 whitespace-pre-wrap">
            {selectedMessage?.message}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => {
                if (selectedMessage) {
                  handleMarkAsRead(selectedMessage);
                }
              }}
            >
              {selectedMessage?.isRead ? (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Mark as Unread
                </>
              ) : (
                <>
                  <MailOpen className="mr-2 h-4 w-4" />
                  Mark as Read
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowDetails(false);
                if (selectedMessage) {
                  handleDelete(selectedMessage);
                }
              }}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMessage}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}