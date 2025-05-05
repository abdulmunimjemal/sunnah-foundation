import { Link } from "wouter";

const UniversitySection = () => {
  const degreePrograms = [
    "Bachelor of Arts in Islamic Studies",
    "Master of Arts in Islamic Theology",
    "Diploma in Quranic Sciences",
    "Certificate in Hadith Studies"
  ];

  const studyOptions = [
    "Full-time on-campus learning",
    "Part-time evening classes",
    "Online distance learning",
    "Blended learning options"
  ];

  return (
    <section id="university" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-10">
          <div className="lg:w-1/2 overflow-hidden rounded-lg shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Sunnah University Campus" 
              className="w-full h-auto object-cover"
            />
          </div>
          
          <div className="lg:w-1/2">
            <div className="flex items-center mb-4">
              <h2 className="text-3xl md:text-4xl font-bold text-primary font-heading">Sunnah University</h2>
              <span className="ml-4 px-3 py-1 bg-accent text-white text-sm rounded-full">Online & On-Campus</span>
            </div>
            
            <p className="text-lg mb-6">
              Sunnah University offers comprehensive Islamic education through accredited degree programs, combining traditional Islamic sciences with contemporary relevance.
            </p>
            
            <div className="space-y-6 mb-8">
              <div className="bg-cream p-5 rounded-lg">
                <h3 className="font-bold text-xl mb-2">Degree Programs</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {degreePrograms.map((program, index) => (
                    <li key={index}>{program}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-cream p-5 rounded-lg">
                <h3 className="font-bold text-xl mb-2">Study Options</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {studyOptions.map((option, index) => (
                    <li key={index}>{option}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/university/courses" className="bg-accent hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-full transition duration-150">
                Browse Courses
              </Link>
              <Link href="/university/admission" className="bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-full transition duration-150">
                Apply for Admission
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UniversitySection;
