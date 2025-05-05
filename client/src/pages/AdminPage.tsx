import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SunnahLogo } from "@/components/ui/sunnahlogo";

// Admin forms
import NewsArticleForm from "@/components/admin/NewsArticleForm";
import ProgramForm from "@/components/admin/ProgramForm";
import TeamMemberForm from "@/components/admin/TeamMemberForm";
import VideoForm from "@/components/admin/VideoForm";
import UniversityCourseForm from "@/components/admin/UniversityCourseForm";
import FacultyMemberForm from "@/components/admin/FacultyMemberForm";
import HistoryEventForm from "@/components/admin/HistoryEventForm";

// Admin tables
import { NewsTable } from "@/components/admin/NewsTable";
import { ProgramsTable } from "@/components/admin/ProgramsTable";
import { TeamMembersTable } from "@/components/admin/TeamMembersTable";
import { VideosTable } from "@/components/admin/VideosTable";
import { UniversityCoursesTable } from "@/components/admin/UniversityCoursesTable";
import { FacultyMembersTable } from "@/components/admin/FacultyMembersTable";
import { HistoryEventsTable } from "@/components/admin/HistoryEventsTable";
import { DonationsTable } from "@/components/admin/DonationsTable";
import { VolunteersTable } from "@/components/admin/VolunteersTable";
import { ContactMessagesTable } from "@/components/admin/ContactMessagesTable";
import { NewsletterSubscribersTable } from "@/components/admin/NewsletterSubscribersTable";

// UI Components
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types
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
  isLeadership: boolean;
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
  isFeatured: boolean;
  isMainFeature: boolean;
}

interface UniversityCourse {
  id: number;
  title: string;
  description: string;
  level: string;
  duration: string;
  instructors: string[];
  imageUrl: string;
}

interface FacultyMember {
  id: number;
  name: string;
  title: string;
  specialization: string;
  bio: string;
  imageUrl: string;
}

interface HistoryEvent {
  id: number;
  year: number;
  title: string;
  description: string;
  imageUrl?: string;
  sortOrder: number;
}

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

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  newsletter: boolean;
  isRead: boolean;
  createdAt: string;
}

