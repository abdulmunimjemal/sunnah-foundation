import HeroSection from "@/components/home/HeroSection";
import MissionSection from "@/components/home/MissionSection";
import ProgramsSection from "@/components/home/ProgramsSection";
import UniversitySection from "@/components/home/UniversitySection";
import DaewaTVSection from "@/components/home/DaewaTVSection";
import GetInvolvedSection from "@/components/home/GetInvolvedSection";
import TeamSection from "@/components/home/TeamSection";
import NewsSection from "@/components/home/NewsSection";
import ContactSection from "@/components/home/ContactSection";
import { useEffect } from "react";

const HomePage = () => {
  // Set page title
  useEffect(() => {
    document.title = "Sunnah Foundation - Following the Path of Sunnah";
  }, []);

  return (
    <>
      <HeroSection />
      <MissionSection />
      <ProgramsSection />
      <UniversitySection />
      <DaewaTVSection />
      <GetInvolvedSection />
      <TeamSection />
      <NewsSection />
      <ContactSection />
    </>
  );
};

export default HomePage;
