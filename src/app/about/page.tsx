import type { Metadata } from "next";
import Image from "next/image";
import NavBar from "@/components/layouts/navBar";
import Footer from "@/components/layouts/footer";
import { SITE_URL } from "@/constants/site";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

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

const CURRENTLY = [
  {
    role: "Research Assistant",
    org: "UCHRG Lab (Ubiquitous, Cloud & HCI Research Group), AIUB",
    detail: "Supervisor: Prof. Dr. Kamruddin Md. Nur · May 2026 – Present",
  },
  {
    role: "Research Intern",
    org: "Applied Intelligence and Informatics Lab (AIIL) · Remote · Nottingham, UK",
    detail: "Supervisor: Dr. Md. Saef Ullah Miah · Jun 2026 – Sep 2026",
  },
  {
    role: "Departmental Intern",
    org: "Department of Computer Science, AIUB",
    detail:
      "2026 · First point of contact for students on academic procedures and faculty availability.",
  },
];

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

const RESEARCH_INTERESTS = [
  "Decision-making under uncertainty",
  "Autonomous UAV systems and risk-aware route planning",
  "CVaR and Wasserstein distributionally robust optimisation",
  "Conformal prediction and finite-sample coverage guarantees",
  "Differential privacy (DP-SGD, Opacus) and federated learning",
  "Quantitative methods for applied socio-economic studies",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      <NavBar />
      {/* Back link — visible, keyboard accessible, no CV link */}
      <a
        href="/"
        className="fixed top-20 left-6 lg:left-[8%] z-40 text-xs font-mono tracking-widest uppercase text-fg-muted hover:text-fg transition-colors duration-200 hidden md:block"
        aria-label="Back to home"
      >
        ← ferdus.vercel.app
      </a>

      <main id="main-content" className="min-h-screen pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-[8%]">

          {/* ── Portrait + name + focus ───────────────────────────────────── */}
          <section className="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-16 mb-16 pt-4">
            {/* Portrait */}
            <div className="flex-shrink-0 self-start">
              <div
                className="rounded-2xl overflow-hidden border"
                style={{
                  width: "clamp(160px, 30vw, 280px)",
                  borderColor: "rgba(148,163,184,0.15)",
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.10), 0 20px 48px rgba(0,0,0,0.08)",
                }}
              >
                <picture>
                  <source
                    srcSet="/about/photo-800.webp 800w, /about/photo-400.webp 400w"
                    type="image/webp"
                    sizes="(max-width: 1023px) 30vw, 280px"
                  />
                  <Image
                    src="/about/photo-800.jpg"
                    alt="Portrait of Ferdus Hossain"
                    width={800}
                    height={800}
                    priority
                    sizes="(max-width: 1023px) 30vw, 280px"
                    className="w-full h-auto block object-cover"
                  />
                </picture>
              </div>
            </div>

            {/* Name + focus + intro */}
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

              <div className="space-y-4 text-base text-fg-muted leading-relaxed max-w-prose">
                <p>
                  Drones rarely fail on an average day. They fail on the gust
                  nobody planned for. I study how autonomous systems should
                  decide when the data can&apos;t be trusted to repeat itself.
                  That means route planners that price in the worst plausible
                  wind, and machine-learning models that come with guarantees
                  about how often they will be wrong and how much they reveal
                  about the people in their data.
                </p>
                <p>
                  Alongside that, I bring the quantitative side to applied
                  studies of Bangladesh&apos;s garment workers, textile
                  wastewater and city waste. I studied Computer Science &amp;
                  Engineering at AIUB and work as a research assistant at the
                  UCHRG Lab.
                </p>
              </div>

              {/* Contact links */}
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <a
                  href="mailto:ferdus.h.r362@gmail.com"
                  className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-fg-subtle hover:text-fg transition-colors duration-200"
                >
                  <FaEnvelope size={12} aria-hidden />
                  ferdus.h.r362@gmail.com
                </a>
                <a
                  href="https://github.com/Ferdous123"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-fg-subtle hover:text-fg transition-colors duration-200"
                >
                  <FaGithub size={12} aria-hidden />
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/ferdous-hossain-199782374/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-fg-subtle hover:text-fg transition-colors duration-200"
                >
                  <FaLinkedin size={12} aria-hidden />
                  LinkedIn
                </a>
              </div>
            </div>
          </section>

          <div className="h-px w-full bg-border mb-16" />

          {/* ── Currently ─────────────────────────────────────────────────── */}
          <section className="mb-16">
            <h2 className="text-xs font-mono tracking-widest uppercase text-fg-muted mb-6">
              Currently
            </h2>
            <div className="space-y-5">
              {CURRENTLY.map((c) => (
                <div key={c.role} className="flex gap-4 items-start">
                  <span
                    className="mt-2 h-1.5 w-1.5 rounded-full flex-shrink-0"
                    style={{ background: "var(--color-accent, #6366f1)" }}
                    aria-hidden
                  />
                  <div>
                    <p className="text-sm font-semibold text-fg leading-snug">
                      {c.role}
                    </p>
                    <p className="text-sm text-fg-muted mt-0.5">{c.org}</p>
                    <p className="text-xs font-mono text-fg-subtle mt-0.5">
                      {c.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Research interests ────────────────────────────────────────── */}
          <section className="mb-16">
            <h2 className="text-xs font-mono tracking-widest uppercase text-fg-muted mb-6">
              Research Interests
            </h2>
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {RESEARCH_INTERESTS.map((r) => (
                <li key={r} className="flex gap-3 items-start">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0"
                    style={{ background: "var(--color-accent, #6366f1)", opacity: 0.7 }}
                    aria-hidden
                  />
                  <span className="text-sm text-fg-muted leading-snug">{r}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ── Education ─────────────────────────────────────────────────── */}
          <section className="mb-16">
            <h2 className="text-xs font-mono tracking-widest uppercase text-fg-muted mb-6">
              Education
            </h2>
            <div className="space-y-6">
              {EDUCATION.map((e) => (
                <div key={e.degree} className="flex gap-4 items-start">
                  <span
                    className="mt-2 h-1.5 w-1.5 rounded-full flex-shrink-0"
                    style={{ background: "var(--color-accent, #6366f1)", opacity: 0.6 }}
                    aria-hidden
                  />
                  <div>
                    <p className="text-sm font-semibold text-fg leading-snug">
                      {e.degree}
                    </p>
                    <p className="text-sm text-fg-muted mt-0.5">{e.school}</p>
                    <p className="text-xs font-mono text-fg-subtle mt-0.5">
                      {e.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Honours ───────────────────────────────────────────────────── */}
          <section className="mb-16">
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

          {/* ── Contact ───────────────────────────────────────────────────── */}
          <section>
            <h2 className="text-xs font-mono tracking-widest uppercase text-fg-muted mb-6">
              Contact
            </h2>
            <div className="flex flex-wrap gap-6">
              <a
                href="mailto:ferdus.h.r362@gmail.com"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-mono text-fg-muted hover:text-fg hover:border-fg-muted transition-colors duration-200"
              >
                <FaEnvelope size={13} aria-hidden />
                ferdus.h.r362@gmail.com
              </a>
              <a
                href="https://github.com/Ferdous123"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-mono text-fg-muted hover:text-fg hover:border-fg-muted transition-colors duration-200"
              >
                <FaGithub size={13} aria-hidden />
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/ferdous-hossain-199782374/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-mono text-fg-muted hover:text-fg hover:border-fg-muted transition-colors duration-200"
              >
                <FaLinkedin size={13} aria-hidden />
                LinkedIn
              </a>
            </div>
          </section>

        </div>
      </main>

      <Footer />

      {/* Print stylesheet: bare essentials, no shadow/border-radius */}
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
