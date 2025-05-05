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

interface UniversityCourse {
  id: number;
  title: string;
  description: string;
  level: string;
  duration: string;
  instructors: string[];
  imageUrl: string;
}

interface UniversityCoursesTableProps {
  courses: UniversityCourse[];
  onEdit: (course: UniversityCourse) => void;
}

export function UniversityCoursesTable({ courses, onEdit }: UniversityCoursesTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/university/courses/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/university/courses'] });
      toast({
        title: "Success",
        description: "Course deleted successfully",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      });
    }
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
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
            <TableHead className="w-[250px]">Course Title</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                No courses found
              </TableCell>
            </TableRow>
          ) : (
            courses.map((course) => (
              <TableRow key={course.id} className="group">
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell>{course.level}</TableCell>
                <TableCell>{course.duration}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpand(course.id)}
                    >
                      {expandedId === course.id ? "Collapse" : "Preview"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(course)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(course.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                  
                  {/* Expanded preview */}
                  {expandedId === course.id && (
                    <div className="mt-4 bg-muted/50 p-4 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                          <div className="aspect-video rounded-md overflow-hidden">
                            <img 
                              src={course.imageUrl} 
                              alt={course.title} 
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x225?text=Image+Not+Found";
                              }}
                            />
                          </div>
                          <div className="mt-3">
                            <h5 className="text-sm font-medium">Instructors:</h5>
                            <ul className="list-disc list-inside text-sm text-muted-foreground">
                              {course.instructors.map((instructor, index) => (
                                <li key={index}>{instructor}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <h4 className="text-lg font-medium">{course.title}</h4>
                          <div className="flex space-x-4 text-sm text-muted-foreground mb-2">
                            <span><strong>Level:</strong> {course.level}</span>
                            <span><strong>Duration:</strong> {course.duration}</span>
                          </div>
                          <div className="text-sm">{course.description}</div>
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