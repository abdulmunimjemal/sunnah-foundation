import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash, CheckCircle, UserMinus, ArrowUpDown } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { TablePagination } from "@/components/ui/table-pagination";
import { sortData, paginateData, calculateTotalPages } from "@/lib/tableFunctions";
import { Input } from "@/components/ui/input";

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
  const [selectedSubscriber, setSelectedSubscriber] = useState<NewsletterSubscriber | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedSubscribers, setSelectedSubscribers] = useState<number[]>([]);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({
    key: "createdAt",
    direction: "desc"
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const deleteSubscriberMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/newsletter/subscribers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsletter/subscribers"] });
      toast({
        title: "Success",
        description: "Subscriber removed successfully",
      });
      setConfirmDelete(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove subscriber",
        variant: "destructive",
      });
      console.error("Error removing subscriber:", error);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) =>
      apiRequest("DELETE", `/api/newsletter/subscribers/bulk`, { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsletter/subscribers"] });
      toast({
        title: "Success",
        description: `${selectedSubscribers.length} subscribers removed successfully`,
      });
      setSelectedSubscribers([]);
      setConfirmBulkDelete(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove subscribers",
        variant: "destructive",
      });
      console.error("Error removing subscribers:", error);
    },
  });

  const handleDelete = (subscriber: NewsletterSubscriber) => {
    setSelectedSubscriber(subscriber);
    setConfirmDelete(true);
  };

  const confirmDeleteSubscriber = () => {
    if (selectedSubscriber) {
      deleteSubscriberMutation.mutate(selectedSubscriber.id);
    }
  };

  const handleBulkDelete = () => {
    if (selectedSubscribers.length > 0) {
      setConfirmBulkDelete(true);
    } else {
      toast({
        title: "No subscribers selected",
        description: "Please select at least one subscriber to remove",
        variant: "destructive",
      });
    }
  };

  const confirmBulkDeleteSubscribers = () => {
    if (selectedSubscribers.length > 0) {
      bulkDeleteMutation.mutate(selectedSubscribers);
    }
  };

  const toggleSelectAll = () => {
    if (selectedSubscribers.length === filteredData.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(filteredData.map(subscriber => subscriber.id));
    }
  };

  const toggleSelectSubscriber = (id: number) => {
    if (selectedSubscribers.includes(id)) {
      setSelectedSubscribers(selectedSubscribers.filter(subscriberId => subscriberId !== id));
    } else {
      setSelectedSubscribers([...selectedSubscribers, id]);
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig && prevConfig.key === key) {
        return { key, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Apply filtering, sorting, and pagination
  const filteredData = useMemo(() => {
    let processed = [...subscribers];
    
    // Filter by email search
    if (searchQuery) {
      processed = processed.filter(s => 
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    if (sortConfig) {
      processed = sortData(processed, sortConfig);
    }
    
    return processed;
  }, [subscribers, searchQuery, sortConfig]);
  
  // Apply pagination
  const paginatedData = useMemo(() => {
    return paginateData(filteredData, { currentPage, pageSize });
  }, [filteredData, currentPage, pageSize]);
  
  const totalPages = calculateTotalPages(filteredData.length, pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <Input
          placeholder="Search by email..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-sm"
        />
      </div>

      {filteredData.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="selectAll"
              checked={selectedSubscribers.length === filteredData.length && filteredData.length > 0}
              onCheckedChange={toggleSelectAll}
            />
            <label htmlFor="selectAll" className="text-sm font-medium">
              Select All ({filteredData.length})
            </label>
          </div>
          {selectedSubscribers.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <UserMinus className="mr-2 h-4 w-4" />
              Remove Selected ({selectedSubscribers.length})
            </Button>
          )}
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead onClick={() => handleSort('email')} className="cursor-pointer">
                Email <ArrowUpDown className="ml-1 h-4 w-4 inline" />
              </TableHead>
              <TableHead onClick={() => handleSort('createdAt')} className="cursor-pointer w-[150px]">
                Subscribed On <ArrowUpDown className="ml-1 h-4 w-4 inline" />
              </TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No newsletter subscribers found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedSubscribers.includes(subscriber.id)}
                      onCheckedChange={() => toggleSelectSubscriber(subscriber.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{subscriber.email}</TableCell>
                  <TableCell>{formatDate(subscriber.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(subscriber)}
                      title="Remove subscriber"
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {paginatedData.length} of {filteredData.length} subscribers
          </div>
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Individual Delete confirmation dialog */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Subscriber</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedSubscriber?.email} from the newsletter? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteSubscriber}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete confirmation dialog */}
      <AlertDialog open={confirmBulkDelete} onOpenChange={setConfirmBulkDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Multiple Subscribers</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedSubscribers.length} subscribers from the newsletter? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmBulkDeleteSubscribers}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}