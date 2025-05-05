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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface TeamMember {
  id: number;
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
  isLeadership: boolean;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

interface TeamMembersTableProps {
  members: TeamMember[];
  onEdit: (member: TeamMember) => void;
}

export function TeamMembersTable({ members, onEdit }: TeamMembersTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/team/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/team/leadership'] });
      toast({
        title: "Success",
        description: "Team member deleted successfully",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete team member",
        variant: "destructive",
      });
    }
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this team member? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                No team members found
              </TableCell>
            </TableRow>
          ) : (
            members.map((member) => (
              <TableRow key={member.id} className="group">
                <TableCell>
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    <img 
                      src={member.imageUrl} 
                      alt={member.name} 
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/100?text=?";
                      }}
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.title}</TableCell>
                <TableCell>
                  {member.isLeadership ? (
                    <Badge variant="default">Leadership</Badge>
                  ) : (
                    <Badge variant="outline">Staff</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpand(member.id)}
                    >
                      {expandedId === member.id ? "Collapse" : "Preview"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(member)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(member.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                  
                  {/* Expanded preview */}
                  {expandedId === member.id && (
                    <div className="mt-4 bg-muted/50 p-4 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden">
                            <img 
                              src={member.imageUrl} 
                              alt={member.name} 
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/200?text=Profile+Not+Found";
                              }}
                            />
                          </div>
                          <div className="mt-3 text-center">
                            <p className="text-sm font-medium">Social Links:</p>
                            <div className="flex justify-center space-x-2 mt-1">
                              {member.socialLinks.linkedin && (
                                <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                  <i className="fab fa-linkedin text-lg"></i>
                                </a>
                              )}
                              {member.socialLinks.twitter && (
                                <a href={member.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
                                  <i className="fab fa-twitter text-lg"></i>
                                </a>
                              )}
                              {member.socialLinks.email && (
                                <a href={`mailto:${member.socialLinks.email}`} className="text-gray-600 hover:text-gray-800">
                                  <i className="fas fa-envelope text-lg"></i>
                                </a>
                              )}
                              {!member.socialLinks.linkedin && !member.socialLinks.twitter && !member.socialLinks.email && (
                                <span className="text-muted-foreground text-sm">None provided</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <h4 className="text-lg font-medium">{member.name}</h4>
                          <p className="text-muted-foreground mb-2">{member.title}</p>
                          <div className="text-sm">{member.bio}</div>
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