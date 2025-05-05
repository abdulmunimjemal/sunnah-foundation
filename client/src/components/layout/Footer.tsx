import { Link } from "wouter";
import { SunnahLogo } from "@/components/ui/sunnahlogo";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const Footer = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("POST", "/api/newsletter/subscribe", { email });
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
        variant: "default",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Failed to subscribe",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <footer className="bg-secondary text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <SunnahLogo className="h-16 mb-4 text-white" />
            <p className="mb-4">
              The Sunnah Foundation is dedicated to spreading authentic Islamic knowledge and serving communities worldwide through education, outreach, and humanitarian efforts.
            </p>
            <div className="flex space-x-4 text-lg">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent transition">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent transition">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent transition">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent transition">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-xl font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/"><a className="hover:text-accent transition">Home</a></Link></li>
              <li><Link href="/about"><a className="hover:text-accent transition">About Us</a></Link></li>
              <li><Link href="/programs"><a className="hover:text-accent transition">Our Programs</a></Link></li>
              <li><Link href="/university"><a className="hover:text-accent transition">Sunnah University</a></Link></li>
              <li><Link href="/daewa-tv"><a className="hover:text-accent transition">Daewa TV</a></Link></li>
              <li><Link href="/get-involved"><a className="hover:text-accent transition">Get Involved</a></Link></li>
              <li><Link href="/news"><a className="hover:text-accent transition">News & Updates</a></Link></li>
              <li><Link href="/contact"><a className="hover:text-accent transition">Contact Us</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xl font-bold mb-4">Our Programs</h4>
            <ul className="space-y-2">
              <li><Link href="/programs#youth"><a className="hover:text-accent transition">Youth Development</a></Link></li>
              <li><Link href="/programs#quran"><a className="hover:text-accent transition">Quran Learning</a></Link></li>
              <li><Link href="/programs#community"><a className="hover:text-accent transition">Community Services</a></Link></li>
              <li><Link href="/programs#family"><a className="hover:text-accent transition">Family Support</a></Link></li>
              <li><Link href="/programs#courses"><a className="hover:text-accent transition">Islamic Studies</a></Link></li>
              <li><Link href="/programs#outreach"><a className="hover:text-accent transition">Community Outreach</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xl font-bold mb-4">Contact Information</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-3"></i>
                <span>123 Guidance Way, Knowledge City, KS 12345</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-phone-alt mt-1 mr-3"></i>
                <span>(123) 456-7890</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-envelope mt-1 mr-3"></i>
                <span>info@sunnahfoundation.org</span>
              </li>
            </ul>
            
            <div className="mt-6">
              <h4 className="text-lg font-bold mb-2">Subscribe to Our Newsletter</h4>
              <form className="flex" onSubmit={handleSubmit}>
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-4 py-2 rounded-l w-full focus:outline-none text-secondary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button 
                  type="submit" 
                  className="bg-accent hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-r focus:outline-none"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-700 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Sunnah Foundation. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy-policy"><a className="hover:text-accent transition">Privacy Policy</a></Link>
            <Link href="/terms-of-service"><a className="hover:text-accent transition">Terms of Service</a></Link>
            <Link href="/sitemap"><a className="hover:text-accent transition">Sitemap</a></Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
