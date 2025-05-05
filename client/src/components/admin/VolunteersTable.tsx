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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {volunteers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                No volunteer applications found
              </TableCell>
            </TableRow>
          ) : (
            volunteers.map((volunteer) => (
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
  );
}