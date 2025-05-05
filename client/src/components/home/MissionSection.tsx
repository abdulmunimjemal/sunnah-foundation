const MissionSection = () => {
  const missionPoints = [
    {
      icon: "fas fa-book-open",
      title: "Authentic Knowledge",
      description: "Providing access to reliable Islamic teachings based on authentic sources"
    },
    {
      icon: "fas fa-hands-helping",
      title: "Community Service",
      description: "Supporting those in need through various humanitarian initiatives"
    },
    {
      icon: "fas fa-graduation-cap",
      title: "Education",
      description: "Developing comprehensive educational programs for all age groups"
    },
    {
      icon: "fas fa-heart",
      title: "Spiritual Growth",
      description: "Nurturing spiritual development through guidance and support"
    }
  ];

  return (
    <section id="mission" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-primary font-heading mb-6">Our Mission</h2>
            <p className="text-lg mb-6">
              The Sunnah Foundation is dedicated to preserving and promoting the teachings of the Prophet Muhammad (peace be upon him) through education, community engagement, and spiritual development.
            </p>
            <p className="text-lg mb-6">
              We strive to make authentic Islamic knowledge accessible to all, foster community bonds, and inspire individuals to embody the values of compassion, knowledge, and service.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {missionPoints.map((point, index) => (
                <div key={index} className="flex items-start">
                  <div className="mr-4 text-accent">
                    <i className={`${point.icon} text-2xl`}></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">{point.title}</h3>
                    <p>{point.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:w-1/2 overflow-hidden rounded-lg shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1589825543667-8b0d7df51087?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Students learning in a classroom setting" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
