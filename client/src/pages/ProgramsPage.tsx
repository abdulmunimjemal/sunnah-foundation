import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface Program {
  id: number;
  title: string;
  description: string;
  category: string;
  longDescription: string;
  imageUrl: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  createdAt: string;
}

const ProgramsPage = () => {
  // Set page title
  useEffect(() => {
    document.title = "Our Programs - Sunnah Foundation";
  }, []);

  const [activeCategory, setActiveCategory] = useState<string>("all");

  const { data: programs = [], isLoading } = useQuery<Program[]>({
    queryKey: ['/api/programs'],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/programs/categories'],
  });

  const filteredPrograms = activeCategory === "all" 
    ? programs 
    : programs.filter(program => program.category === activeCategory);

  return (
    <>
      <div className="bg-secondary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Our Programs</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Discover our diverse range of educational, spiritual, and community service programs designed to benefit people of all ages.
          </p>
        </div>
      </div>
      
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button 
              className={`px-4 py-2 rounded-full ${
                activeCategory === "all" ? "bg-primary text-white" : "bg-white text-secondary"
              } font-semibold transition`}
              onClick={() => setActiveCategory("all")}
            >
              All Programs
            </button>
            
            {categories.map(category => (
              <button 
                key={category.id}
                className={`px-4 py-2 rounded-full ${
                  activeCategory === category.name ? "bg-primary text-white" : "bg-white text-secondary"
                } font-semibold transition`}
                onClick={() => setActiveCategory(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-2/3"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredPrograms.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-bold text-secondary mb-2">No programs found</h3>
                  <p>Please try a different category or check back later.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPrograms.map(program => (
                    <div key={program.id} className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
                      <img 
                        src={program.imageUrl} 
                        alt={program.title} 
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <span className="inline-block px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-sm font-semibold mb-4">
                          {program.category}
                        </span>
                        <h3 className="text-xl font-bold mb-3">{program.title}</h3>
                        <p className="mb-4">{program.description}</p>
                        <button 
                          className="inline-flex items-center text-accent font-semibold hover:underline"
                          onClick={() => {
                            // This would typically navigate to a details page
                            // For now, let's just show an alert with the long description
                            alert(program.longDescription);
                          }}
                        >
                          Learn more <i className="fas fa-arrow-right ml-2"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
      
      <section id="youth" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="lg:flex items-center gap-10">
            <div className="lg:w-1/2 mb-8 lg:mb-0">
              <img 
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Youth Development" 
                className="rounded-lg shadow-xl w-full h-auto"
              />
            </div>
            <div className="lg:w-1/2">
              <span className="inline-block px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-sm font-semibold mb-4">
                Featured Program
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-primary font-heading mb-6">Youth Development</h2>
              <p className="text-lg mb-6">
                Our youth programs focus on building strong Islamic identity, leadership skills, and community engagement for young Muslims. Through mentorship, educational activities, and social events, we help youth navigate contemporary challenges while staying connected to their faith.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <i className="fas fa-check-circle text-accent mt-1 mr-3 text-xl"></i>
                  <div>
                    <h3 className="font-bold text-lg">Leadership Development</h3>
                    <p>Building future community leaders through workshops, retreats, and hands-on projects.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <i className="fas fa-check-circle text-accent mt-1 mr-3 text-xl"></i>
                  <div>
                    <h3 className="font-bold text-lg">Mentorship</h3>
                    <p>Connecting youth with knowledgeable mentors who provide guidance and support.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <i className="fas fa-check-circle text-accent mt-1 mr-3 text-xl"></i>
                  <div>
                    <h3 className="font-bold text-lg">Social Activities</h3>
                    <p>Creating a positive social environment for youth to build friendships and community bonds.</p>
                  </div>
                </div>
              </div>
              
              <button className="bg-accent hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-full transition duration-150">
                Register for Youth Program
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProgramsPage;
