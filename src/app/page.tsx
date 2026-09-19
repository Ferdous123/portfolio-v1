import Hero from "@/components/features/hero";
import ScrollStory3DLoader from "@/components/features/ScrollStory3DLoader";
import ResearchThemes from "@/components/features/ResearchThemes";
import Publications from "@/components/features/Publications";
import Experience from "@/components/features/experience";
import Projects from "@/components/features/Projects";
import NavBar from "@/components/layouts/navBar";
import Footer from "@/components/layouts/footer";

export default function Home() {
  return (
    <>
      <NavBar />
      {/* Skip-link target: id must match href="#main-content" in layout.tsx */}
      <main id="main-content">
      <Hero />
      <ScrollStory3DLoader />
      <ResearchThemes />
      <Publications />
      <Experience />
      <Projects />
      </main>
      <Footer />
    </>
  );
}
