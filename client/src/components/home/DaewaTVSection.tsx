import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface Video {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  views: number;
}

const DaewaTVSection = () => {
  const { data: videos = [], isLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos/featured'],
  });

  const { data: featuredVideo } = useQuery<Video>({
    queryKey: ['/api/videos/main-feature'],
  });

  return (
    <section id="tv" className="py-16 bg-secondary text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-heading mb-4">Daewa TV</h2>
          <p className="text-lg max-w-3xl mx-auto">
            Our media platform dedicated to spreading authentic Islamic knowledge and inspirational content.
          </p>
        </div>
        
        <div className="bg-white bg-opacity-10 p-6 rounded-lg mb-10">
          <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-lg mb-4">
            <div className="bg-black bg-opacity-50 w-full h-0 pb-[56.25%] relative rounded-lg">
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-play-circle text-6xl text-accent opacity-90 hover:opacity-100 cursor-pointer transition"></i>
              </div>
              <img 
                src={featuredVideo?.thumbnailUrl || "https://images.unsplash.com/photo-1556761175-129418cb2dfe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"} 
                alt={featuredVideo?.title || "Featured video thumbnail"} 
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2">
            {featuredVideo?.title || "Understanding the Essence of Sunnah in Modern Times"}
          </h3>
          <p>
            {featuredVideo?.description || "An in-depth discussion with renowned scholars about implementing the prophetic tradition in contemporary life."}
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white bg-opacity-10 rounded-lg overflow-hidden">
                <div className="relative w-full h-48 bg-gray-700 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse mb-3 w-3/4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-gray-700 rounded animate-pulse w-1/4"></div>
                    <div className="h-3 bg-gray-700 rounded animate-pulse w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-white bg-opacity-10 rounded-lg overflow-hidden transition-transform hover:scale-105">
                <div className="relative">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-40 transition">
                    <i className="fas fa-play-circle text-3xl text-accent"></i>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">{video.title}</h3>
                  <p className="text-sm mb-3">{video.description}</p>
                  <div className="flex justify-between items-center text-xs text-gray-300">
                    <span><i className="far fa-clock mr-1"></i> {video.duration}</span>
                    <span><i className="far fa-eye mr-1"></i> {video.views.toLocaleString()} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-10 text-center">
          <Link href="/daewa-tv">
            <a className="inline-block bg-accent hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-full transition duration-150">
              Explore All Videos
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DaewaTVSection;
