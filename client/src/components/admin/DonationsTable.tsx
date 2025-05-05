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
import { filterData, sortData, paginateData, calculateTotalPages } from "@/lib/tableFunctions";
import { Input } from "@/components/ui/input";
import { ArrowUpDown } from "lucide-react";

interface Donation {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  amount: number;
  paymentMethod: string;
  recurring: boolean;
  transactionId?: string;
  status: string;
  createdAt: string;
}

interface DonationsTableProps {
  donations: Donation[];
}

export function DonationsTable({ donations }: DonationsTableProps) {
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

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "completed", label: "Completed" },
        { value: "pending", label: "Pending" },
        { value: "failed", label: "Failed" },
        { value: "refunded", label: "Refunded" }
      ]
    },
    {
      key: "recurring",
      label: "Type",
      type: "select" as const,
      options: [
        { value: "true", label: "Recurring" },
        { value: "false", label: "One-time" }
      ]
    }
  ];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest("PUT", `/api/donations/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/donations'] });
      toast({
        title: "Success",
        description: "Donation status updated successfully",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update donation status",
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

  // Format amount to currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Refunded</Badge>;
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
    let processed = [...donations];
    
    // Apply search query
    if (searchQuery) {
      processed = processed.filter(d => {
        const fullName = `${d.firstName} ${d.lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase()) || 
               d.email.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    // Apply filters for status and recurring
    if (filters.status) {
      processed = processed.filter(d => d.status.toLowerCase() === filters.status.toLowerCase());
    }
    
    if (filters.recurring) {
      processed = processed.filter(d => d.recurring === (filters.recurring === 'true'));
    }
    
    // Apply sorting
    if (sortConfig) {
      processed = sortData(processed, sortConfig);
    }
    
    return processed;
  }, [donations, searchQuery, filters, sortConfig]);
  
  // Apply pagination
  const paginatedData = useMemo(() => {
    return paginateData(filteredData, { currentPage, pageSize });
  }, [filteredData, currentPage, pageSize]);
  
  const totalPages = calculateTotalPages(filteredData.length, pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <Input
          placeholder="Search by name or email..."
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
                Donor <ArrowUpDown className="ml-1 h-4 w-4 inline" />
              </TableHead>
              <TableHead onClick={() => handleSort('amount')} className="cursor-pointer">
                Amount <ArrowUpDown className="ml-1 h-4 w-4 inline" />
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
                  No donations found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((donation) => (
                <TableRow key={donation.id} className="group">
                  <TableCell>
                    <div className="font-medium">{donation.firstName} {donation.lastName}</div>
                    <div className="text-xs text-muted-foreground">{donation.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatCurrency(donation.amount)}</div>
                    {donation.recurring && (
                      <div className="text-xs text-muted-foreground">Recurring</div>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(donation.createdAt)}</TableCell>
                  <TableCell>{getStatusBadge(donation.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleExpand(donation.id)}
                      >
                        {expandedId === donation.id ? "Collapse" : "Details"}
                      </Button>
                    </div>
                    
                    {/* Expanded details */}
                    {expandedId === donation.id && (
                      <div className="mt-4 bg-muted/50 p-4 rounded-md text-left">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm font-medium">Donor Information:</p>
                            <p className="text-sm">{donation.firstName} {donation.lastName}</p>
                            <p className="text-sm">{donation.email}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Payment Details:</p>
                            <p className="text-sm">Amount: {formatCurrency(donation.amount)}</p>
                            <p className="text-sm">Method: {donation.paymentMethod}</p>
                            <p className="text-sm">Type: {donation.recurring ? 'Recurring' : 'One-time'}</p>
                            {donation.transactionId && (
                              <p className="text-sm">Transaction ID: {donation.transactionId}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-sm font-medium">Update Status:</p>
                          <div className="flex flex-wrap space-x-2 mt-1">
                            <Button 
                              size="sm" 
                              variant={donation.status === 'completed' ? 'default' : 'outline'}
                              onClick={() => handleStatusUpdate(donation.id, 'completed')}
                              disabled={updateStatusMutation.isPending}
                            >
                              Completed
                            </Button>
                            <Button 
                              size="sm"
                              variant={donation.status === 'pending' ? 'default' : 'outline'}
                              onClick={() => handleStatusUpdate(donation.id, 'pending')}
                              disabled={updateStatusMutation.isPending}
                            >
                              Pending
                            </Button>
                            <Button 
                              size="sm"
                              variant={donation.status === 'failed' ? 'default' : 'outline'}
                              onClick={() => handleStatusUpdate(donation.id, 'failed')}
                              disabled={updateStatusMutation.isPending}
                            >
                              Failed
                            </Button>
                            <Button 
                              size="sm"
                              variant={donation.status === 'refunded' ? 'default' : 'outline'}
                              onClick={() => handleStatusUpdate(donation.id, 'refunded')}
                              disabled={updateStatusMutation.isPending}
                            >
                              Refunded
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
          Showing {paginatedData.length} of {filteredData.length} donations
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