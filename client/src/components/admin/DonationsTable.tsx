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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Donor</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {donations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                No donations found
              </TableCell>
            </TableRow>
          ) : (
            donations.map((donation) => (
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
                        <div className="flex space-x-2 mt-1">
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
  );
}