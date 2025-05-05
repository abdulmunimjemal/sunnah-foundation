import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { formatDate, cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Heart, Share2, ThumbsUp } from "lucide-react";

// Interface for article data
interface ArticleData {
  article: {
    id: number;
    title: string;
    content: string;
    excerpt: string;
    date: string;
    author: string;
    imageUrl: string;
    category: string;
    slug: string;
  };
  comments: Comment[];
  likeCount: number;
}

// Interface for comment data
interface Comment {
  id: number;
  articleId: number;
  name: string;
  email: string;
  content: string;
  parentId: number | null;
  isApproved: boolean;
  createdAt: string;
  replies?: Comment[];
}

// Comment form schema
const commentFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  content: z.string().min(3, "Comment must be at least 3 characters"),
  parentId: z.number().optional(),
});

type CommentFormValues = z.infer<typeof commentFormSchema>;

// Like form schema
const likeFormSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type LikeFormValues = z.infer<typeof likeFormSchema>;

const NewsDetailPage = () => {
  const { slug } = useParams();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [likeEmail, setLikeEmail] = useState<string>(localStorage.getItem("userEmail") || "");
  const [userLiked, setUserLiked] = useState<boolean>(false);
  const [showLikeForm, setShowLikeForm] = useState<boolean>(false);
  
  // Set page title
  useEffect(() => {
    document.title = "Article - Sunnah Foundation";
  }, []);

  // Fetch article data
  const { data, isLoading, error } = useQuery<ArticleData>({
    queryKey: ['/api/news', slug],
    enabled: !!slug,
  });

  // Check if user has liked the article
  useEffect(() => {
    if (likeEmail && slug) {
      const checkLikeStatus = async () => {
        try {
          const response = await apiRequest(`/api/news/${slug}/likes/check?email=${encodeURIComponent(likeEmail)}`);
          setUserLiked(response.liked);
        } catch (error) {
          console.error("Error checking like status:", error);
        }
      };
      
      checkLikeStatus();
    }
  }, [likeEmail, slug]);

  // Comment form
  const commentForm = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      name: localStorage.getItem("userName") || "",
      email: localStorage.getItem("userEmail") || "",
      content: "",
    },
  });

  // Like form
  const likeForm = useForm<LikeFormValues>({
    resolver: zodResolver(likeFormSchema),
    defaultValues: {
      email: localStorage.getItem("userEmail") || "",
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (values: CommentFormValues) => {
      return await apiRequest(`/api/news/${slug}/comments`, {
        method: "POST",
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      toast({
        title: "Comment submitted",
        description: "Your comment has been submitted for approval",
      });
      commentForm.reset({ 
        name: commentForm.getValues("name"), 
        email: commentForm.getValues("email"),
        content: ""
      });
      setReplyingTo(null);
      
      // Save user name and email for future use
      localStorage.setItem("userName", commentForm.getValues("name"));
      localStorage.setItem("userEmail", commentForm.getValues("email"));
      
      // Refetch article data to get updated comments
      queryClient.invalidateQueries({ queryKey: ['/api/news', slug] });
    },
    onError: (error: any) => {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit comment",
        variant: "destructive",
      });
    },
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async (values: LikeFormValues) => {
      return await apiRequest(`/api/news/${slug}/likes`, {
        method: "POST",
        body: JSON.stringify(values),
      });
    },
    onSuccess: (response) => {
      setUserLiked(response.liked);
      
      // Save user email for future use
      localStorage.setItem("userEmail", likeForm.getValues("email"));
      setLikeEmail(likeForm.getValues("email"));
      
      if (response.liked) {
        toast({
          title: "Liked!",
          description: "Thanks for liking this article",
        });
      } else {
        toast({
          title: "Like removed",
          description: "You have removed your like from this article",
        });
      }
      
      setShowLikeForm(false);
      
      // Refetch article data to get updated like count
      queryClient.invalidateQueries({ queryKey: ['/api/news', slug] });
    },
    onError: (error: any) => {
      console.error("Error processing like:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process like",
        variant: "destructive",
      });
    },
  });

  const onCommentSubmit = (values: CommentFormValues) => {
    // If replying to a comment, add the parent ID
    if (replyingTo) {
      values.parentId = replyingTo;
    }
    
    commentMutation.mutate(values);
  };

  const onLike = () => {
    if (!likeEmail) {
      setShowLikeForm(true);
      return;
    }
    
    likeMutation.mutate({ email: likeEmail });
  };

  const onLikeSubmit = (values: LikeFormValues) => {
    likeMutation.mutate(values);
  };

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Render article content
  const renderArticleContent = (content: string) => {
    // Convert newlines to <br> and wrap paragraphs
    return content
      .split('\n\n')
      .map((paragraph, index) => (
        <p key={index} className="mb-4">
          {paragraph.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < paragraph.split('\n').length - 1 && <br />}
            </span>
          ))}
        </p>
      ));
  };

  // Render comments
  const renderComments = (comments: Comment[]) => {
    return comments
      .filter(comment => !comment.parentId)
      .map(comment => (
        <div key={comment.id} className="mb-6">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-white">
                {getInitials(comment.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{comment.name}</h4>
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-primary"
                onClick={() => setReplyingTo(comment.id)}
              >
                <MessageSquare className="mr-1 h-4 w-4" />
                Reply
              </Button>
            </div>
          </div>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-14">
              {comment.replies.map(reply => (
                <div key={reply.id} className="flex items-start gap-4 mb-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary text-white text-xs">
                      {getInitials(reply.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{reply.name}</h4>
                        <span className="text-xs text-gray-500">
                          {formatDate(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{reply.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply form */}
          {replyingTo === comment.id && (
            <div className="ml-14 mt-2 mb-6">
              <Form {...commentForm}>
                <form onSubmit={commentForm.handleSubmit(onCommentSubmit)} className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold">Reply to {comment.name}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={commentForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={commentForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={commentForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your reply</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Write your reply..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="submit"
                      disabled={commentMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {commentMutation.isPending ? "Submitting..." : "Submit Reply"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setReplyingTo(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </div>
      ));
  };

  if (isLoading) {
    return (
      <div className="bg-cream py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="h-8 bg-gray-200 w-3/4 mb-4 animate-pulse rounded"></div>
            <div className="h-6 bg-gray-200 w-1/4 mb-8 animate-pulse rounded"></div>
            <div className="h-64 bg-gray-200 mb-8 animate-pulse rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data || !data.article) {
    return (
      <div className="bg-cream py-16 min-h-screen">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="mb-6">The article you're looking for may have been moved or deleted.</p>
          <Button
            onClick={() => setLocation("/news")}
            className="bg-primary hover:bg-opacity-90"
          >
            Back to News
          </Button>
        </div>
      </div>
    );
  }

  const { article, comments = [], likeCount = 0 } = data;

  return (
    <>
      <div className="bg-secondary py-16 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-4">
            {article.title}
          </h1>
          <div className="flex items-center justify-center gap-3 text-gray-200">
            <span>{formatDate(article.date)}</span>
            <span>|</span>
            <span>{article.category}</span>
            <span>|</span>
            <span>By {article.author}</span>
          </div>
        </div>
      </div>

      <div className="bg-cream py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-80 object-cover"
            />
            
            <div className="p-6 md:p-8">
              {/* Article content */}
              <div className="prose max-w-none">
                {renderArticleContent(article.content)}
              </div>
              
              {/* Article actions */}
              <div className="mt-8 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={userLiked ? "default" : "outline"}
                        className={cn(
                          "rounded-full",
                          userLiked && "bg-primary hover:bg-primary/90"
                        )}
                        onClick={onLike}
                      >
                        <ThumbsUp className={cn("h-5 w-5", userLiked ? "fill-white" : "fill-none")} />
                        <span className="ml-2">{likeCount}</span>
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => {
                        navigator.share({
                          title: article.title,
                          text: article.excerpt,
                          url: window.location.href,
                        }).catch(err => {
                          console.error('Error sharing:', err);
                        });
                      }}
                    >
                      <Share2 className="h-5 w-5" />
                      <span className="ml-2">Share</span>
                    </Button>
                  </div>
                </div>
                
                {/* Like form */}
                {showLikeForm && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-3">Enter your email to like this article</h3>
                    <Form {...likeForm}>
                      <form onSubmit={likeForm.handleSubmit(onLikeSubmit)} className="flex items-end gap-3">
                        <FormField
                          control={likeForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Your email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={likeMutation.isPending}
                            className="bg-primary hover:bg-primary/90"
                          >
                            {likeMutation.isPending ? "Processing..." : "Like"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowLikeForm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                )}
              </div>
              
              {/* Author info */}
              <div className="mt-8 pt-4 pb-6 border-t border-gray-200">
                <h3 className="font-bold text-lg mb-2">About the Author</h3>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-secondary text-white">
                      {getInitials(article.author)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{article.author}</h4>
                    <p className="text-gray-600 text-sm">
                      Writer at Sunnah Foundation
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Comment section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-bold text-2xl mb-6">
                  Comments {comments.length > 0 && `(${comments.length})`}
                </h3>
                
                {/* Comments list */}
                {comments.length > 0 ? (
                  <div className="mb-8">{renderComments(comments)}</div>
                ) : (
                  <div className="bg-gray-50 p-6 mb-8 rounded-lg text-center">
                    <p className="mb-2 text-gray-600">No comments yet</p>
                    <p className="text-sm text-gray-500">Be the first to share your thoughts!</p>
                  </div>
                )}
                
                {/* Comment form */}
                {!replyingTo && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-bold text-lg mb-4">Leave a Comment</h3>
                    <Form {...commentForm}>
                      <form onSubmit={commentForm.handleSubmit(onCommentSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={commentForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={commentForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={commentForm.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Comment</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Share your thoughts on this article..."
                                  className="min-h-32"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div>
                          <p className="text-sm text-gray-500 mb-4">
                            Your comment will be reviewed before it appears. Please use a trusted email provider.
                          </p>
                          <Button
                            type="submit"
                            disabled={commentMutation.isPending}
                            className="bg-primary hover:bg-primary/90"
                          >
                            {commentMutation.isPending ? "Submitting..." : "Post Comment"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Related articles section could be added here */}
        </div>
      </div>
      
      {/* Newsletter section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary font-heading mb-6">
            Stay Updated
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-8">
            Subscribe to our newsletter to receive the latest news, updates, and events from the Sunnah Foundation directly to your inbox.
          </p>
          
          <div className="max-w-md mx-auto">
            <form className="flex">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-1 px-4 py-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-accent border-y border-l border-gray-300"
                required
              />
              <button 
                type="submit" 
                className="bg-accent hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-r-lg transition duration-150"
              >
                Subscribe
              </button>
            </form>
            <p className="text-sm text-gray-500 mt-4">
              We respect your privacy. You can unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default NewsDetailPage;