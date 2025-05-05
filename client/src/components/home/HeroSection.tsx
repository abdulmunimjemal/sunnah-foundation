import { Link } from "wouter";

const HeroSection = () => {
  return (
    <section id="home" className="relative bg-secondary">
      <div 
        className="absolute inset-0 bg-black opacity-50"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1519817914152-22d216bb9170?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          mixBlendMode: "overlay"
        }}
      ></div>
      <div className="relative container mx-auto px-4 py-24 md:py-32 flex flex-col items-center text-center z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-white font-heading mb-6">
          Following the Path of <span className="text-accent">Sunnah</span>
        </h1>
        <h2 className="text-xl md:text-2xl text-white max-w-3xl mb-8">
          Dedicated to promoting authentic Islamic knowledge, community service, and spiritual growth
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/programs">
            <a className="bg-accent hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-full transition duration-150">
              Explore Our Programs
            </a>
          </Link>
          <Link href="/get-involved#donate">
            <a className="bg-white hover:bg-gray-100 text-primary font-bold py-3 px-8 rounded-full transition duration-150">
              Support Our Mission
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
