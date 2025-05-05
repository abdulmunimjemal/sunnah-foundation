import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SunnahLogo } from "@/components/ui/sunnahlogo";

interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  imageUrl: string;
  category: string;
  slug: string;
}

interface Program {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  imageUrl: string;
  slug: string;
}

interface TeamMember {
  id: number;
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

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
}

const AdminPage = () => {
  // Set page title
  useEffect(() => {
    document.title = "Admin Dashboard - Sunnah Foundation";
  }, []);

  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check', { credentials: 'include' });
        if (!res.ok) {
          throw new Error('Not authenticated');
        }
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        setLocation('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [setLocation]);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        variant: "default",
      });
      setLocation('/admin/login');
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };

  // Queries for data
  const { data: newsArticles = [] } = useQuery<NewsArticle[]>({
    queryKey: ['/api/news'],
    enabled: isAuthenticated && activeSection === "news"
  });

  const { data: programs = [] } = useQuery<Program[]>({
    queryKey: ['/api/programs'],
    enabled: isAuthenticated && activeSection === "programs"
  });

  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ['/api/team/all'],
    enabled: isAuthenticated && activeSection === "team"
  });

  const { data: videos = [] } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
    enabled: isAuthenticated && activeSection === "videos"
  });

  // Dashboard stats
  const { data: stats } = useQuery<{
    articles: number;
    programs: number;
    team: number;
    videos: number;
    donations: number;
    volunteers: number;
    contacts: number;
  }>({
    queryKey: ['/api/admin/stats'],
    enabled: isAuthenticated && activeSection === "dashboard"
  });

  // Mutations
  const deleteNewsMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/news/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/news'] });
      toast({
        title: "Success",
        description: "News article deleted successfully.",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete news article.",
        variant: "destructive",
      });
    }
  });
  
  const deleteProgramMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/programs/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/programs'] });
      toast({
        title: "Success",
        description: "Program deleted successfully.",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete program.",
        variant: "destructive",
      });
    }
  });
  
  const deleteTeamMemberMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/team/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team/all'] });
      toast({
        title: "Success",
        description: "Team member deleted successfully.",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete team member.",
        variant: "destructive",
      });
    }
  });
  
  const deleteVideoMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/videos/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: "Success",
        description: "Video deleted successfully.",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete video.",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <SunnahLogo className="h-16 mx-auto mb-4" />
          <p className="text-lg text-secondary">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect will happen in useEffect
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary text-white">
        <div className="p-4">
          <SunnahLogo className="h-12 text-white mb-4" />
          <div className="border-t border-gray-700 pt-4 mt-4">
            <p className="text-sm">Content Management System</p>
          </div>
        </div>
        <nav className="mt-6">
          <ul className="space-y-1">
            <li>
              <button 
                className={`w-full text-left px-4 py-3 flex items-center ${
                  activeSection === "dashboard" ? "bg-primary" : "hover:bg-secondary/90"
                }`}
                onClick={() => setActiveSection("dashboard")}
              >
                <i className="fas fa-tachometer-alt mr-3"></i> Dashboard
              </button>
            </li>
            <li>
              <button 
                className={`w-full text-left px-4 py-3 flex items-center ${
                  activeSection === "news" ? "bg-primary" : "hover:bg-secondary/90"
                }`}
                onClick={() => setActiveSection("news")}
              >
                <i className="fas fa-newspaper mr-3"></i> News & Updates
              </button>
            </li>
            <li>
              <button 
                className={`w-full text-left px-4 py-3 flex items-center ${
                  activeSection === "programs" ? "bg-primary" : "hover:bg-secondary/90"
                }`}
                onClick={() => setActiveSection("programs")}
              >
                <i className="fas fa-project-diagram mr-3"></i> Programs
              </button>
            </li>
            <li>
              <button 
                className={`w-full text-left px-4 py-3 flex items-center ${
                  activeSection === "team" ? "bg-primary" : "hover:bg-secondary/90"
                }`}
                onClick={() => setActiveSection("team")}
              >
                <i className="fas fa-users mr-3"></i> Team Members
              </button>
            </li>
            <li>
              <button 
                className={`w-full text-left px-4 py-3 flex items-center ${
                  activeSection === "videos" ? "bg-primary" : "hover:bg-secondary/90"
                }`}
                onClick={() => setActiveSection("videos")}
              >
                <i className="fas fa-video mr-3"></i> Videos
              </button>
            </li>
            <li>
              <button 
                className={`w-full text-left px-4 py-3 flex items-center ${
                  activeSection === "donations" ? "bg-primary" : "hover:bg-secondary/90"
                }`}
                onClick={() => setActiveSection("donations")}
              >
                <i className="fas fa-hand-holding-heart mr-3"></i> Donations
              </button>
            </li>
            <li>
              <button 
                className={`w-full text-left px-4 py-3 flex items-center ${
                  activeSection === "volunteers" ? "bg-primary" : "hover:bg-secondary/90"
                }`}
                onClick={() => setActiveSection("volunteers")}
              >
                <i className="fas fa-hands-helping mr-3"></i> Volunteers
              </button>
            </li>
            <li>
              <button 
                className={`w-full text-left px-4 py-3 flex items-center ${
                  activeSection === "contacts" ? "bg-primary" : "hover:bg-secondary/90"
                }`}
                onClick={() => setActiveSection("contacts")}
              >
                <i className="fas fa-envelope mr-3"></i> Contact Messages
              </button>
            </li>
            <li className="mt-6 border-t border-gray-700 pt-4">
              <button 
                className="w-full text-left px-4 py-3 flex items-center text-red-300 hover:bg-red-900/20"
                onClick={handleLogout}
              >
                <i className="fas fa-sign-out-alt mr-3"></i> Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-x-auto">
        <div className="py-6 px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-primary">
              {activeSection === "dashboard" && "Dashboard"}
              {activeSection === "news" && "News & Updates"}
              {activeSection === "programs" && "Programs"}
              {activeSection === "team" && "Team Members"}
              {activeSection === "videos" && "Videos"}
              {activeSection === "donations" && "Donations"}
              {activeSection === "volunteers" && "Volunteers"}
              {activeSection === "contacts" && "Contact Messages"}
            </h1>
            
            {activeSection !== "dashboard" && (
              <button className="bg-accent hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-full transition duration-150 flex items-center">
                <i className="fas fa-plus mr-2"></i> 
                Add {activeSection === "news" ? "Article" : 
                     activeSection === "team" ? "Team Member" : 
                     activeSection === "videos" ? "Video" : 
                     activeSection.slice(0, -1)}
              </button>
            )}
          </div>
          
          {/* Dashboard */}
          {activeSection === "dashboard" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Total Articles</p>
                      <h3 className="text-3xl font-bold text-primary">{stats?.articles || 0}</h3>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl">
                      <i className="fas fa-newspaper"></i>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Programs</p>
                      <h3 className="text-3xl font-bold text-primary">{stats?.programs || 0}</h3>
                    </div>
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent text-xl">
                      <i className="fas fa-project-diagram"></i>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Team Members</p>
                      <h3 className="text-3xl font-bold text-primary">{stats?.team || 0}</h3>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl">
                      <i className="fas fa-users"></i>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Videos</p>
                      <h3 className="text-3xl font-bold text-primary">{stats?.videos || 0}</h3>
                    </div>
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent text-xl">
                      <i className="fas fa-video"></i>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-primary mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent mr-3 flex-shrink-0">
                        <i className="fas fa-plus"></i>
                      </div>
                      <div>
                        <p className="font-semibold">New article published</p>
                        <p className="text-sm text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-3 flex-shrink-0">
                        <i className="fas fa-dollar-sign"></i>
                      </div>
                      <div>
                        <p className="font-semibold">New donation received</p>
                        <p className="text-sm text-gray-500">Yesterday</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3 flex-shrink-0">
                        <i className="fas fa-user-plus"></i>
                      </div>
                      <div>
                        <p className="font-semibold">New volunteer application</p>
                        <p className="text-sm text-gray-500">2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mr-3 flex-shrink-0">
                        <i className="fas fa-edit"></i>
                      </div>
                      <div>
                        <p className="font-semibold">Program updated</p>
                        <p className="text-sm text-gray-500">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-primary mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-700">Donations This Month</span>
                        <span className="text-accent font-bold">{stats?.donations || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-accent h-2 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-700">Volunteer Applications</span>
                        <span className="text-primary font-bold">{stats?.volunteers || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-700">Contact Messages</span>
                        <span className="text-secondary font-bold">{stats?.contacts || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-secondary h-2 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">System Status</h4>
                    <div className="flex items-center text-green-600">
                      <i className="fas fa-check-circle mr-2"></i>
                      <span>All systems operational</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* News & Updates */}
          {activeSection === "news" && (
            <div>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {newsArticles.map((article) => (
                      <tr key={article.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-md object-cover" src={article.imageUrl} alt={article.title} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{article.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary bg-opacity-10 text-primary">
                            {article.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(article.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {article.author}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-primary hover:text-primary/80 mr-4">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this article?")) {
                                deleteNewsMutation.mutate(article.id);
                              }
                            }}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Programs */}
          {activeSection === "programs" && (
            <div>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Program
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {programs.map((program) => (
                      <tr key={program.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-md object-cover" src={program.imageUrl} alt={program.title} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{program.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-accent bg-opacity-10 text-accent">
                            {program.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {program.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-primary hover:text-primary/80 mr-4">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this program?")) {
                                deleteProgramMutation.mutate(program.id);
                              }
                            }}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Team Members */}
          {activeSection === "team" && (
            <div>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bio
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teamMembers.map((member) => (
                      <tr key={member.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-full object-cover" src={member.imageUrl} alt={member.name} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary bg-opacity-10 text-primary">
                            {member.title}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {member.bio}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-primary hover:text-primary/80 mr-4">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this team member?")) {
                                deleteTeamMemberMutation.mutate(member.id);
                              }
                            }}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Videos */}
          {activeSection === "videos" && (
            <div>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Video
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {videos.map((video) => (
                      <tr key={video.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-16 relative">
                              <img className="h-10 w-16 rounded-md object-cover" src={video.thumbnailUrl} alt={video.title} />
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                <i className="fas fa-play text-white text-xs"></i>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{video.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-accent bg-opacity-10 text-accent">
                            {video.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {video.duration}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {video.views.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-primary hover:text-primary/80 mr-4">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this video?")) {
                                deleteVideoMutation.mutate(video.id);
                              }
                            }}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Other sections... */}
          {(activeSection === "donations" || activeSection === "volunteers" || activeSection === "contacts") && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-6xl text-gray-300 mb-4">
                <i className={`fas ${
                  activeSection === "donations" ? "fa-hand-holding-heart" : 
                  activeSection === "volunteers" ? "fa-hands-helping" : 
                  "fa-envelope"
                }`}></i>
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">
                {activeSection === "donations" ? "Donations Section" : 
                 activeSection === "volunteers" ? "Volunteers Section" : 
                 "Contact Messages Section"}
              </h3>
              <p className="text-gray-500 mb-4">
                This section is under development. Check back soon!
              </p>
              <button className="bg-primary hover:bg-opacity-90 text-white font-bold py-2 px-6 rounded-full transition duration-150">
                <i className="fas fa-wrench mr-2"></i> Setup Now
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
