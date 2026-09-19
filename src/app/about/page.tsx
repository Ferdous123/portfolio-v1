import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import NavBar from "@/components/layouts/navBar";
import Footer from "@/components/layouts/footer";
import { SITE_URL } from "@/constants/site";

export const metadata: Metadata = {
  title: "About · Ferdus Hossain",
  description:
    "Ferdus Hossain — researcher in decision-making under uncertainty, autonomous UAV systems, trustworthy AI, and privacy-preserving machine learning.",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About · Ferdus Hossain",
    description:
      "Researcher in decision-making under uncertainty, autonomous UAV systems, trustworthy AI, and privacy-preserving machine learning.",
    url: "/about",
    siteName: "Ferdus Hossain",
    locale: "en_US",
    type: "profile",
  },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const EDUCATION = [
  {
    degree: "B.Sc. in Computer Science & Engineering (Major: Information Systems)",
    school: "American International University-Bangladesh (AIUB), Dhaka",
    detail: "CGPA 3.91 / 4.00 · Graduating 2026",
  },
  {
    degree: "HSC — Science",
    school: "Dr. Mahbubur Rahman Mollah College",
    detail: "GPA 5.00 / 5.00 · 2021",
  },
  {
    degree: "SSC — Science",
    school: "Ideal School & College, Motijheel, Dhaka",
    detail: "GPA 4.94 / 5.00 · 2019",
  },
];

const HONOURS = [
  "Dean's List Award, Faculty of Science & Technology, AIUB — six semesters (Fall 2023-24 → Spring 2025-26).",
  "Magna Cum Laude, AIUB — anticipated at the 2028 convocation.",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      <NavBar />
      {/* Back link — keyboard accessible, visible on md+ */}
      <Link
        href="/"
        className="fixed top-20 left-6 lg:left-[8%] z-40 text-xs font-mono tracking-widest uppercase text-fg-muted hover:text-fg transition-colors duration-200 hidden md:block"
        aria-label="Back to home"
      >
        ← ferdus.vercel.app
      </Link>

      <main id="main-content" className="min-h-screen pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-[8%]">

          {/* ── Portrait + name + bio ─────────────────────────────────────── */}
          <section className="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-14 mb-16 pt-4">
            {/* Portrait — lg: ~40% width, 4:5 ratio, face-centred crop */}
            <div className="flex-shrink-0 self-start w-[70vw] max-w-[320px] lg:w-[40%] lg:max-w-[440px]">
              <div
                className="rounded-2xl overflow-hidden border"
                style={{
                  borderColor: "rgba(148,163,184,0.15)",
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.10), 0 20px 48px rgba(0,0,0,0.08)",
                  aspectRatio: "4/5",
                }}
              >
                <picture>
                  <source
                    srcSet="/about/photo-880.webp 880w, /about/photo-440.webp 440w"
                    type="image/webp"
                    sizes="(max-width: 1023px) 70vw, 40vw"
                  />
                  <Image
                    src="/about/photo-880.jpg"
                    alt="Portrait of Ferdus Hossain"
                    width={880}
                    height={1100}
                    priority
                    sizes="(max-width: 1023px) 70vw, 40vw"
                    className="w-full h-full object-cover object-top block"
                  />
                </picture>
              </div>
            </div>

            {/* Name + bio (paragraph 2 only) */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono tracking-widest uppercase text-fg-muted mb-2">
                About
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-fg tracking-tight mb-4">
                Ferdus Hossain
              </h1>
              <p className="text-sm font-mono text-fg-muted mb-6 leading-relaxed">
                Decision-Making Under Uncertainty · Autonomous UAV Systems ·
                Trustworthy AI · Privacy-Preserving Machine Learning
              </p>

              {/* Bio — verbatim intro paragraph 2 */}
              <p className="text-base text-fg-muted leading-relaxed max-w-prose">
                Alongside my research on robust decision-making, I bring the quantitative side to applied studies
                of Bangladesh&apos;s garment workers, textile wastewater and city
                waste. I studied Computer Science &amp; Engineering at AIUB and
                work as a research assistant at the UCHRG Lab.
              </p>
            </div>
          </section>

          <div className="h-px w-full bg-border mb-16" />

          {/* ── Education ─────────────────────────────────────────────────── */}
          <section className="mb-16">
            <h2 className="text-xs font-mono tracking-widest uppercase text-fg-muted mb-6">
              Education
            </h2>
            <div className="space-y-6">
              {EDUCATION.map((ed) => (
                <div key={ed.degree} className="flex gap-4 items-start">
                  <span
                    className="mt-2 h-1.5 w-1.5 rounded-full flex-shrink-0"
                    style={{ background: "var(--color-accent, #6366f1)", opacity: 0.6 }}
                    aria-hidden
                  />
                  <div>
                    <p className="text-sm font-semibold text-fg leading-snug">
                      {ed.degree}
                    </p>
                    <p className="text-sm text-fg-muted mt-0.5">{ed.school}</p>
                    <p className="text-xs font-mono text-fg-subtle mt-0.5">
                      {ed.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Honours ───────────────────────────────────────────────────── */}
          <section className="mb-8">
            <h2 className="text-xs font-mono tracking-widest uppercase text-fg-muted mb-6">
              Honours
            </h2>
            <ul className="space-y-3">
              {HONOURS.map((h) => (
                <li key={h} className="flex gap-3 items-start">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0"
                    style={{ background: "#f59e0b", opacity: 0.8 }}
                    aria-hidden
                  />
                  <span className="text-sm text-fg-muted leading-relaxed">{h}</span>
                </li>
              ))}
            </ul>
          </section>

        </div>
      </main>

      <Footer />

      {/* Print stylesheet */}
      <style>{`
        @media print {
          nav, footer, .fixed { display: none !important; }
          main { padding-top: 0 !important; }
          a[href]::after { content: " (" attr(href) ")"; font-size: 0.75em; }
        }
      `}</style>
    </>
  );
}
