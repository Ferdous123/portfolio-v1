import Hero from "@/components/features/hero";
import StoryBackground from "@/components/features/StoryBackground";
import ResearchThemes from "@/components/features/ResearchThemes";
import Publications from "@/components/features/Publications";
import Experience from "@/components/features/experience";
import Projects from "@/components/features/Projects";
import NavBar from "@/components/layouts/navBar";
import Footer from "@/components/layouts/footer";

export default function Home() {
  return (
    <>
      {/* The drone story is the whole-page background (fixed, behind content). */}
      <StoryBackground />
      <NavBar />
      <div className="story-content">
        {/* Skip-link target: id must match href="#main-content" in layout.tsx */}
        <main id="main-content">
          <div className="story-panel story-panel--first"><Hero /></div>
          <div className="story-panel"><ResearchThemes /></div>
          <div className="story-panel"><Publications /></div>
          <div className="story-panel"><Experience /></div>
          <div className="story-panel"><Projects /></div>
        </main>
        <div className="story-panel story-panel--last"><Footer /></div>
      </div>
    </>
  );
}
