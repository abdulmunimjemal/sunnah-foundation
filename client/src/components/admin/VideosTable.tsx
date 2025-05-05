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

interface Video {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  views: number;
  date: string;
  category: string;
  isFeatured: boolean;
  isMainFeature: boolean;
}

interface VideosTableProps {
  videos: Video[];
  onEdit: (video: Video) => void;
}

export function VideosTable({ videos, onEdit }: VideosTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/videos/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/videos/featured'] });
      queryClient.invalidateQueries({ queryKey: ['/api/videos/main-feature'] });
      toast({
        title: "Success",
        description: "Video deleted successfully",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    }
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Function to extract YouTube ID from URL
  const getYoutubeEmbedUrl = (url: string) => {
    try {
      // Try to extract video ID from various YouTube URL formats
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      const videoId = (match && match[2].length === 11) ? match[2] : null;
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      } else {
        return url; // Return original URL if not a valid YouTube URL
      }
    } catch {
      return url;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                No videos found
              </TableCell>
            </TableRow>
          ) : (
            videos.map((video) => (
              <TableRow key={video.id} className="group">
                <TableCell>
                  <div className="h-12 w-20 rounded overflow-hidden">
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title} 
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/120x68?text=Video";
                      }}
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div>{video.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(video.date)} • {video.views} views
                  </div>
                </TableCell>
                <TableCell>{video.category}</TableCell>
                <TableCell>{video.duration}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {video.isMainFeature && (
                      <Badge className="bg-orange-500 hover:bg-orange-600">Main Feature</Badge>
                    )}
                    {video.isFeatured && !video.isMainFeature && (
                      <Badge>Featured</Badge>
                    )}
                    {!video.isFeatured && !video.isMainFeature && (
                      <Badge variant="outline">Standard</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpand(video.id)}
                    >
                      {expandedId === video.id ? "Collapse" : "Preview"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(video)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(video.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                  
                  {/* Expanded preview */}
                  {expandedId === video.id && (
                    <div className="mt-4 bg-muted/50 p-4 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="aspect-video rounded-md overflow-hidden">
                            <iframe 
                              src={getYoutubeEmbedUrl(video.videoUrl)} 
                              className="w-full h-full" 
                              allowFullScreen
                              frameBorder="0"
                              title={video.title}
                            />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-lg font-medium">{video.title}</h4>
                          <p className="text-muted-foreground text-sm mb-2">
                            {formatDate(video.date)} • {video.duration} • {video.views} views
                          </p>
                          <div className="text-sm">{video.description}</div>
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