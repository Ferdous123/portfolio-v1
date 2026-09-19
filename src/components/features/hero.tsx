"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { container, item, fadeIn } from "@/constants/variants";
import { pubStats } from "@/constants/publications";
import { useTypingAnimation } from "@/hooks/useTypingAnimation";

// Count-up hook
function useCountUp(target: number, enabled: boolean, duration = 800) {
  // Start at the real number so server HTML, no-JS and failed-JS loads never show 0.
  const [value, setValue] = useState(target);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!enabled || reduced) { setValue(target); return; }
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

// ─── Hero research figure with pointer-driven 3D tilt ────────────────────────
// Displays a real figure from the public wdro-mor repo (population-risk overlay).
// Tilt is pointer-only (not touch), disabled for reduced-motion and forced-colors.
function HeroFigure({ reducedMotion }: { reducedMotion: boolean }) {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { stiffness: 280, damping: 28, mass: 0.6 };
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), springConfig);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [6, -6]), springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="w-full mt-10 lg:mt-0 framer-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={reducedMotion ? undefined : handleMouseMove}
      onMouseLeave={reducedMotion ? undefined : handleMouseLeave}
      /* perspective lives on the parent; the child rotates */
      style={{ perspective: reducedMotion ? undefined : 900 }}
    >
      <motion.div
        style={
          reducedMotion
            ? {}
            : {
                rotateX,
                rotateY,
                transformStyle: "preserve-3d" as const,
              }
        }
      >
        {/* Frame: rounded, layered shadow, hairline border */}
        <div
          className="rounded-2xl overflow-hidden border"
          style={{
            borderColor: "rgba(148,163,184,0.15)",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.10), 0 20px 56px rgba(0,0,0,0.10)",
          }}
        >
          {/* Fixed-ratio image via intrinsic width/height (no layout shift) */}
          <picture>
            <source
              srcSet="/research/fig_risk_overlay.webp"
              type="image/webp"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/research/fig_risk_overlay.jpg"
              alt="UAV routes (energy-optimal, balanced, safest) over a population-density risk field across Dhaka, NYC, Manaus, In Salah, La Paz and Tromsø — six climate zones from the WDRO-MOR study."
              width={1400}
              height={870}
              loading="eager"
              decoding="async"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </picture>
        </div>
        {/* Factual caption */}
        <p
          className="mt-2 text-right"
          style={{
            fontSize: 10,
            fontFamily: "ui-monospace, monospace",
            letterSpacing: "0.03em",
            opacity: 0.45,
          }}
        >
          From the WDRO-MOR reproducibility release
        </p>
      </motion.div>
    </motion.div>
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
    { value: pubStats.total,          label: "Papers published or accepted", href: "/#publications" },
    { value: pubStats.firstAuthor,    label: "As first author",              href: "/?first=1#publications" },
    { value: pubStats.corresponding,  label: "As corresponding author",      href: "/#publications" },
    { value: pubStats.inPrep,         label: "Manuscripts in preparation",   href: "/?status=inprep#publications" },
  ];

  return (
    <div
      id="top"
      className="relative min-h-screen flex flex-col justify-center px-6 lg:px-[8%] pt-28 pb-20"
    >
      <div className="max-w-7xl w-full mx-auto">
        {/* Two-column layout: text left, research figure right at lg+ */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-14 xl:gap-20">
        {/* framer-hidden: CSS failsafe reveals after 3 s if JS files fail to load */}
        <motion.div variants={container} initial="hidden" animate="visible" className="flex-1 min-w-0 max-w-[680px] framer-hidden">
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

          {/* Verbatim intro copy — paragraph 1 only */}
          <motion.div variants={item} className="mt-8 max-w-2xl">
            <p className="text-base sm:text-lg text-fg-muted leading-relaxed">
              Drones rarely fail on an average day. They fail on the gust nobody
              planned for. I study how autonomous systems should decide when the
              data can&apos;t be trusted to repeat itself. That means route
              planners that price in the worst plausible wind, and
              machine-learning models that come with guarantees about how often
              they will be wrong and how much they reveal about the people in
              their data.
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
              href="/#publications"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-fg text-fg-inverted text-sm font-semibold hover:opacity-80 transition-opacity duration-200"
            >
              View Publications
              <span className="text-base">→</span>
            </a>
            <a
              href="/about"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-border-strong text-sm font-medium text-fg-secondary hover:border-fg-muted hover:text-fg transition-colors duration-200"
            >
              About me
            </a>
          </motion.div>
        </motion.div>

        {/* Research figure — right column */}
        <div className="w-full lg:w-[42%] lg:flex-shrink-0">
          <HeroFigure reducedMotion={reducedMotion} />
        </div>
        </div>
      </div>

      {/* Blink keyframe */}
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}
