import { useState } from "react";
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

interface HistoryEvent {
  id: number;
  year: number;
  title: string;
  description: string;
  imageUrl?: string;
  sortOrder: number;
}

interface HistoryEventsTableProps {
  events: HistoryEvent[];
  onEdit: (event: HistoryEvent) => void;
}

export function HistoryEventsTable({ events, onEdit }: HistoryEventsTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/about/history/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/about/history'] });
      toast({
        title: "Success",
        description: "History event deleted successfully",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete history event",
        variant: "destructive",
      });
    }
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this history event? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Sort events by sortOrder and then by year
  const sortedEvents = [...events].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return a.year - b.year;
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Year</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedEvents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                No history events found
              </TableCell>
            </TableRow>
          ) : (
            sortedEvents.map((event) => (
              <TableRow key={event.id} className="group">
                <TableCell className="font-medium">{event.year}</TableCell>
                <TableCell>{event.sortOrder}</TableCell>
                <TableCell>{event.title}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpand(event.id)}
                    >
                      {expandedId === event.id ? "Collapse" : "Preview"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(event)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                  
                  {/* Expanded preview */}
                  {expandedId === event.id && (
                    <div className="mt-4 bg-muted/50 p-4 rounded-md">
                      <div className="grid grid-cols-1 gap-4">
                        {event.imageUrl && (
                          <div>
                            <div className="aspect-video rounded-md overflow-hidden max-w-md mx-auto">
                              <img 
                                src={event.imageUrl} 
                                alt={event.title} 
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x225?text=Image+Not+Found";
                                }}
                              />
                            </div>
                          </div>
                        )}
                        <div>
                          <h4 className="text-lg font-medium">{event.year}: {event.title}</h4>
                          <div className="text-sm mt-2">{event.description}</div>
                        </div>
                      </div>
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