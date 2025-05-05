import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  newsletter: boolean;
}

const ContactPage = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
    newsletter: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/contact", formData);
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you soon.",
        variant: "default",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        newsletter: false,
      });
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const locations = [
    {
      name: "Main Campus",
      address: ["123 Guidance Way", "Knowledge City, KS 12345", "United States"]
    },
    {
      name: "Community Center",
      address: ["456 Wisdom Avenue", "Learning Town, LT 67890", "United States"]
    }
  ];

  const contactInfo = [
    {
      icon: "fas fa-phone-alt",
      title: "Phone",
      content: "(123) 456-7890"
    },
    {
      icon: "fas fa-envelope",
      title: "Email",
      content: "info@sunnahfoundation.org"
    },
    {
      icon: "fas fa-clock",
      title: "Office Hours",
      content: "Monday - Friday: 9:00 AM - 5:00 PM\nSaturday: 10:00 AM - 2:00 PM\nSunday: Closed"
    }
  ];

  const faqs = [
    {
      question: "How can I donate to the Sunnah Foundation?",
      answer: "You can donate through our website's donation page, by mail, or by contacting our office directly. We accept various payment methods including credit cards, PayPal, and bank transfers."
    },
    {
      question: "How can I volunteer with the Sunnah Foundation?",
      answer: "You can apply to volunteer through our 'Get Involved' page. We have various volunteer opportunities ranging from teaching and tutoring to administrative support and event organization."
    },
    {
      question: "What programs does the Sunnah Foundation offer?",
      answer: "We offer a wide range of educational programs, community services, youth development initiatives, and humanitarian aid projects. Visit our 'Programs' page to learn more about specific offerings."
    },
    {
      question: "Are donations to the Sunnah Foundation tax-deductible?",
      answer: "Yes, the Sunnah Foundation is a registered non-profit organization, and all donations are tax-deductible to the extent allowed by law. You will receive a receipt for your donation."
    },
    {
      question: "How can I enroll in courses at Sunnah University?",
      answer: "You can apply for admission through our 'Sunnah University' page. The application process involves filling out an online form, taking an entrance assessment, and participating in an interview."
    }
  ];

  return (
    <>
      <div className="bg-secondary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Contact Us</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Have questions or want to get involved? Reach out to us through any of the channels below.
          </p>
        </div>
      </div>
      
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Locations */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold text-primary mb-4">Our Locations</h3>
                
                <div className="space-y-6">
                  {locations.map((location, index) => (
                    <div key={index} className="flex">
                      <div className="mr-4 text-accent">
                        <i className="fas fa-map-marker-alt text-2xl"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-1">{location.name}</h4>
                        <address className="not-italic">
                          {location.address.map((line, i) => (
                            <span key={i}>
                              {line}<br />
                            </span>
                          ))}
                        </address>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Map placeholder */}
                <div className="mt-6 rounded-lg overflow-hidden h-64 bg-gray-100">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387193.3059353029!2d-74.25986548248684!3d40.69714941662792!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1620160466194!5m2!1sen!2s" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={false} 
                    loading="lazy"
                    title="Sunnah Foundation Location"
                  ></iframe>
                </div>
              </div>
              
              {/* Contact Information */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold text-primary mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex">
                      <div className="mr-4 text-accent">
                        <i className={`${info.icon} text-xl`}></i>
                      </div>
                      <div>
                        <h4 className="font-bold mb-1">{info.title}</h4>
                        <p style={{ whiteSpace: 'pre-line' }}>{info.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <h4 className="font-bold mb-3">Follow Us</h4>
                  <div className="flex space-x-4 text-2xl">
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
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-accent transition">
                      <i className="fab fa-linkedin"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-primary mb-4">Send Us a Message</h3>
              
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-secondary font-semibold mb-2">Your Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-secondary font-semibold mb-2">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-secondary font-semibold mb-2">Subject</label>
                  <input 
                    type="text" 
                    id="subject" 
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-secondary font-semibold mb-2">Message</label>
                  <textarea 
                    id="message" 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5} 
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  ></textarea>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="newsletter" 
                    name="newsletter"
                    checked={formData.newsletter}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label htmlFor="newsletter">Subscribe to our newsletter</label>
                </div>
                
                <button 
                  type="submit" 
                  className="bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-full transition duration-150"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary font-heading mb-4">Frequently Asked Questions</h2>
            <p className="text-lg max-w-3xl mx-auto">
              Find answers to common questions about the Sunnah Foundation, our programs, and how to get involved.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-cream rounded-lg p-6 shadow">
                  <h3 className="text-xl font-bold text-primary mb-2">{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-lg mb-4">
                Can't find what you're looking for? Contact us directly and we'll be happy to help.
              </p>
              <button className="bg-accent hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-full transition duration-150">
                Ask a Question
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
