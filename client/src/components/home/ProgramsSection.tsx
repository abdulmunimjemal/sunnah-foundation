import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface Program {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  slug: string;
}

const ProgramsSection = () => {
  const [location] = useLocation();
  
  const { data: programs = [], isLoading } = useQuery<Program[]>({
    queryKey: ['/api/programs/featured'],
  });

  return (
    <section id="programs" className="py-16 bg-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary font-heading mb-4">Our Programs</h2>
          <p className="text-lg max-w-3xl mx-auto">
            Discover our range of educational initiatives, community services, and spiritual development programs designed to benefit people of all ages and backgrounds.
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg">
                <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-1/3"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-2/3"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program) => (
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
                  <Link href={`/programs/${program.slug}`} className="inline-flex items-center text-accent font-semibold hover:underline">
                    Learn more <i className="fas fa-arrow-right ml-2"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-12 text-center">
          <Link href="/programs">
            <a className="inline-block bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-full transition duration-150">
              View All Programs
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
