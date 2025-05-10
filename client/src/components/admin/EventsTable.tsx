import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TableFilter } from "@/components/ui/table-filter";
import { TablePagination } from "@/components/ui/table-pagination";
import { filterData, paginateData } from "@/lib/tableFunctions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon, MapPinIcon, PlusIcon } from "lucide-react";

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  registrationLink: string | null;
  isPast: boolean;
  createdAt: string;
}

interface EventsTableProps {
  events: Event[];
  onEdit: (event: Event) => void;
}

export function EventsTable({ events, onEdit }: EventsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filtering and pagination state
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Format date to display nicely
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  // Apply filtering and pagination
  const filteredEvents = useMemo(() => {
    return filterData<Event>(
      events,
      searchText,
      filters,
      ["title", "description", "location"]
    );
  }, [events, searchText, filters]);

  const paginatedEvents = useMemo(() => {
    return paginateData<Event>(filteredEvents, { currentPage, pageSize });
  }, [filteredEvents, currentPage, pageSize]);

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/events/${id}`, null);
    },
    onSuccess: () => {
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/past'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was a problem deleting the event.",
        variant: "destructive",
      });
      console.error("Delete event error:", error);
    }
  });

  const handleDelete = (event: Event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      deleteEventMutation.mutate(eventToDelete.id);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    if (key === "search") {
      setSearchText(value);
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: value
      }));
    }
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  // Define filter options
  const filterOptions = {
    status: [
      { label: "Upcoming", value: "upcoming" },
      { label: "Past", value: "past" }
    ],
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <TableFilter
          onFilterChange={handleFilterChange}
          filterOptions={filterOptions}
          placeholderText="Search events..."
          className="w-full md:w-auto"
        />
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {events.length === 0 
                    ? "No events found. Click the 'Add Event' button to create a new event."
                    : "No events matching the current filters."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">
                    {event.title}
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {event.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center text-sm mt-1">
                      <ClockIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                      {event.time}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <MapPinIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                      {event.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    {event.isPast ? (
                      <Badge variant="outline" className="bg-gray-100 text-gray-700">
                        Past
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        Upcoming
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(event)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        onClick={() => handleDelete(event)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {filteredEvents.length > 0 && (
          <div className="px-4">
            <TablePagination
              currentPage={currentPage}
              totalItems={filteredEvents.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{eventToDelete?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteEventMutation.isPending}
            >
              {deleteEventMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}