import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const GetInvolvedSection = () => {
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const donationOptions = ["$25", "$50", "$100", "$250", "Other"];

  const handleDonationClick = (amount: string) => {
    setDonationAmount(amount);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
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

  const volunteerOpportunities = [
    "Teaching and tutoring",
    "Event organization",
    "Community outreach",
    "Administrative support"
  ];

  return (
    <section id="involved" className="py-16 bg-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary font-heading mb-4">Get Involved</h2>
          <p className="text-lg max-w-3xl mx-auto">
            Join us in our mission to spread authentic knowledge and serve the community. There are many ways you can contribute.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Donate Card */}
          <div className="bg-white rounded-lg overflow-hidden shadow-lg text-center p-8">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-hand-holding-heart text-white text-3xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-primary mb-4">Donate</h3>
            <p className="mb-6">
              Support our educational programs, community services, and humanitarian initiatives through your generous contributions.
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {donationOptions.map((amount) => (
                <button 
                  key={amount}
                  className={`${
                    donationAmount === amount 
                      ? "bg-accent text-white" 
                      : "bg-gray-100 hover:bg-gray-200 text-secondary"
                  } font-semibold py-2 px-4 rounded transition`}
                  onClick={() => handleDonationClick(amount)}
                >
                  {amount}
                </button>
              ))}
            </div>
            
            <Link href="/get-involved#donate" className="inline-block bg-accent hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-full transition duration-150 w-full">
              Donate Now
            </Link>
          </div>
          
          {/* Volunteer Card */}
          <div className="bg-white rounded-lg overflow-hidden shadow-lg text-center p-8">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-users text-white text-3xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-primary mb-4">Volunteer</h3>
            <p className="mb-6">
              Share your time, skills, and expertise to help us make a difference in our community and educational initiatives.
            </p>
            
            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-3">Volunteer Opportunities:</h4>
              <ul className="space-y-2 text-left">
                {volunteerOpportunities.map((opportunity, index) => (
                  <li key={index} className="flex items-start">
                    <i className="fas fa-check text-accent mt-1 mr-2"></i>
                    <span>{opportunity}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <Link href="/get-involved#volunteer" className="inline-block bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-full transition duration-150 w-full">
              Become a Volunteer
            </Link>
          </div>
          
          {/* Stay Connected Card */}
          <div className="bg-white rounded-lg overflow-hidden shadow-lg text-center p-8">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-envelope-open-text text-white text-3xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-primary mb-4">Stay Connected</h3>
            <p className="mb-6">
              Subscribe to our newsletter and follow us on social media to stay updated with our programs and events.
            </p>
            
            <form className="mb-6" onSubmit={handleNewsletterSubmit}>
              <div className="mb-4">
                <input 
                  type="email" 
                  placeholder="Your Email Address" 
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="bg-secondary hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-full transition duration-150 w-full"
              >
                Subscribe to Newsletter
              </button>
            </form>
            
            <div className="flex justify-center space-x-4 text-2xl">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-accent transition">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-accent transition">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-accent transition">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-accent transition">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GetInvolvedSection;
