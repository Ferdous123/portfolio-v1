"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const EMAIL = "ferdus.h.r362@gmail.com";

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be blocked in some contexts */
    }
  }

  return (
    <section
      id="contact"
      className="w-full px-6 lg:px-[8%] py-24 scroll-mt-20 border-t border-border"
    >
      <Reveal className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div>
            <p className="text-xs font-mono tracking-widest uppercase text-fg-muted mb-6">
              Contact
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-fg tracking-tight leading-tight mb-8">
              Collaborate or
              <br />
              reach out
            </h2>
            <p className="text-base text-fg-muted leading-relaxed mb-10 max-w-sm">
              I am open to research collaborations, visiting student
              opportunities, and discussions about decision-making under
              uncertainty or trustworthy ML.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 group">
                <span className="text-xs font-mono tracking-widest uppercase text-fg-subtle w-16">
                  Email
                </span>
                <a
                  href={`mailto:${EMAIL}`}
                  className="text-sm text-fg-muted hover:text-accent transition-colors group-hover:translate-x-0.5 transition-transform duration-200"
                >
                  {EMAIL}
                </a>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="ml-2 text-xs font-mono text-fg-subtle hover:text-accent transition-colors border border-border rounded px-2 py-0.5"
                  aria-label="Copy email address"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <a
                href="https://github.com/Ferdous123"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-fg-muted hover:text-accent transition-colors duration-200 group"
              >
                <span className="text-xs font-mono tracking-widest uppercase text-fg-subtle w-16">
                  GitHub
                </span>
                <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                  Ferdous123 →
                </span>
              </a>
              <a
                href="https://www.linkedin.com/in/ferdous-hossain-199782374/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-fg-muted hover:text-accent transition-colors duration-200 group"
              >
                <span className="text-xs font-mono tracking-widest uppercase text-fg-subtle w-16">
                  LinkedIn
                </span>
                <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                  Ferdous Hossain →
                </span>
              </a>
            </div>
          </div>

          <div className="border border-border rounded-2xl p-8 bg-surface">
            <p className="text-xs font-mono tracking-widest uppercase text-fg-muted mb-6">
              Areas I am active in
            </p>
            <ul className="space-y-3">
              {[
                "Distributionally robust optimisation for autonomous systems",
                "CVaR-based UAV route planning under stochastic wind",
                "Conformal prediction and coverage guarantees",
                "Differential privacy in federated ML",
                "Quantitative methods for Bangladesh socio-economic research",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-fg-muted">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
