import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon,
  ExternalLinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  
  // Query upcoming events
  const { data: upcomingEvents = [], isLoading: upcomingLoading } = useQuery<Event[]>({
    queryKey: ['/api/events/upcoming'],
    enabled: activeTab === "upcoming"
  });
  
  // Query past events
  const { data: pastEvents = [], isLoading: pastLoading } = useQuery<Event[]>({
    queryKey: ['/api/events/past'],
    enabled: activeTab === "past"
  });

  // Format date to display nicely
  const formatEventDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };
  
  // Render event cards
  const renderEventCards = (events: Event[], isLoading: boolean) => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
          <Skeleton className="w-full h-48" />
          <div className="p-6">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-3" />
            <div className="flex items-center space-x-2 mb-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-10 w-full mt-4" />
          </div>
        </div>
      ));
    }
    
    if (events.length === 0) {
      return (
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 p-8 text-center">
          <h3 className="text-xl font-semibold text-secondary mb-2">
            No {activeTab} events found
          </h3>
          <p className="text-gray-600">
            {activeTab === "upcoming" 
              ? "Check back soon for upcoming events."
              : "Past events will be listed here."}
          </p>
        </div>
      );
    }
    
    return events.map((event) => (
      <Card key={event.id} className="overflow-hidden bg-white shadow-md transition-shadow hover:shadow-lg">
        <div className="h-48 overflow-hidden">
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-secondary mb-3">{event.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-700">
              <CalendarIcon className="w-4 h-4 mr-2 text-primary" />
              <span>{formatEventDate(event.date)}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <ClockIcon className="w-4 h-4 mr-2 text-primary" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <MapPinIcon className="w-4 h-4 mr-2 text-primary" />
              <span>{event.location}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-6 pb-6 pt-0">
          {event.registrationLink && !event.isPast ? (
            <Button 
              className="w-full bg-accent hover:bg-accent/90 text-white" 
              asChild
            >
              <a 
                href={event.registrationLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center"
              >
                Register <ExternalLinkIcon className="ml-1 h-4 w-4" />
              </a>
            </Button>
          ) : event.isPast ? (
            <Button 
              variant="outline" 
              className="w-full border-gray-300 text-gray-600"
              disabled
            >
              Event Completed
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="w-full border-gray-300 text-gray-600"
              disabled
            >
              No Registration Required
            </Button>
          )}
        </CardFooter>
      </Card>
    ));
  };

  return (
    <div className="bg-cream min-h-screen">
      <PageHeader
        title="Events"
        subtitle="Join us for our upcoming events or check out past events"
        className="bg-secondary text-white"
      />

      <Container className="py-12">
        <Tabs 
          defaultValue="upcoming" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white border border-gray-200">
              <TabsTrigger 
                value="upcoming" 
                className="px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Upcoming Events
              </TabsTrigger>
              <TabsTrigger 
                value="past" 
                className="px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Past Events
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="upcoming" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderEventCards(upcomingEvents, upcomingLoading)}
            </div>
          </TabsContent>
          
          <TabsContent value="past" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderEventCards(pastEvents, pastLoading)}
            </div>
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  );
}