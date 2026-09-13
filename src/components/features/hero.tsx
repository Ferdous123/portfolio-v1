"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { container, item, fadeIn } from "@/constants/variants";
import { pubStats } from "@/constants/publications";
import WindField from "./WindField";

export default function Hero() {
  const stats = [
    { value: pubStats.total,       label: "peer-reviewed" },
    { value: pubStats.firstAuthor, label: "first author"  },
    { value: pubStats.corresponding, label: "corresponding"  },
    { value: pubStats.inPrep,      label: "in preparation" },
  ];

  return (
    <div
      id="top"
      className="relative min-h-screen flex flex-col justify-center px-6 lg:px-[8%] pt-28 pb-20"
    >
      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <motion.div variants={container} initial="hidden" animate="visible">
          <motion.div
            variants={fadeIn}
            className="mb-10 flex items-center gap-3"
          >
            <span className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-fg-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-success-solid animate-pulse" />
              Open to research collaborations
            </span>
          </motion.div>

          {/* Name + portrait */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-2">
            {/* Portrait — above name on mobile, beside name on desktop */}
            <motion.div
              variants={fadeIn}
              className="order-first sm:order-last flex-shrink-0"
            >
              <div className="relative w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-2xl overflow-hidden border border-border shadow-sm">
                <Image
                  src="/photo.webp"
                  alt="Portrait of Ferdus Hossain"
                  fill
                  className="object-cover"
                  priority
                  sizes="160px"
                />
              </div>
            </motion.div>

            {/* Name lines */}
            <div>
              <motion.div variants={item} className="overflow-hidden">
                <h1 className="text-[clamp(3rem,5.5vw,5.5rem)] font-bold leading-[0.92] tracking-tight text-fg">
                  Ferdus
                </h1>
              </motion.div>
              <motion.div variants={item} className="overflow-hidden">
                <h1 className="text-[clamp(3rem,5.5vw,5.5rem)] font-bold leading-[0.92] tracking-tight text-fg">
                  Hossain
                </h1>
              </motion.div>
            </div>
          </div>

          <motion.div variants={fadeIn} className="my-8 h-px w-16 bg-accent" />

          <motion.p
            variants={item}
            className="text-sm font-mono tracking-widest uppercase text-fg-muted"
          >
            DRO · CVaR · Conformal Prediction · DP
          </motion.p>

          <motion.p
            variants={item}
            className="mt-8 max-w-xl text-base sm:text-lg text-fg-muted leading-relaxed"
          >
            I study decision-making under uncertainty. My main work is UAV route
            planning with CVaR and Wasserstein distributionally robust
            optimisation, and trustworthy ML — differential privacy, conformal
            prediction, Laplace posteriors. Applied collaborations on Bangladesh
            (RMG labour, wastewater, waste classification) round out the
            portfolio.
          </motion.p>

          {/* Headline stats — derived from data, never hardcoded */}
          <motion.div
            variants={fadeIn}
            className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {stats.map(({ value, label }) => (
              <div
                key={label}
                className="border border-border rounded-xl p-3 sm:p-4 min-w-0"
              >
                <p className="text-2xl font-bold text-fg">{value}</p>
                <p className="text-[10px] font-mono text-fg-muted mt-1 uppercase tracking-[0.04em] leading-tight break-words min-h-[2.2em]">
                  {label}
                </p>
              </div>
            ))}
          </motion.div>

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

          <motion.div
            variants={fadeIn}
            className="mt-10 flex items-center gap-6"
          >
            <a
              href="https://github.com/Ferdous123"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono tracking-widest uppercase text-fg-subtle hover:text-fg transition-colors duration-200"
            >
              GitHub
            </a>
            <span className="h-3 w-px bg-border-strong" />
            <a
              href="https://www.linkedin.com/in/ferdous-hossain-199782374/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono tracking-widest uppercase text-fg-subtle hover:text-fg transition-colors duration-200"
            >
              LinkedIn
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
        >
          <WindField />
          <p className="mt-3 text-xs font-mono text-fg-subtle text-center">
            Animated wind field with CVaR-based UAV replanning around a gust
          </p>
        </motion.div>
      </div>
    </div>
  );
}
