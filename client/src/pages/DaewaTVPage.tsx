import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface Video {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  views: number;
  date: string;
  category: string;
}

const DaewaTVPage = () => {
  // Set page title
  useEffect(() => {
    document.title = "Daewa TV - Sunnah Foundation";
  }, []);
  
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data: videos = [], isLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
  });

  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ['/api/videos/categories'],
  });

  const { data: featuredVideo } = useQuery<Video>({
    queryKey: ['/api/videos/main-feature'],
  });

  const filteredVideos = videos
    .filter(video => activeCategory === "all" || video.category === activeCategory)
    .filter(video => searchTerm === "" || video.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <div className="bg-secondary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Daewa TV</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Our media platform dedicated to spreading authentic Islamic knowledge and inspirational content.
          </p>
          <div className="mt-8 max-w-md mx-auto">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search videos..." 
                className="w-full px-4 py-2 rounded-full text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary font-heading mb-8">Featured Video</h2>
          
          {!featuredVideo ? (
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg animate-pulse mb-8"></div>
          ) : (
            <div className="mb-8">
              <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-lg mb-4">
                <div className="bg-black bg-opacity-50 w-full h-0 pb-[56.25%] relative rounded-lg">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fas fa-play-circle text-6xl text-accent opacity-90 hover:opacity-100 cursor-pointer transition"></i>
                  </div>
                  <img 
                    src={featuredVideo.thumbnailUrl} 
                    alt={featuredVideo.title} 
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">{featuredVideo.title}</h3>
              <p className="mb-4">{featuredVideo.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span><i className="far fa-calendar-alt mr-1"></i> {featuredVideo.date}</span>
                <span><i className="far fa-eye mr-1"></i> {featuredVideo.views.toLocaleString()} views</span>
                <span><i className="far fa-clock mr-1"></i> {featuredVideo.duration}</span>
                <span><i className="fas fa-tag mr-1"></i> {featuredVideo.category}</span>
              </div>
            </div>
          )}
        </div>
      </section>
      
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-primary font-heading">All Videos</h2>
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-4 py-2 rounded-full text-sm ${
                  activeCategory === "all" ? "bg-primary text-white" : "bg-white text-secondary"
                } font-semibold transition`}
                onClick={() => setActiveCategory("all")}
              >
                All
              </button>
              
              {categories.map(category => (
                <button 
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm ${
                    activeCategory === category ? "bg-primary text-white" : "bg-white text-secondary"
                  } font-semibold transition`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-3 w-3/4"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredVideos.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg">
                  <i className="fas fa-search text-gray-400 text-5xl mb-4"></i>
                  <h3 className="text-xl font-bold text-secondary mb-2">No videos found</h3>
                  <p>Try adjusting your search or filter to find what you're looking for.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredVideos.map(video => (
                    <div key={video.id} className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
                      <div className="relative">
                        <img 
                          src={video.thumbnailUrl} 
                          alt={video.title} 
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-40 transition">
                          <i className="fas fa-play-circle text-3xl text-accent"></i>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold mb-2">{video.title}</h3>
                        <p className="text-sm mb-3 text-gray-600 line-clamp-2">{video.description}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span><i className="far fa-calendar-alt mr-1"></i> {video.date}</span>
                          <span><i className="far fa-eye mr-1"></i> {video.views.toLocaleString()} views</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          
          {filteredVideos.length > 0 && (
            <div className="mt-10 text-center">
              <button className="bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-full transition duration-150">
                Load More Videos
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default DaewaTVPage;
