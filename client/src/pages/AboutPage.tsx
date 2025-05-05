import { useEffect } from "react";
import MissionSection from "@/components/home/MissionSection";
import TeamSection from "@/components/home/TeamSection";
import { useQuery } from "@tanstack/react-query";

interface HistoryEvent {
  id: number;
  year: number;
  title: string;
  description: string;
  imageUrl?: string;
}

const AboutPage = () => {
  // Set page title
  useEffect(() => {
    document.title = "About Us - Sunnah Foundation";
  }, []);

  const { data: historyEvents = [], isLoading } = useQuery<HistoryEvent[]>({
    queryKey: ['/api/about/history'],
  });

  return (
    <>
      <div className="bg-secondary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">About the Sunnah Foundation</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Learn about our mission, history, and the dedicated team working to preserve and promote authentic Islamic knowledge.
          </p>
        </div>
      </div>
      
      <MissionSection />
      
      <section id="history" className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary font-heading mb-4">Our History</h2>
            <p className="text-lg max-w-3xl mx-auto">
              From humble beginnings to a global educational institution, discover the journey of the Sunnah Foundation.
            </p>
          </div>
          
          {isLoading ? (
            <div className="space-y-12">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex flex-col md:flex-row items-center gap-8">
                  <div className="md:w-1/3">
                    <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                  <div className="md:w-2/3">
                    <div className="h-10 bg-gray-200 rounded animate-pulse mb-4 w-1/4"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-12">
              {historyEvents.map((event, index) => (
                <div key={event.id} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8`}>
                  {event.imageUrl && (
                    <div className="md:w-1/3">
                      <img 
                        src={event.imageUrl} 
                        alt={event.title} 
                        className="rounded-lg shadow-lg w-full h-auto"
                      />
                    </div>
                  )}
                  <div className={event.imageUrl ? 'md:w-2/3' : 'w-full'}>
                    <div className="flex items-center mb-4">
                      <span className="text-3xl font-bold text-accent">{event.year}</span>
                      <h3 className="text-2xl font-bold text-primary ml-4">{event.title}</h3>
                    </div>
                    <p className="text-lg">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      
      <TeamSection />
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary font-heading mb-4">Our Values</h2>
            <p className="text-lg max-w-3xl mx-auto">
              The core principles that guide our work and shape our approach to education and community service.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-cream p-8 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 bg-accent rounded-full mx-auto flex items-center justify-center mb-4">
                <i className="fas fa-book-open text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Authentic Knowledge</h3>
              <p>
                We are committed to preserving and promoting authentic Islamic knowledge based on the Quran and Sunnah, free from cultural additions and misconceptions.
              </p>
            </div>
            
            <div className="bg-cream p-8 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 bg-primary rounded-full mx-auto flex items-center justify-center mb-4">
                <i className="fas fa-handshake text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Compassionate Service</h3>
              <p>
                We believe in serving our community with compassion and empathy, following the prophetic example of kindness and generosity to all people.
              </p>
            </div>
            
            <div className="bg-cream p-8 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 bg-secondary rounded-full mx-auto flex items-center justify-center mb-4">
                <i className="fas fa-globe text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Universal Outreach</h3>
              <p>
                We strive to make Islamic knowledge accessible to all, regardless of background, language, or location, fostering a global community of seekers of knowledge.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
