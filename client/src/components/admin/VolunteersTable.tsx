import { useState, useMemo } from "react";
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
import { TableFilter } from "@/components/ui/table-filter";
import { TablePagination } from "@/components/ui/table-pagination";
import { sortData, paginateData, calculateTotalPages } from "@/lib/tableFunctions";
import { Input } from "@/components/ui/input";
import { ArrowUpDown } from "lucide-react";

interface Volunteer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  areas: string[];
  availability: string[];
  message: string;
  status: string;
  createdAt: string;
}

interface VolunteersTableProps {
  volunteers: Volunteer[];
}

export function VolunteersTable({ volunteers }: VolunteersTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({
    key: "createdAt",
    direction: "desc"
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 10;

  // Get all unique areas from volunteer data
  const allAreas = useMemo(() => {
    const areas = new Set<string>();
    volunteers.forEach(volunteer => {
      volunteer.areas.forEach(area => areas.add(area));
    });
    return Array.from(areas);
  }, [volunteers]);

  // Get all unique availability options
  const allAvailability = useMemo(() => {
    const availability = new Set<string>();
    volunteers.forEach(volunteer => {
      volunteer.availability.forEach(time => availability.add(time));
    });
    return Array.from(availability);
  }, [volunteers]);

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "approved", label: "Approved" },
        { value: "pending", label: "Pending" },
        { value: "contacted", label: "Contacted" },
        { value: "rejected", label: "Rejected" }
      ]
    },
    {
      key: "area",
      label: "Area of Interest",
      type: "select" as const,
      options: allAreas.map(area => ({ value: area, label: area }))
    },
    {
      key: "availability",
      label: "Availability",
      type: "select" as const,
      options: allAvailability.map(time => ({ value: time, label: time }))
    }
  ];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest("PUT", `/api/volunteers/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/volunteers'] });
      toast({
        title: "Success",
        description: "Volunteer application status updated successfully",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update volunteer application status",
        variant: "destructive",
      });
    }
  });

  const handleStatusUpdate = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'contacted':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Contacted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const onFilterChange = (filterKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig && prevConfig.key === key) {
        return { key, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Apply filters, search, sort, and pagination
  const filteredData = useMemo(() => {
    let processed = [...volunteers];
    
    // Apply search query
    if (searchQuery) {
      processed = processed.filter(v => {
        const fullName = `${v.firstName} ${v.lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase()) || 
               v.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
               v.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
               v.message.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    // Apply status filter
    if (filters.status) {
      processed = processed.filter(v => v.status.toLowerCase() === filters.status.toLowerCase());
    }
    
    // Apply area filter
    if (filters.area) {
      processed = processed.filter(v => v.areas.includes(filters.area));
    }
    
    // Apply availability filter
    if (filters.availability) {
      processed = processed.filter(v => v.availability.includes(filters.availability));
    }
    
    // Apply sorting
    if (sortConfig) {
      processed = sortData(processed, sortConfig);
    }
    
    return processed;
  }, [volunteers, searchQuery, filters, sortConfig]);
  
  // Apply pagination
  const paginatedData = useMemo(() => {
    return paginateData(filteredData, { currentPage, pageSize });
  }, [filteredData, currentPage, pageSize]);
  
  const totalPages = calculateTotalPages(filteredData.length, pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <Input
          placeholder="Search by name, email, phone or message..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-sm"
        />
        
        <TableFilter
          filterOptions={filterOptions}
          filters={filters}
          onFilterChange={onFilterChange}
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('firstName')} className="cursor-pointer">
                Applicant <ArrowUpDown className="ml-1 h-4 w-4 inline" />
              </TableHead>
              <TableHead onClick={() => handleSort('email')} className="cursor-pointer">
                Contact <ArrowUpDown className="ml-1 h-4 w-4 inline" />
              </TableHead>
              <TableHead onClick={() => handleSort('createdAt')} className="cursor-pointer">
                Date <ArrowUpDown className="ml-1 h-4 w-4 inline" />
              </TableHead>
              <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                Status <ArrowUpDown className="ml-1 h-4 w-4 inline" />
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                  No volunteer applications found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((volunteer) => (
                <TableRow key={volunteer.id} className="group">
                  <TableCell>
                    <div className="font-medium">{volunteer.firstName} {volunteer.lastName}</div>
                  </TableCell>
                  <TableCell>
                    <div>{volunteer.email}</div>
                    <div className="text-xs text-muted-foreground">{volunteer.phone}</div>
                  </TableCell>
                  <TableCell>{formatDate(volunteer.createdAt)}</TableCell>
                  <TableCell>{getStatusBadge(volunteer.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExpand(volunteer.id)}
                      >
                        {expandedId === volunteer.id ? "Collapse" : "Details"}
                      </Button>
                    </div>
                    
                    {/* Expanded details */}
                    {expandedId === volunteer.id && (
                      <div className="mt-4 bg-muted/50 p-4 rounded-md text-left">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">Volunteer Information:</p>
                            <p className="text-sm">{volunteer.firstName} {volunteer.lastName}</p>
                            <p className="text-sm">Email: {volunteer.email}</p>
                            <p className="text-sm">Phone: {volunteer.phone}</p>
                          </div>
                          <div>
                            <div>
                              <p className="text-sm font-medium">Areas of Interest:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {volunteer.areas.map((area, index) => (
                                  <Badge key={index} variant="outline">{area}</Badge>
                                ))}
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="text-sm font-medium">Availability:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {volunteer.availability.map((time, index) => (
                                  <Badge key={index} variant="outline">{time}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-sm font-medium">Message:</p>
                          <p className="text-sm bg-background p-2 rounded mt-1">{volunteer.message}</p>
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-sm font-medium">Update Status:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Button 
                              size="sm" 
                              variant={volunteer.status === 'approved' ? 'default' : 'outline'}
                              onClick={() => handleStatusUpdate(volunteer.id, 'approved')}
                              disabled={updateStatusMutation.isPending}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm"
                              variant={volunteer.status === 'pending' ? 'default' : 'outline'}
                              onClick={() => handleStatusUpdate(volunteer.id, 'pending')}
                              disabled={updateStatusMutation.isPending}
                            >
                              Pending
                            </Button>
                            <Button 
                              size="sm"
                              variant={volunteer.status === 'contacted' ? 'default' : 'outline'}
                              onClick={() => handleStatusUpdate(volunteer.id, 'contacted')}
                              disabled={updateStatusMutation.isPending}
                            >
                              Contacted
                            </Button>
                            <Button 
                              size="sm"
                              variant={volunteer.status === 'rejected' ? 'default' : 'outline'}
                              onClick={() => handleStatusUpdate(volunteer.id, 'rejected')}
                              disabled={updateStatusMutation.isPending}
                            >
                              Reject
                            </Button>
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
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {paginatedData.length} of {filteredData.length} volunteers
        </div>
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}