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
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface NewsletterSubscriber {
  id: number;
  email: string;
  createdAt: string;
}

interface NewsletterSubscribersTableProps {
  subscribers: NewsletterSubscriber[];
}

export function NewsletterSubscribersTable({ subscribers }: NewsletterSubscribersTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSubscribers, setSelectedSubscribers] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/newsletter/subscribers/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/newsletter/subscribers'] });
      toast({
        title: "Success",
        description: "Subscriber removed successfully",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove subscriber",
        variant: "destructive",
      });
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => apiRequest("DELETE", `/api/newsletter/subscribers/bulk`, { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/newsletter/subscribers'] });
      toast({
        title: "Success",
        description: "Selected subscribers removed successfully",
        variant: "default",
      });
      setSelectedSubscribers([]);
      setSelectAll(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove subscribers",
        variant: "destructive",
      });
    }
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to remove this subscriber? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleBulkDelete = () => {
    if (selectedSubscribers.length === 0) return;
    
    if (confirm(`Are you sure you want to remove ${selectedSubscribers.length} subscribers? This action cannot be undone.`)) {
      bulkDeleteMutation.mutate(selectedSubscribers);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(subscribers.map(s => s.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectSubscriber = (id: number) => {
    setSelectedSubscribers(prev => {
      if (prev.includes(id)) {
        return prev.filter(s => s !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Function to export the subscribers list
  const exportSubscribers = () => {
    // Create CSV content
    const headers = ["Email", "Subscribed Date"];
    const csvContent = 
      headers.join(",") + "\n" + 
      subscribers.map(s => {
        return `${s.email},${new Date(s.createdAt).toLocaleDateString()}`;
      }).join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-sm text-muted-foreground">{subscribers.length} subscribers total</span>
        </div>
        <div className="flex space-x-2">
          {selectedSubscribers.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending 
                ? "Removing..." 
                : `Remove Selected (${selectedSubscribers.length})`}
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={exportSubscribers}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <input 
                  type="checkbox" 
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subscribed Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                  No newsletter subscribers found
                </TableCell>
              </TableRow>
            ) : (
              subscribers.map((subscriber) => (
                <TableRow key={subscriber.id} className="group">
                  <TableCell>
                    <input 
                      type="checkbox" 
                      checked={selectedSubscribers.includes(subscriber.id)}
                      onChange={() => toggleSelectSubscriber(subscriber.id)}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{subscriber.email}</TableCell>
                  <TableCell>{formatDate(subscriber.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(subscriber.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? "Removing..." : "Remove"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}