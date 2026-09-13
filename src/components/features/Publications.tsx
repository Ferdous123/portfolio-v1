"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { publications, type PublicationStatus, type PublicationTheme } from "@/constants/publications";
import { Reveal } from "@/components/ui/Reveal";
import PublicationTimeline from "./PublicationTimeline";

const STATUS_LABELS: Record<PublicationStatus | "all", string> = {
  all: "All",
  published: "Published",
  accepted: "Accepted",
  inprep: "In preparation",
};

const THEME_LABELS: Record<PublicationTheme | "all", string> = {
  all: "All themes",
  "uav-robust": "UAV & DRO",
  "trustworthy-ml": "Trustworthy ML",
  "applied-bd": "Applied · BD",
};

const THEME_DOTS: Record<PublicationTheme, string> = {
  "uav-robust": "bg-indigo-400",
  "trustworthy-ml": "bg-emerald-400",
  "applied-bd": "bg-amber-400",
};

const STATUS_BADGE: Record<PublicationStatus, string> = {
  published:
    "bg-success-surface text-success border border-success-border",
  accepted:
    "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30",
  inprep:
    "bg-amber-500/10 text-amber-400 border border-amber-500/30",
};

const STATUS_LABEL: Record<PublicationStatus, string> = {
  published: "Published",
  accepted: "Accepted",
  inprep: "In preparation",
};

export default function Publications() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<PublicationStatus | "all">("all");
  const [theme, setTheme] = useState<PublicationTheme | "all">("all");
  const [firstOnly, setFirstOnly] = useState(false);

  // Sync from URL on mount
  useEffect(() => {
    const s = searchParams.get("status");
    const t = searchParams.get("theme");
    const f = searchParams.get("first");
    if (s && (s === "all" || s === "published" || s === "accepted" || s === "inprep")) {
      setStatus(s as PublicationStatus | "all");
    }
    if (t && (t === "all" || t === "uav-robust" || t === "trustworthy-ml" || t === "applied-bd")) {
      setTheme(t as PublicationTheme | "all");
    }
    if (f === "1") setFirstOnly(true);
  }, []);

  // Sync to URL
  const updateURL = useCallback(
    (
      newStatus: PublicationStatus | "all",
      newTheme: PublicationTheme | "all",
      newFirst: boolean
    ) => {
      const params = new URLSearchParams();
      if (newStatus !== "all") params.set("status", newStatus);
      if (newTheme !== "all") params.set("theme", newTheme);
      if (newFirst) params.set("first", "1");
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : window.location.pathname, { scroll: false });
    },
    [router]
  );

  const setStatusAndSync = (s: PublicationStatus | "all") => {
    setStatus(s);
    updateURL(s, theme, firstOnly);
  };

  const setThemeAndSync = (t: PublicationTheme | "all") => {
    setTheme(t);
    updateURL(status, t, firstOnly);
  };

  const setFirstAndSync = (f: boolean) => {
    setFirstOnly(f);
    updateURL(status, theme, f);
  };

  const filtered = useMemo(() => {
    return publications.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (theme !== "all" && p.theme !== theme) return false;
      if (firstOnly && !p.firstAuthor) return false;
      return true;
    });
  }, [status, theme, firstOnly]);

  // Count per status for chips
  const counts = useMemo(() => {
    const c: Record<PublicationStatus | "all", number> = {
      all: 0,
      published: 0,
      accepted: 0,
      inprep: 0,
    };
    publications.forEach((p) => {
      c[p.status]++;
      c.all++;
    });
    return c;
  }, []);

  return (
    <section
      id="publications"
      className="w-full px-6 lg:px-[8%] py-24 scroll-mt-20 border-t border-border"
    >
      <Reveal className="max-w-5xl mx-auto">
        <p className="text-xs font-mono tracking-widest uppercase text-fg-muted mb-2">
          Publications
        </p>
        <h2 className="text-4xl sm:text-5xl font-bold text-fg tracking-tight mb-4">
          The Work
        </h2>
        <p className="text-base text-fg-muted leading-relaxed mb-10 max-w-2xl">
          {publications.filter((p) => p.status === "published" || p.status === "accepted").length} peer-reviewed works published or accepted.{" "}
          {publications.filter((p) => p.status === "inprep").length} manuscripts complete and awaiting submission.
        </p>

        {/* Timeline */}
        <div className="mb-12">
          <PublicationTimeline />
        </div>

        {/* Filter row 1: status chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(["all", "published", "accepted", "inprep"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusAndSync(s)}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-200 border ${
                status === s
                  ? "bg-fg text-fg-inverted border-fg"
                  : "border-border text-fg-muted hover:border-fg-muted hover:text-fg"
              }`}
            >
              {STATUS_LABELS[s]}
              <motion.span
                layout
                className="text-[10px] opacity-60"
              >
                {counts[s]}
              </motion.span>
            </button>
          ))}
        </div>

        {/* Filter row 2: theme + first-author toggle */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <div className="flex flex-wrap gap-2">
            {(["all", "uav-robust", "trustworthy-ml", "applied-bd"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setThemeAndSync(t)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono tracking-wider border transition-all duration-200 ${
                  theme === t
                    ? "bg-surface-raised border-border-strong text-fg"
                    : "border-border text-fg-subtle hover:border-fg-muted hover:text-fg-muted"
                }`}
              >
                {t !== "all" && (
                  <span className={`w-1.5 h-1.5 rounded-full ${THEME_DOTS[t as PublicationTheme]}`} />
                )}
                {THEME_LABELS[t]}
              </button>
            ))}
          </div>
          <label className="ml-auto flex items-center gap-2 text-xs font-mono text-fg-muted cursor-pointer select-none">
            <input
              type="checkbox"
              checked={firstOnly}
              onChange={(e) => setFirstAndSync(e.target.checked)}
              className="w-3.5 h-3.5 accent-accent"
            />
            First author only
          </label>
        </div>

        {/* Publication list */}
        <motion.div layout className="space-y-0">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-fg-muted text-sm py-12 text-center"
              >
                No publications match the current filters.
              </motion.p>
            ) : (
              filtered.map((pub) => (
                <motion.article
                  key={pub.title}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                  className="py-7 border-t border-border first:border-t-0 first:pt-0"
                >
                  <div className="flex flex-wrap items-start gap-3 mb-3">
                    {/* Theme dot */}
                    <span
                      className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${THEME_DOTS[pub.theme]}`}
                      title={THEME_LABELS[pub.theme]}
                    />
                    {/* Status badge */}
                    <span
                      className={`text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full ${STATUS_BADGE[pub.status]}`}
                    >
                      {STATUS_LABEL[pub.status]}
                    </span>
                    {/* Role badges */}
                    {pub.firstAuthor && (
                      <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full border border-border text-fg-subtle">
                        First author
                      </span>
                    )}
                    {pub.corresponding && (
                      <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full border border-border text-fg-subtle">
                        Corresponding
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-fg leading-snug mb-1.5 max-w-3xl">
                    {pub.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm text-fg-muted">
                      {pub.status === "inprep"
                        ? `In preparation · target ${pub.targetVenue}`
                        : `${pub.venue} · ${pub.date}`}
                    </p>
                    {pub.codeUrl && (
                      <>
                        <span className="h-3 w-px bg-border-strong" />
                        <a
                          href={pub.codeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-fg-subtle hover:text-accent transition-colors"
                        >
                          Code →
                        </a>
                      </>
                    )}
                  </div>
                </motion.article>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </Reveal>
    </section>
  );
}
