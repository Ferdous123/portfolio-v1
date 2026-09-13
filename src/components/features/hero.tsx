"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { container, item, fadeIn } from "@/constants/variants";
import { pubStats } from "@/constants/publications";
import { useTypingAnimation } from "@/hooks/useTypingAnimation";

// Count-up hook
function useCountUp(target: number, enabled: boolean, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!enabled) { setValue(target); return; }
    let start: number | null = null;
    const raf = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [target, enabled, duration]);
  return value;
}

function StatCard({
  value,
  label,
  href,
  visible,
}: {
  value: number;
  label: string;
  href: string;
  visible: boolean;
}) {
  const count = useCountUp(value, visible);
  return (
    <a
      href={href}
      className="block border border-border rounded-xl p-3 sm:p-4 min-w-0 hover:border-accent/60 transition-colors duration-200 cursor-pointer group"
      aria-label={`${value} ${label} — filter publications`}
    >
      <p className="text-2xl font-bold text-fg group-hover:text-accent transition-colors duration-200">
        {count}
      </p>
      <p className="text-[10px] sm:text-[11px] font-mono text-fg-muted mt-1 leading-snug">
        {label}
      </p>
    </a>
  );
}

export default function Hero() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStatsVisible(true); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const { displayed } = useTypingAnimation(!reducedMotion);

  const stats = [
    { value: pubStats.total,          label: "Papers published or accepted", href: "#publications" },
    { value: pubStats.firstAuthor,    label: "As first author",              href: "#publications?first=1" },
    { value: pubStats.corresponding,  label: "As corresponding author",      href: "#publications" },
    { value: pubStats.inPrep,         label: "Manuscripts in preparation",   href: "#publications?status=inprep" },
  ];

  return (
    <div
      id="top"
      className="relative min-h-screen flex flex-col justify-center px-6 lg:px-[8%] pt-28 pb-20"
    >
      <div className="max-w-7xl w-full mx-auto">
        <motion.div variants={container} initial="hidden" animate="visible" className="max-w-3xl">
          {/* Status badge */}
          <motion.div variants={fadeIn} className="mb-10 flex items-center gap-3">
            <span className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-fg-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-success-solid animate-pulse" />
              Open to research collaborations
            </span>
          </motion.div>

          {/* Name */}
          <motion.div variants={item} className="overflow-hidden">
            <h1 className="text-[clamp(3rem,5.5vw,5.5rem)] font-bold leading-[0.92] tracking-tight text-fg">
              Ferdus Hossain
            </h1>
          </motion.div>

          <motion.div variants={fadeIn} className="my-8 h-px w-16 bg-accent" />

          {/* Typing animation */}
          <motion.div variants={item} className="h-8 flex items-center">
            <p className="text-sm font-mono uppercase text-fg-muted">
              I work on{" "}
              <span className="text-accent font-semibold not-italic normal-case">
                {displayed}
                <span
                  className="inline-block w-[2px] h-[1.1em] bg-accent align-middle ml-0.5"
                  style={{ animation: "blink 1s step-end infinite" }}
                />
              </span>
            </p>
          </motion.div>

          {/* Verbatim intro copy */}
          <motion.div variants={item} className="mt-8 space-y-4 max-w-2xl">
            <p className="text-base sm:text-lg text-fg-muted leading-relaxed">
              Drones rarely fail on an average day. They fail on the gust nobody
              planned for. I study how autonomous systems should decide when the
              data can&apos;t be trusted to repeat itself. That means route
              planners that price in the worst plausible wind, and
              machine-learning models that come with guarantees about how often
              they will be wrong and how much they reveal about the people in
              their data.
            </p>
            <p className="text-base sm:text-lg text-fg-muted leading-relaxed">
              Alongside that, I bring the quantitative side to applied studies of
              Bangladesh&apos;s garment workers, textile wastewater and city waste.
              I studied Computer Science &amp; Engineering at AIUB and work as a
              research assistant at the UCHRG Lab.
            </p>
          </motion.div>

          {/* Stat cards — count-up on view, click-to-filter */}
          <motion.div
            ref={statsRef}
            variants={fadeIn}
            className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {stats.map(({ value, label, href }) => (
              <StatCard
                key={label}
                value={value}
                label={label}
                href={href}
                visible={statsVisible}
              />
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            variants={item}
            className="mt-12 flex flex-wrap items-center gap-4"
          >
            <a
              href="#publications"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-fg text-fg-inverted text-sm font-semibold hover:opacity-80 transition-opacity duration-200"
            >
              View Publications
              <span className="text-base">→</span>
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-border-strong text-sm font-medium text-fg-secondary hover:border-fg-muted hover:text-fg transition-colors duration-200"
            >
              Get in Touch
            </a>
          </motion.div>

          {/* Social links — GitHub only in hero (LinkedIn removed per V2) */}
          <motion.div variants={fadeIn} className="mt-10 flex items-center gap-6">
            <a
              href="https://github.com/Ferdous123"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono tracking-widest uppercase text-fg-subtle hover:text-fg transition-colors duration-200"
            >
              GitHub
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Blink keyframe */}
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}
