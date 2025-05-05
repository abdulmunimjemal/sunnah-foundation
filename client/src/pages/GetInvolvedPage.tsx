import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DonationFormData {
  firstName: string;
  lastName: string;
  email: string;
  amount: number;
  paymentMethod: string;
  recurring: boolean;
}

interface VolunteerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  areas: string[];
  availability: string[];
  message: string;
}

const GetInvolvedPage = () => {
  // Set page title
  useEffect(() => {
    document.title = "Get Involved - Sunnah Foundation";
  }, []);

  // Donation form state
  const [donationForm, setDonationForm] = useState<DonationFormData>({
    firstName: "",
    lastName: "",
    email: "",
    amount: 50,
    paymentMethod: "credit",
    recurring: false,
  });
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);
  const [customAmount, setCustomAmount] = useState<boolean>(false);

  // Volunteer form state
  const [volunteerForm, setVolunteerForm] = useState<VolunteerFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    areas: [],
    availability: [],
    message: "",
  });
  const [isSubmittingVolunteer, setIsSubmittingVolunteer] = useState(false);

  const { toast } = useToast();

  const donationAmounts = [25, 50, 100, 250, 500];
  
  const volunteerAreas = [
    "Teaching and tutoring",
    "Event organization",
    "Community outreach",
    "Administrative support",
    "Media and graphic design",
    "Food bank assistance",
    "Fundraising",
    "Translation services"
  ];

  const availabilityOptions = [
    "Weekday mornings",
    "Weekday afternoons",
    "Weekday evenings",
    "Weekend mornings",
    "Weekend afternoons",
    "Weekend evenings",
    "Remote/online only"
  ];

  const handleDonationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDonationForm((prev) => ({
      ...prev,
      [name]: name === "recurring" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleAmountSelect = (amount: number) => {
    setCustomAmount(false);
    setDonationForm((prev) => ({ ...prev, amount }));
  };

  const handleVolunteerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVolunteerForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAreaChange = (area: string) => {
    setVolunteerForm((prev) => {
      const areas = prev.areas.includes(area)
        ? prev.areas.filter(a => a !== area)
        : [...prev.areas, area];
      return { ...prev, areas };
    });
  };

  const handleAvailabilityChange = (time: string) => {
    setVolunteerForm((prev) => {
      const availability = prev.availability.includes(time)
        ? prev.availability.filter(a => a !== time)
        : [...prev.availability, time];
      return { ...prev, availability };
    });
  };

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDonation(true);
    
    try {
      await apiRequest("POST", "/api/donations", donationForm);
      toast({
        title: "Donation Received!",
        description: "Thank you for your generous contribution.",
        variant: "default",
      });
      setDonationForm({
        firstName: "",
        lastName: "",
        email: "",
        amount: 50,
        paymentMethod: "credit",
        recurring: false,
      });
    } catch (error) {
      toast({
        title: "Donation Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingDonation(false);
    }
  };

  const handleVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingVolunteer(true);
    
    try {
      await apiRequest("POST", "/api/volunteers", volunteerForm);
      toast({
        title: "Volunteer Application Submitted!",
        description: "Thank you for your interest. We'll contact you soon.",
        variant: "default",
      });
      setVolunteerForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        areas: [],
        availability: [],
        message: "",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingVolunteer(false);
    }
  };

  return (
    <>
      <div className="bg-secondary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Get Involved</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Join us in our mission to spread authentic knowledge and serve the community. There are many ways you can contribute.
          </p>
        </div>
      </div>
      
      <section id="donate" className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 bg-primary p-8 text-white">
                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-hand-holding-heart text-white text-3xl"></i>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-center">Your Donation Makes a Difference</h2>
                <p className="mb-6">
                  Your contribution helps us provide educational programs, community services, and humanitarian aid to those in need.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <i className="fas fa-book text-accent mt-1 mr-3"></i>
                    <p>Support Islamic education and scholarship</p>
                  </div>
                  <div className="flex items-start">
                    <i className="fas fa-mosque text-accent mt-1 mr-3"></i>
                    <p>Help develop community programs</p>
                  </div>
                  <div className="flex items-start">
                    <i className="fas fa-hands-helping text-accent mt-1 mr-3"></i>
                    <p>Contribute to humanitarian initiatives</p>
                  </div>
                  <div className="flex items-start">
                    <i className="fas fa-graduation-cap text-accent mt-1 mr-3"></i>
                    <p>Support student scholarships</p>
                  </div>
                </div>
              </div>
              
              <div className="md:w-2/3 p-8">
                <h3 className="text-2xl font-bold text-primary mb-6">Make a Donation</h3>
                
                <form onSubmit={handleDonationSubmit}>
                  <div className="mb-6">
                    <label className="block text-secondary font-semibold mb-2">Donation Amount</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {donationAmounts.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          className={`px-4 py-2 rounded-full ${
                            !customAmount && donationForm.amount === amount
                              ? "bg-accent text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-secondary"
                          } font-semibold transition`}
                          onClick={() => handleAmountSelect(amount)}
                        >
                          ${amount}
                        </button>
                      ))}
                      <button
                        type="button"
                        className={`px-4 py-2 rounded-full ${
                          customAmount
                            ? "bg-accent text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-secondary"
                        } font-semibold transition`}
                        onClick={() => setCustomAmount(true)}
                      >
                        Custom
                      </button>
                    </div>
                    
                    {customAmount && (
                      <div className="mt-3">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            name="amount"
                            value={donationForm.amount}
                            onChange={handleDonationChange}
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                            min="1"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label htmlFor="firstName" className="block text-secondary font-semibold mb-2">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={donationForm.firstName}
                        onChange={handleDonationChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-secondary font-semibold mb-2">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={donationForm.lastName}
                        onChange={handleDonationChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-secondary font-semibold mb-2">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={donationForm.email}
                      onChange={handleDonationChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="paymentMethod" className="block text-secondary font-semibold mb-2">Payment Method</label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      value={donationForm.paymentMethod}
                      onChange={handleDonationChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    >
                      <option value="credit">Credit Card</option>
                      <option value="paypal">PayPal</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>
                  
                  <div className="mb-6 flex items-center">
                    <input
                      type="checkbox"
                      id="recurring"
                      name="recurring"
                      checked={donationForm.recurring}
                      onChange={handleDonationChange}
                      className="mr-2"
                    />
                    <label htmlFor="recurring" className="text-secondary">Make this a monthly recurring donation</label>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-accent hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-full transition duration-150"
                    disabled={isSubmittingDonation}
                  >
                    {isSubmittingDonation ? "Processing..." : "Donate Now"}
                  </button>
                  
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Your donation is tax-deductible. You will receive a receipt via email.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section id="volunteer" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary font-heading mb-4">Volunteer Opportunities</h2>
            <p className="text-lg max-w-3xl mx-auto">
              Share your time, skills, and expertise to help us make a difference in our community and educational initiatives.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-cream p-8 rounded-lg shadow-lg mb-12">
              <h3 className="text-2xl font-bold text-primary mb-6">Current Volunteer Needs</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-lg shadow">
                  <div className="flex items-center mb-3">
                    <i className="fas fa-chalkboard-teacher text-accent text-2xl mr-3"></i>
                    <h4 className="text-xl font-bold">Teachers & Tutors</h4>
                  </div>
                  <p>Help teach Quran, Islamic studies, and academic subjects to students of all ages.</p>
                </div>
                
                <div className="bg-white p-5 rounded-lg shadow">
                  <div className="flex items-center mb-3">
                    <i className="fas fa-calendar-alt text-accent text-2xl mr-3"></i>
                    <h4 className="text-xl font-bold">Event Organizers</h4>
                  </div>
                  <p>Assist with planning, organizing, and running educational and community events.</p>
                </div>
                
                <div className="bg-white p-5 rounded-lg shadow">
                  <div className="flex items-center mb-3">
                    <i className="fas fa-hands-helping text-accent text-2xl mr-3"></i>
                    <h4 className="text-xl font-bold">Community Outreach</h4>
                  </div>
                  <p>Help connect our foundation with the broader community through engagement initiatives.</p>
                </div>
                
                <div className="bg-white p-5 rounded-lg shadow">
                  <div className="flex items-center mb-3">
                    <i className="fas fa-utensils text-accent text-2xl mr-3"></i>
                    <h4 className="text-xl font-bold">Food Bank Volunteers</h4>
                  </div>
                  <p>Support our food bank by organizing donations, preparing packages, and distribution.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-primary mb-6">Volunteer Application Form</h3>
              
              <form onSubmit={handleVolunteerSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="v-firstName" className="block text-secondary font-semibold mb-2">First Name</label>
                    <input
                      type="text"
                      id="v-firstName"
                      name="firstName"
                      value={volunteerForm.firstName}
                      onChange={handleVolunteerChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="v-lastName" className="block text-secondary font-semibold mb-2">Last Name</label>
                    <input
                      type="text"
                      id="v-lastName"
                      name="lastName"
                      value={volunteerForm.lastName}
                      onChange={handleVolunteerChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="v-email" className="block text-secondary font-semibold mb-2">Email Address</label>
                    <input
                      type="email"
                      id="v-email"
                      name="email"
                      value={volunteerForm.email}
                      onChange={handleVolunteerChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="v-phone" className="block text-secondary font-semibold mb-2">Phone Number</label>
                    <input
                      type="tel"
                      id="v-phone"
                      name="phone"
                      value={volunteerForm.phone}
                      onChange={handleVolunteerChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-secondary font-semibold mb-3">Areas of Interest (select all that apply)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {volunteerAreas.map((area) => (
                      <div key={area} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`area-${area.replace(/\s+/g, '-').toLowerCase()}`}
                          checked={volunteerForm.areas.includes(area)}
                          onChange={() => handleAreaChange(area)}
                          className="mr-2"
                        />
                        <label htmlFor={`area-${area.replace(/\s+/g, '-').toLowerCase()}`}>{area}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-secondary font-semibold mb-3">Availability (select all that apply)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availabilityOptions.map((time) => (
                      <div key={time} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`time-${time.replace(/\s+/g, '-').toLowerCase()}`}
                          checked={volunteerForm.availability.includes(time)}
                          onChange={() => handleAvailabilityChange(time)}
                          className="mr-2"
                        />
                        <label htmlFor={`time-${time.replace(/\s+/g, '-').toLowerCase()}`}>{time}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="v-message" className="block text-secondary font-semibold mb-2">Tell us about yourself and why you want to volunteer</label>
                  <textarea
                    id="v-message"
                    name="message"
                    value={volunteerForm.message}
                    onChange={handleVolunteerChange}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-full transition duration-150"
                  disabled={isSubmittingVolunteer}
                >
                  {isSubmittingVolunteer ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary font-heading mb-4">Other Ways to Support</h2>
            <p className="text-lg max-w-3xl mx-auto">
              Beyond donations and volunteering, there are many other ways you can support our mission.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg overflow-hidden shadow-lg text-center p-8">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-bullhorn text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-primary mb-4">Spread the Word</h3>
              <p className="mb-6">
                Help us reach more people by sharing our mission and programs with your friends, family, and social networks.
              </p>
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
              </div>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-lg text-center p-8">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-box-open text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-primary mb-4">In-Kind Donations</h3>
              <p className="mb-6">
                Donate books, educational materials, food items, or other goods that can support our programs and community initiatives.
              </p>
              <button className="inline-block bg-primary hover:bg-opacity-90 text-white font-bold py-2 px-6 rounded-full transition duration-150">
                Learn More
              </button>
            </div>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-lg text-center p-8">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-handshake text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-primary mb-4">Corporate Partnerships</h3>
              <p className="mb-6">
                Partner with us to develop initiatives that align with your organization's values and make a meaningful impact in the community.
              </p>
              <button className="inline-block bg-accent hover:bg-opacity-90 text-white font-bold py-2 px-6 rounded-full transition duration-150">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default GetInvolvedPage;
