"use client";

import { useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { XIcon } from "lucide-react";
import { experiences } from "@/constants/experience";
import { Reveal } from "@/components/ui/Reveal";
import { type ExperienceEntry } from "@/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

function ExperienceModal({
  exp,
  open,
  onClose,
}: {
  exp: ExperienceEntry;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={false}
        className="w-full max-w-2xl sm:max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl !bg-surface p-0 gap-0"
      >
        <DialogClose asChild>
          <button
            type="button"
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-surface-raised text-fg-muted hover:text-fg transition"
          >
            <XIcon size={15} />
          </button>
        </DialogClose>

        <div className="p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-1 rounded-full border border-border text-fg-subtle">
                {exp.badge}
              </span>
              <span className="text-xs font-mono text-fg-subtle">
                {exp.period}
              </span>
            </div>
            <DialogTitle className="text-2xl font-bold text-fg tracking-tight mb-1">
              {exp.role}
            </DialogTitle>
            <a
              href={exp.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-accent transition-colors"
            >
              {exp.company}
              <FaExternalLinkAlt size={10} />
            </a>
          </div>

          <div className="h-px bg-border mb-8" />

          <div className="mb-8">
            <p className="text-xs font-mono tracking-widest uppercase text-fg-subtle mb-5">
              Contributions
            </p>
            <ul className="space-y-5">
              {exp.highlights.map((point, i) => (
                <li key={i} className="flex gap-4">
                  <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                  <p className="text-sm text-fg-muted leading-7">{point}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-mono tracking-widest uppercase text-fg-subtle mb-4">
              Methods & Tools
            </p>
            <div className="flex flex-wrap gap-2">
              {exp.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-mono px-3 py-1.5 rounded-full border border-border text-fg-subtle hover:border-accent/40 hover:text-fg-muted transition-colors duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Experience() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section
      id="experience"
      className="w-full px-6 lg:px-[8%] py-24 scroll-mt-20 border-t border-border"
    >
      <Reveal className="max-w-5xl mx-auto">
        <p className="text-xs font-mono tracking-widest uppercase text-fg-muted mb-2">
          Experience
        </p>
        <h2 className="text-4xl sm:text-5xl font-bold text-fg tracking-tight mb-16">
          Where I&apos;ve Worked
        </h2>

        <div className="space-y-0">
          {experiences.map((exp, i) => (
            <div
              key={i}
              className="grid lg:grid-cols-[200px_1fr] gap-6 lg:gap-16 py-12 border-t border-border first:border-t-0 first:pt-0"
            >
              <div className="shrink-0">
                <p className="text-xs font-mono text-fg-subtle mb-2">
                  {exp.period}
                </p>
                <a
                  href={exp.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-accent transition-colors duration-200"
                >
                  {exp.company}
                  <FaExternalLinkAlt size={10} />
                </a>
                <span className="mt-3 block text-[11px] font-mono tracking-widest uppercase px-2.5 py-1 rounded-full border border-border text-fg-subtle w-fit">
                  {exp.badge}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-fg tracking-tight mb-4">
                  {exp.role}
                </h3>
                <p className="text-sm text-fg-muted leading-7 mb-6 max-w-2xl">
                  {exp.summary}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActive(i)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono tracking-widest uppercase text-accent hover:opacity-70 transition-opacity duration-200"
                  >
                    View details →
                  </button>
                  <span className="h-3 w-px bg-border-strong" />
                  <div className="flex flex-wrap gap-2">
                    {exp.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-mono px-3 py-1 rounded-full border border-border text-fg-subtle"
                      >
                        {tag}
                      </span>
                    ))}
                    {exp.tags.length > 4 && (
                      <span className="text-xs font-mono px-3 py-1 rounded-full border border-border text-fg-subtle">
                        +{exp.tags.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {active !== null && (
        <ExperienceModal
          exp={experiences[active]}
          open={active !== null}
          onClose={() => setActive(null)}
        />
      )}
    </section>
  );
}
