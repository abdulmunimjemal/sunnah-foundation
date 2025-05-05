import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";

interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  imageUrl: string;
  category: string;
  slug: string;
}

const NewsSection = () => {
  const { data: newsArticles = [], isLoading } = useQuery<NewsArticle[]>({
    queryKey: ['/api/news/featured'],
  });

  return (
    <section id="news" className="py-16 bg-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary font-heading mb-4">News & Updates</h2>
          <p className="text-lg max-w-3xl mx-auto">Stay informed about our latest activities, events, and achievements.</p>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg">
                <div className="md:flex">
                  <div className="md:w-2/5 bg-gray-200 h-48 md:h-auto animate-pulse"></div>
                  <div className="p-6 md:w-3/5">
                    <div className="flex items-center mb-2">
                      <div className="w-24 h-4 bg-gray-200 animate-pulse rounded"></div>
                      <div className="mx-2 text-gray-300">|</div>
                      <div className="w-16 h-6 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                    <div className="h-8 bg-gray-200 animate-pulse rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded mb-4 w-3/4"></div>
                    <div className="w-32 h-6 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {newsArticles.map((article) => (
              <div key={article.id} className="bg-white rounded-lg overflow-hidden shadow-lg">
                <div className="md:flex">
                  <div className="md:w-2/5">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 md:w-3/5">
                    <div className="flex items-center mb-2">
                      <span className="text-xs text-gray-500">
                        <i className="far fa-calendar-alt mr-1"></i> {formatDate(article.date)}
                      </span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="inline-block px-2 py-1 bg-primary bg-opacity-10 text-primary rounded text-xs">
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
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-12 text-center">
          <Link href="/news" className="inline-block bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-full transition duration-150">
            View All News
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
