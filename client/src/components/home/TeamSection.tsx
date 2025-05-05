import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

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

const TeamSection = () => {
  const { data: teamMembers = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ['/api/team/leadership'],
  });

  return (
    <section id="team" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary font-heading mb-4">Our Leadership Team</h2>
          <p className="text-lg max-w-3xl mx-auto">
            Meet the dedicated individuals who guide our organization with wisdom, experience, and a commitment to serving the community.
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-4 mx-auto w-48 h-48 rounded-full overflow-hidden bg-gray-200 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2 w-2/3 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-1/2 mx-auto"></div>
                <div className="h-16 bg-gray-200 rounded animate-pulse mb-4 w-5/6 mx-auto"></div>
                <div className="flex justify-center space-x-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="text-center">
                <div className="relative mb-4 mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-primary">
                  <img 
                    src={member.imageUrl} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-secondary">{member.name}</h3>
                <p className="text-primary font-semibold mb-2">{member.title}</p>
                <p className="text-sm mb-4">{member.bio}</p>
                <div className="flex justify-center space-x-3">
                  {member.socialLinks.linkedin && (
                    <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-accent transition">
                      <i className="fab fa-linkedin"></i>
                    </a>
                  )}
                  {member.socialLinks.twitter && (
                    <a href={member.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-accent transition">
                      <i className="fab fa-twitter"></i>
                    </a>
                  )}
                  {member.socialLinks.email && (
                    <a href={`mailto:${member.socialLinks.email}`} className="text-secondary hover:text-accent transition">
                      <i className="fas fa-envelope"></i>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-12 text-center">
          <Link href="/about#team" className="inline-block bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-full transition duration-150">
              Meet Our Full Team
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