interface NewsletterSubscriber {
  id: number;
  email: string;
  createdAt: string;
}

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

  // Dialog state for forms
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [activeItemForEdit, setActiveItemForEdit] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("university");

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

  // Open form dialog
  const openAddForm = () => {
    setActiveItemForEdit(null);
    setFormDialogOpen(true);
  };

  // Open edit form
  const openEditForm = (item: any) => {
    setActiveItemForEdit(item);
    setFormDialogOpen(true);
  };

  // Close form dialog
  const closeFormDialog = () => {
    setFormDialogOpen(false);
    setActiveItemForEdit(null);
  };

  // Handle tab change in university section
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Content Queries
  // News articles
  const { data: newsArticles = [], isLoading: newsLoading } = useQuery<NewsArticle[]>({
    queryKey: ['/api/news'],
    enabled: isAuthenticated && activeSection === "news"
  });

  // News categories
  const { data: rawNewsCategories = [] } = useQuery<{id: number, name: string, createdAt: string}[]>({
    queryKey: ['/api/news/categories'],
    enabled: isAuthenticated && (activeSection === "news" || formDialogOpen)
  });
  // Extract just the names for the form
  const newsCategories = rawNewsCategories.map(cat => cat.name);

  // Programs
  const { data: programs = [], isLoading: programsLoading } = useQuery<Program[]>({
    queryKey: ['/api/programs'],
    enabled: isAuthenticated && activeSection === "programs"
  });

  // Program categories
  const { data: rawProgramCategories = [] } = useQuery<{id: number, name: string, createdAt: string}[]>({
    queryKey: ['/api/programs/categories'],
    enabled: isAuthenticated && (activeSection === "programs" || formDialogOpen)
  });
  // Extract just the names for the form
  const programCategories = rawProgramCategories.map(cat => cat.name);

  // Team members
  const { data: teamMembers = [], isLoading: teamLoading } = useQuery<TeamMember[]>({
    queryKey: ['/api/team/all'],
    enabled: isAuthenticated && activeSection === "team"
  });

  // Videos
  const { data: videos = [], isLoading: videosLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
    enabled: isAuthenticated && activeSection === "videos"
  });

  // Video categories
  const { data: rawVideoCategories = [] } = useQuery<{id: number, name: string, createdAt: string}[]>({
    queryKey: ['/api/videos/categories'],
    enabled: isAuthenticated && (activeSection === "videos" || formDialogOpen)
  });
  // Extract just the names for the form
  const videoCategories = rawVideoCategories.map(cat => cat.name);

  // University courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery<UniversityCourse[]>({
    queryKey: ['/api/university/courses'],
    enabled: isAuthenticated && activeSection === "university" && activeTab === "courses"
  });

  // Faculty members
  const { data: faculty = [], isLoading: facultyLoading } = useQuery<FacultyMember[]>({
    queryKey: ['/api/university/faculty'],
    enabled: isAuthenticated && activeSection === "university" && activeTab === "faculty"
  });

  // History events
  const { data: historyEvents = [], isLoading: historyLoading } = useQuery<HistoryEvent[]>({
    queryKey: ['/api/about/history'],
    enabled: isAuthenticated && activeSection === "history"
  });

  // Donations
  const { data: donations = [], isLoading: donationsLoading } = useQuery<Donation[]>({
    queryKey: ['/api/donations'],
    enabled: isAuthenticated && activeSection === "donations"
  });

  // Volunteers
  const { data: volunteers = [], isLoading: volunteersLoading } = useQuery<Volunteer[]>({
    queryKey: ['/api/volunteers'],
    enabled: isAuthenticated && activeSection === "volunteers"
  });

  // Contact messages
  const { data: contactMessages = [], isLoading: contactsLoading } = useQuery<ContactMessage[]>({
    queryKey: ['/api/contact'],
    enabled: isAuthenticated && activeSection === "contacts"
  });

  // Newsletter subscribers
  const { data: subscribers = [], isLoading: subscribersLoading } = useQuery<NewsletterSubscriber[]>({
    queryKey: ['/api/newsletter/subscribers'],
    enabled: isAuthenticated && activeSection === "newsletter"
  });

  // Events
  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
    enabled: isAuthenticated && activeSection === "events"
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
    courses: number;
    faculty: number;
    events: number;
    subscribers: number;
  }>({
    queryKey: ['/api/admin/stats'],
    enabled: isAuthenticated && activeSection === "dashboard"
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

  // Form dialog content based on active section
  const renderFormDialog = () => {
    switch (activeSection) {
      case "news":
        return (
          <NewsArticleForm 
            article={activeItemForEdit} 
            categories={newsCategories}
            onSuccess={closeFormDialog}
          />
        );
      case "programs":
        return (
          <ProgramForm 
            program={activeItemForEdit} 
            categories={programCategories}
            onSuccess={closeFormDialog}
          />
        );
      case "team":
        return (
          <TeamMemberForm 
            teamMember={activeItemForEdit} 
            onSuccess={closeFormDialog}
          />
        );
      case "videos":
        return (
          <VideoForm 
            video={activeItemForEdit} 
            categories={videoCategories}
            onSuccess={closeFormDialog}
          />
        );
      case "university":
        if (activeTab === "courses") {
          return (
            <UniversityCourseForm 
              course={activeItemForEdit} 
              onSuccess={closeFormDialog}
            />
          );
        } else if (activeTab === "faculty") {
          return (
            <FacultyMemberForm 
              faculty={activeItemForEdit} 
              onSuccess={closeFormDialog}
            />
          );
        }
        return null;
      case "history":
        return (
          <HistoryEventForm 
            event={activeItemForEdit} 
            onSuccess={closeFormDialog}
          />
        );
      default:
        return null;
    }
  };

  // Get dialog title based on activeSection and activeItemForEdit
  const getDialogTitle = () => {
    const action = activeItemForEdit ? "Edit" : "Add";
    switch (activeSection) {
      case "news":
        return `${action} News Article`;
      case "programs":
        return `${action} Program`;
      case "team":
        return `${action} Team Member`;
      case "videos":
        return `${action} Video`;
      case "university":
        if (activeTab === "courses") {
          return `${action} University Course`;
        } else if (activeTab === "faculty") {
          return `${action} Faculty Member`;
        }
        return "";
      case "history":
        return `${action} History Event`;
      default:
        return "";
    }
  };

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
                  activeSection === "university" ? "bg-primary" : "hover:bg-secondary/90"
                }`}
                onClick={() => {
                  setActiveSection("university");
                  setActiveTab("courses");
                }}
              >
                <i className="fas fa-graduation-cap mr-3"></i> University
              </button>
            </li>
            <li>
              <button 
                className={`w-full text-left px-4 py-3 flex items-center ${
                  activeSection === "history" ? "bg-primary" : "hover:bg-secondary/90"
                }`}
                onClick={() => setActiveSection("history")}
              >
                <i className="fas fa-history mr-3"></i> History Events
              </button>
            </li>
            <li>
              <button 
                className={`w-full text-left px-4 py-3 flex items-center ${
                  activeSection === "events" ? "bg-primary" : "hover:bg-secondary/90"
                }`}
                onClick={() => setActiveSection("events")}
              >
                <i className="fas fa-calendar-alt mr-3"></i> Events
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
            <li>
              <button 
                className={`w-full text-left px-4 py-3 flex items-center ${
                  activeSection === "newsletter" ? "bg-primary" : "hover:bg-secondary/90"
                }`}
                onClick={() => setActiveSection("newsletter")}
              >
                <i className="fas fa-paper-plane mr-3"></i> Newsletter
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
          {/* Content Actions */}
          <div className="flex items-center justify-end mb-8">
            {(activeSection === "news" || 
              activeSection === "programs" || 
              activeSection === "team" || 
              activeSection === "videos" || 
              activeSection === "university" ||
              activeSection === "history") && (
              <Button 
                onClick={openAddForm}
                className="bg-accent hover:bg-opacity-90 text-white font-bold rounded-full transition duration-150 flex items-center"
              >
                <i className="fas fa-plus mr-2"></i> 
                Add {activeSection === "news" ? "Article" : 
                     activeSection === "team" ? "Team Member" : 
                     activeSection === "videos" ? "Video" :
                     activeSection === "university" && activeTab === "courses" ? "Course" :
                     activeSection === "university" && activeTab === "faculty" ? "Faculty Member" :
                     activeSection === "history" ? "Event" :
                     activeSection.slice(0, -1)}
              </Button>
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
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-primary mb-4">Content Management</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>University Courses</span>
                      <span className="font-semibold">{stats?.courses || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>Faculty Members</span>
                      <span className="font-semibold">{stats?.faculty || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>History Events</span>
                      <span className="font-semibold">{stats?.events || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span>Newsletter Subscribers</span>
                      <span className="font-semibold">{stats?.subscribers || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-bold text-primary mb-4">Engagement Overview</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Donations</p>
                        <p className="text-sm text-gray-500">{stats?.donations || 0} total</p>
                      </div>
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <i className="fas fa-hand-holding-heart"></i>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Volunteer Applications</p>
                        <p className="text-sm text-gray-500">{stats?.volunteers || 0} total</p>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <i className="fas fa-hands-helping"></i>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Contact Messages</p>
                        <p className="text-sm text-gray-500">{stats?.contacts || 0} total</p>
                      </div>
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                        <i className="fas fa-envelope"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-primary mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center" 
                    onClick={() => setActiveSection("news")}
                  >
                    <i className="fas fa-newspaper mr-2"></i> Manage News
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center" 
                    onClick={() => setActiveSection("videos")}
                  >
                    <i className="fas fa-video mr-2"></i> Manage Videos
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center" 
                    onClick={() => setActiveSection("contacts")}
                  >
                    <i className="fas fa-envelope mr-2"></i> View Messages
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* News & Updates section */}
          {activeSection === "news" && (
            <div>
              {newsLoading ? (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
                  <p className="mt-2 text-muted-foreground">Loading news articles...</p>
                </div>
              ) : (
                <NewsTable articles={newsArticles} onEdit={openEditForm} />
              )}
            </div>
          )}
          
          {/* Programs section */}
          {activeSection === "programs" && (
            <div>
              {programsLoading ? (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
                  <p className="mt-2 text-muted-foreground">Loading programs...</p>
                </div>
              ) : (
                <ProgramsTable programs={programs} onEdit={openEditForm} />
              )}
            </div>
          )}
          
          {/* Team Members section */}
          {activeSection === "team" && (
            <div>
              {teamLoading ? (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
                  <p className="mt-2 text-muted-foreground">Loading team members...</p>
                </div>
              ) : (
                <TeamMembersTable members={teamMembers} onEdit={openEditForm} />
              )}
            </div>
          )}
          
          {/* Videos section */}
          {activeSection === "videos" && (
            <div>
              {videosLoading ? (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
                  <p className="mt-2 text-muted-foreground">Loading videos...</p>
                </div>
              ) : (
                <VideosTable videos={videos} onEdit={openEditForm} />
              )}
            </div>
          )}

          {/* University section */}
          {activeSection === "university" && (
            <div>
              <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
                <TabsList>
                  <TabsTrigger value="courses">Courses</TabsTrigger>
                  <TabsTrigger value="faculty">Faculty</TabsTrigger>
                </TabsList>
                <TabsContent value="courses">
                  {coursesLoading ? (
                    <div className="text-center py-8">
                      <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
                      <p className="mt-2 text-muted-foreground">Loading university courses...</p>
                    </div>
                  ) : (
                    <UniversityCoursesTable courses={courses} onEdit={openEditForm} />
                  )}
                </TabsContent>
                <TabsContent value="faculty">
                  {facultyLoading ? (
                    <div className="text-center py-8">
                      <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
                      <p className="mt-2 text-muted-foreground">Loading faculty members...</p>
                    </div>
                  ) : (
                    <FacultyMembersTable faculty={faculty} onEdit={openEditForm} />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* History Events section */}
          {activeSection === "history" && (
            <div>
              {historyLoading ? (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
                  <p className="mt-2 text-muted-foreground">Loading history events...</p>
                </div>
              ) : (
                <HistoryEventsTable events={historyEvents} onEdit={openEditForm} />
              )}
            </div>
          )}
          
          {/* Donations section */}
          {activeSection === "donations" && (
            <div>
              {donationsLoading ? (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
                  <p className="mt-2 text-muted-foreground">Loading donations...</p>
                </div>
              ) : (
                <DonationsTable donations={donations} />
              )}
            </div>
          )}
          
          {/* Volunteers section */}
          {activeSection === "volunteers" && (
            <div>
              {volunteersLoading ? (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
                  <p className="mt-2 text-muted-foreground">Loading volunteer applications...</p>
                </div>
              ) : (
                <VolunteersTable volunteers={volunteers} />
              )}
            </div>
          )}
          
          {/* Contact Messages section */}
          {activeSection === "contacts" && (
            <div>
              {contactsLoading ? (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
                  <p className="mt-2 text-muted-foreground">Loading contact messages...</p>
                </div>
              ) : (
                <ContactMessagesTable messages={contactMessages} />
              )}
            </div>
          )}

          {/* Newsletter section */}
          {activeSection === "newsletter" && (
            <div>
              {subscribersLoading ? (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-primary text-2xl"></i>
                  <p className="mt-2 text-muted-foreground">Loading newsletter subscribers...</p>
                </div>
              ) : (
                <NewsletterSubscribersTable subscribers={subscribers} />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          {renderFormDialog()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;