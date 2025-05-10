import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface Course {
  id: number;
  title: string;
  description: string;
  level: string;
  duration: string;
  instructors: string[];
  imageUrl: string;
}

interface FacultyMember {
  id: number;
  name: string;
  title: string;
  specialization: string;
  bio: string;
  imageUrl: string;
}

const UniversityPage = () => {
  // Set page title
  useEffect(() => {
    document.title = "Sunnah University - Islamic Education";
  }, []);

  const [activeTab, setActiveTab] = useState<string>("courses");

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['/api/university/courses'],
  });

  const { data: faculty = [], isLoading: facultyLoading } = useQuery<FacultyMember[]>({
    queryKey: ['/api/university/faculty'],
  });

  return (
    <>
      <div className="relative bg-secondary py-20 text-white">
        <div 
          className="absolute inset-0 bg-black opacity-50"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1554679665-f5537f187268?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            mixBlendMode: "overlay"
          }}
        ></div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Sunnah University</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Comprehensive Islamic education combining traditional sciences with contemporary relevance.
          </p>
          <div className="mt-8 inline-block bg-white rounded-full py-1 px-1">
            <span className="px-3 py-2 text-secondary font-bold">Online & On-Campus Programs</span>
          </div>
        </div>
      </div>
      
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start gap-10">
            <div className="md:w-1/3 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold text-primary font-heading mb-4">About Sunnah University</h2>
              <p className="text-lg mb-4">
                Sunnah University was established to provide authentic Islamic education that meets the needs of Muslims living in the contemporary world. Our curriculum combines traditional Islamic sciences with modern educational methods to prepare students for meaningful contributions to society.
              </p>
              <p className="text-lg mb-4">
                We offer various levels of study from certificate courses to graduate degrees, all taught by qualified scholars with extensive knowledge and teaching experience.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-white p-4 rounded-lg text-center shadow-md">
                  <span className="text-3xl font-bold text-accent block mb-2">20+</span>
                  <span className="text-secondary font-semibold">Courses</span>
                </div>
                <div className="bg-white p-4 rounded-lg text-center shadow-md">
                  <span className="text-3xl font-bold text-accent block mb-2">15+</span>
                  <span className="text-secondary font-semibold">Scholars</span>
                </div>
                <div className="bg-white p-4 rounded-lg text-center shadow-md">
                  <span className="text-3xl font-bold text-accent block mb-2">500+</span>
                  <span className="text-secondary font-semibold">Students</span>
                </div>
                <div className="bg-white p-4 rounded-lg text-center shadow-md">
                  <span className="text-3xl font-bold text-accent block mb-2">10+</span>
                  <span className="text-secondary font-semibold">Countries</span>
                </div>
              </div>
            </div>
            
            <div className="md:w-2/3">
              <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                <div className="border-b border-gray-200">
                  <div className="flex">
                    <button
                      className={`px-6 py-4 font-semibold text-lg ${
                        activeTab === "courses" ? "text-primary border-b-2 border-primary" : "text-gray-500"
                      }`}
                      onClick={() => setActiveTab("courses")}
                    >
                      Courses
                    </button>
                    <button
                      className={`px-6 py-4 font-semibold text-lg ${
                        activeTab === "faculty" ? "text-primary border-b-2 border-primary" : "text-gray-500"
                      }`}
                      onClick={() => setActiveTab("faculty")}
                    >
                      Faculty
                    </button>
                    <button
                      className={`px-6 py-4 font-semibold text-lg ${
                        activeTab === "admissions" ? "text-primary border-b-2 border-primary" : "text-gray-500"
                      }`}
                      onClick={() => setActiveTab("admissions")}
                    >
                      Admissions
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {activeTab === "courses" && (
                    <div>
                      <h3 className="text-2xl font-bold text-primary mb-6">Our Courses</h3>
                      
                      {coursesLoading ? (
                        <div className="space-y-6">
                          {[...Array(3)].map((_, index) => (
                            <div key={index} className="border-b border-gray-200 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
                              <div className="flex flex-col md:flex-row gap-4">
                                <div className="md:w-1/4">
                                  <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                                <div className="md:w-3/4">
                                  <div className="h-8 bg-gray-200 rounded animate-pulse mb-3"></div>
                                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-3/4"></div>
                                  <div className="flex gap-2">
                                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {courses.map(course => (
                            <div key={course.id} className="border-b border-gray-200 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
                              <div className="flex flex-col md:flex-row gap-4">
                                <div className="md:w-1/4">
                                  <img 
                                    src={course.imageUrl} 
                                    alt={course.title} 
                                    className="rounded w-full h-auto"
                                  />
                                </div>
                                <div className="md:w-3/4">
                                  <h4 className="text-xl font-bold mb-2">{course.title}</h4>
                                  <p className="mb-4">{course.description}</p>
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="bg-primary bg-opacity-10 text-white text-sm font-semibold px-3 py-1 rounded-full">
                                      Level: {course.level}
                                    </span>
                                    <span className="bg-primary bg-opacity-10 text-white text-sm font-semibold px-3 py-1 rounded-full">
                                      Duration: {course.duration}
                                    </span>
                                  </div>
                                  <p className="text-sm">
                                    <strong>Instructors:</strong> {course.instructors.join(", ")}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-6 text-center">
                        <button className="bg-accent hover:bg-opacity-90 text-white font-bold py-2 px-6 rounded-full transition duration-150">
                          View All Courses
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === "faculty" && (
                    <div>
                      <h3 className="text-2xl font-bold text-primary mb-6">Our Faculty</h3>
                      
                      {facultyLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[...Array(4)].map((_, index) => (
                            <div key={index} className="flex gap-4">
                              <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse"></div>
                              <div className="flex-1">
                                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {faculty.map(member => (
                            <div key={member.id} className="flex gap-4">
                              <img 
                                src={member.imageUrl} 
                                alt={member.name} 
                                className="w-24 h-24 rounded-full object-cover"
                              />
                              <div>
                                <h4 className="text-lg font-bold">{member.name}</h4>
                                <p className="text-primary font-semibold">{member.title}</p>
                                <p className="text-sm text-gray-600">{member.specialization}</p>
                                <p className="text-sm mt-2">{member.bio}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-6 text-center">
                        <button className="bg-accent hover:bg-opacity-90 text-white font-bold py-2 px-6 rounded-full transition duration-150">
                          View All Faculty
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === "admissions" && (
                    <div>
                      <h3 className="text-2xl font-bold text-primary mb-6">Admission Process</h3>
                      
                      <div className="space-y-6">
                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mr-4 flex-shrink-0">
                            1
                          </div>
                          <div>
                            <h4 className="text-lg font-bold mb-2">Submit Application</h4>
                            <p>Complete the online application form with your personal information, educational background, and program of interest.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mr-4 flex-shrink-0">
                            2
                          </div>
                          <div>
                            <h4 className="text-lg font-bold mb-2">Entrance Assessment</h4>
                            <p>Take an online assessment to evaluate your current knowledge level and readiness for your chosen program.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mr-4 flex-shrink-0">
                            3
                          </div>
                          <div>
                            <h4 className="text-lg font-bold mb-2">Interview</h4>
                            <p>Participate in a virtual interview with faculty members to discuss your goals and commitment to the program.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mr-4 flex-shrink-0">
                            4
                          </div>
                          <div>
                            <h4 className="text-lg font-bold mb-2">Admission Decision</h4>
                            <p>Receive an admission decision within 2-4 weeks of completing all requirements.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mr-4 flex-shrink-0">
                            5
                          </div>
                          <div>
                            <h4 className="text-lg font-bold mb-2">Enrollment</h4>
                            <p>Complete enrollment procedures, pay tuition, and prepare to begin your educational journey.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-cream p-6 rounded-lg mt-8">
                        <h4 className="text-lg font-bold mb-4">Application Deadlines</h4>
                        <ul className="space-y-2">
                          <li className="flex justify-between">
                            <span>Fall Semester:</span>
                            <span className="font-semibold">June 30</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Spring Semester:</span>
                            <span className="font-semibold">November 30</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Summer Session:</span>
                            <span className="font-semibold">March 31</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="mt-8 text-center">
                        <button className="bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-full transition duration-150">
                          Apply for Admission
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default UniversityPage;
