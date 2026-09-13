import Hero from "@/components/features/hero";
import ScrollStory3DLoader from "@/components/features/ScrollStory3DLoader";
import ResearchThemes from "@/components/features/ResearchThemes";
import Publications from "@/components/features/Publications";
import Experience from "@/components/features/experience";
import Projects from "@/components/features/Projects";
import HonorsEducation from "@/components/features/HonorsEducation";
import Contact from "@/components/features/contact";
import NavBar from "@/components/layouts/navBar";
import Footer from "@/components/layouts/footer";

// Publications no longer uses useSearchParams(), so no Suspense boundary needed.
// All components are wrapped in ErrorBoundary inside their own loader/wrapper
// where relevant (see ScrollStory3DLoader).

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
      <HonorsEducation />
      <Contact />
      <Footer />
      </main>
    </>
  );
}
