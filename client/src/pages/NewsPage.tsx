import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { Link, useLocation } from "wouter";

interface NewsArticle {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  author: string;
  imageUrl: string;
  category: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  createdAt: string;
}

const NewsPage = () => {
  // Set page title
  useEffect(() => {
    document.title = "News & Updates - Sunnah Foundation";
  }, []);

  const [location, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6;

  const { data: articles = [], isLoading } = useQuery<NewsArticle[]>({
    queryKey: ['/api/news'],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/news/categories'],
  });

  // Filter articles based on category and search term
  const filteredArticles = articles
    .filter(article => activeCategory === "all" || article.category === activeCategory)
    .filter(article => 
      searchTerm === "" || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Pagination
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on search
  };

  return (
    <>
      <div className="bg-secondary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">News & Updates</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Stay informed about our latest activities, events, and achievements at the Sunnah Foundation.
          </p>
        </div>
      </div>
      
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Main content */}
            <div className="md:w-3/4">
              {/* Search results message */}
              {searchTerm && (
                <div className="mb-6">
                  <p className="text-lg">
                    Showing results for: <span className="font-semibold">{searchTerm}</span>
                    {activeCategory !== "all" && (
                      <span> in <span className="font-semibold">{activeCategory}</span></span>
                    )}
                  </p>
                </div>
              )}
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg">
                      <div className="h-48 bg-gray-200 animate-pulse"></div>
                      <div className="p-6">
                        <div className="flex items-center mb-2">
                          <div className="w-24 h-4 bg-gray-200 animate-pulse rounded"></div>
                          <div className="mx-2 text-gray-300">|</div>
                          <div className="w-16 h-6 bg-gray-200 animate-pulse rounded"></div>
                        </div>
                        <div className="h-8 bg-gray-200 animate-pulse rounded mb-3"></div>
                        <div className="h-4 bg-gray-200 animate-pulse rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 animate-pulse rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 animate-pulse rounded mb-4 w-3/4"></div>
                        <div className="w-32 h-6 bg-gray-200 animate-pulse rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {currentArticles.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                      <i className="fas fa-search text-gray-400 text-5xl mb-4"></i>
                      <h3 className="text-xl font-bold text-secondary mb-2">No articles found</h3>
                      <p className="mb-4">Try adjusting your search criteria or browse all articles.</p>
                      <button 
                        className="bg-primary hover:bg-opacity-90 text-white font-bold py-2 px-6 rounded-full transition duration-150"
                        onClick={() => {
                          setSearchTerm("");
                          setActiveCategory("all");
                        }}
                      >
                        View All Articles
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {currentArticles.map(article => (
                        <div key={article.id} className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
                          <img 
                            src={article.imageUrl} 
                            alt={article.title} 
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-6">
                            <div className="flex items-center mb-2">
                              <span className="text-xs text-gray-500">
                                <i className="far fa-calendar-alt mr-1"></i> {formatDate(article.date)}
                              </span>
                              <span className="mx-2 text-gray-300">|</span>
                              <span className="inline-block px-2 py-1 bg-primary bg-opacity-10 text-white rounded text-xs">
                                {article.category}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">{article.title}</h3>
                            <p className="mb-4">{article.excerpt}</p>
                            <Link href={`/news/${article.slug}`} className="inline-flex items-center text-accent font-semibold hover:underline">
                              Read full story <i className="fas fa-arrow-right ml-2"></i>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Pagination */}
                  {filteredArticles.length > articlesPerPage && (
                    <div className="mt-10 flex justify-center">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`px-4 py-2 rounded-md ${
                            currentPage === 1 
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                              : "bg-primary text-white hover:bg-opacity-90"
                          }`}
                        >
                          <i className="fas fa-chevron-left"></i>
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => paginate(i + 1)}
                            className={`px-4 py-2 rounded-md ${
                              currentPage === i + 1
                                ? "bg-accent text-white"
                                : "bg-gray-200 text-secondary hover:bg-gray-300"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        
                        <button 
                          onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`px-4 py-2 rounded-md ${
                            currentPage === totalPages 
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                              : "bg-primary text-white hover:bg-opacity-90"
                          }`}
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="md:w-1/4">
              {/* Search */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-primary mb-4">Search</h3>
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search articles..." 
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button 
                      type="submit" 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Categories */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-primary mb-4">Categories</h3>
                <ul className="space-y-2">
                  <li>
                    <button 
                      className={`w-full text-left px-2 py-1 rounded ${
                        activeCategory === "all" ? "bg-primary text-white" : "hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        setActiveCategory("all");
                        setCurrentPage(1);
                      }}
                    >
                      All Categories
                    </button>
                  </li>
                  {categories.map(category => (
                    <li key={category.id}>
                      <button 
                        className={`w-full text-left px-2 py-1 rounded ${
                          activeCategory === category.name ? "bg-primary text-white" : "hover:bg-gray-100"
                        }`}
                        onClick={() => {
                          setActiveCategory(category.name);
                          setCurrentPage(1);
                        }}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Recent Posts */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-primary mb-4">Recent Posts</h3>
                <ul className="space-y-4">
                  {isLoading ? (
                    [...Array(5)].map((_, index) => (
                      <li key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        <div className="h-5 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      </li>
                    ))
                  ) : (
                    articles.slice(0, 5).map(article => (
                      <li key={article.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        <Link href={`/news/${article.slug}`} className="font-semibold hover:text-accent transition">
                          {article.title}
                        </Link>
                        <p className="text-sm text-gray-500">{formatDate(article.date)}</p>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary font-heading mb-6">Stay Updated</h2>
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

export default NewsPage;
