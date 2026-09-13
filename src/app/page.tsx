import { Suspense } from "react";
import Hero from "@/components/features/hero";
import ResearchThemes from "@/components/features/ResearchThemes";
import Publications from "@/components/features/Publications";
import Experience from "@/components/features/experience";
import Projects from "@/components/features/Projects";
import HonorsEducation from "@/components/features/HonorsEducation";
import Contact from "@/components/features/contact";
import NavBar from "@/components/layouts/navBar";
import Footer from "@/components/layouts/footer";

export default function Home() {
  return (
    <>
      <NavBar />
      <Hero />
      <ResearchThemes />
      <Suspense>
        <Publications />
      </Suspense>
      <Experience />
      <Projects />
      <HonorsEducation />
      <Contact />
      <Footer />
    </>
  );
}
