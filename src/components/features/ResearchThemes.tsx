"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";

// ─── Autoplay hook ────────────────────────────────────────────────────────────
// Ping-pong animates a value between min and max over periodMs.
// Pauses offscreen (IntersectionObserver at 0.2 threshold), on hover/focus/
// pointerdown (user has control), and when prefers-reduced-motion is set.
// Resumes automatically 3 s after the last interaction.
// Safari compat: no CSS `transition: d` — path is recomputed each tick.
function useAutoplay({
  min,
  max,
  periodMs,
  representativeValue,
}: {
  min: number;
  max: number;
  periodMs: number;
  representativeValue: number;
}) {
  // Stable reduced-motion check: computed once at mount, never changes.
  const prefersReduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const [value, setValue] = useState<number>(representativeValue);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const inViewRef = useRef(false);
  const pausedRef = useRef(false);
  const startTsRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cancel any running rAF.
  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // rAF tick: compute ping-pong value from elapsed time.
  const tick = useCallback(
    (ts: number) => {
      if (!inViewRef.current || pausedRef.current) return;
      if (startTsRef.current === null) startTsRef.current = ts;
      const elapsed = ts - startTsRef.current;
      const raw = (elapsed % periodMs) / periodMs; // 0–1 repeating
      const triangle = raw < 0.5 ? raw * 2 : 2 - raw * 2; // 0→1→0
      const eased = triangle * triangle * (3 - 2 * triangle); // smoothstep
      setValue(Math.round(min + eased * (max - min)));
      rafRef.current = requestAnimationFrame(tick);
    },
    [min, max, periodMs]
  );

  // Start rAF only when conditions allow.
  const startRaf = useCallback(() => {
    if (rafRef.current !== null || !inViewRef.current || pausedRef.current || prefersReduced)
      return;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick, prefersReduced]);

  // Pause on any user interaction; resume automatically after 3 s.
  const handleInteraction = useCallback(() => {
    pausedRef.current = true;
    stopRaf();
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
      startTsRef.current = null; // re-anchor timing on resume
      startRaf();
    }, 3000);
  }, [stopRaf, startRaf]);

  // IntersectionObserver: start/stop when the card enters/leaves the viewport.
  useEffect(() => {
    if (prefersReduced) {
      setValue(representativeValue);
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !pausedRef.current) {
          startRaf();
        } else {
          stopRaf();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      stopRaf();
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [prefersReduced, representativeValue, startRaf, stopRaf]);

  // Shared event handlers to attach to the card wrapper.
  const interactionHandlers = useMemo(
    () => ({
      onMouseEnter: handleInteraction,
      onFocus: handleInteraction,
      onPointerDown: handleInteraction,
    }),
    [handleInteraction]
  );

  return { value, setValue, containerRef, interactionHandlers };
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// ─── Shared slider ────────────────────────────────────────────────────────────
function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
  accentColor,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
  accentColor?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const accent = accentColor ?? "#6366f1";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, userSelect: "none" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          fontFamily: "ui-monospace, monospace",
          letterSpacing: "0.04em",
        }}
      >
        <span style={{ opacity: 0.6 }}>{label}</span>
        <span style={{ color: accent, fontWeight: 600 }}>
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <div style={{ position: "relative", height: 20, display: "flex", alignItems: "center" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 4,
            borderRadius: 2,
            background: "currentColor",
            opacity: 0.15,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            width: `${pct}%`,
            height: 4,
            borderRadius: 2,
            background: accent,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            opacity: 0,
            cursor: "pointer",
            height: "100%",
            margin: 0,
          }}
        />
      </div>
    </div>
  );
}

// ─── Illustration wrapper ─────────────────────────────────────────────────────
function IllustrationCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "var(--border)",
        background: "var(--surface)",
        padding: "16px 16px 12px",
      }}
    >
      {children}
      <span
        style={{
          position: "absolute",
          bottom: 8,
          right: 10,
          fontSize: 9,
          fontFamily: "ui-monospace, monospace",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          opacity: 0.4,
        }}
      >
        Illustration
      </span>
    </div>
  );
}

// ─── UAV risk-aversion mini-map ───────────────────────────────────────────────
// SVG 300×200 top-down map. Storm circle at centre-right.
// Route curves away from storm as riskAversion slider increases.

const MAP_W = 300;
const MAP_H = 200;
const START = { x: 28, y: 100 };
const GOAL  = { x: 274, y: 100 };
const STORM = { x: 188, y: 100, r: 36 };

function uavRoutePath(risk: number): string {
  // risk: 0 (straight through) → 100 (wide arc above)
  const t = risk / 100;
  // Control points bend upward (lower y in SVG)
  const cy = 100 - t * 90;
  const cp1x = 110;
  const cp2x = 200;
  return `M${START.x},${START.y} C${cp1x},${cy} ${cp2x},${cy} ${GOAL.x},${GOAL.y}`;
}

function routeColor(risk: number): string {
  // Red at 0, amber at 50, indigo at 100
  const t = risk / 100;
  if (t < 0.5) {
    const s = t / 0.5;
    const r = Math.round(239 + s * (251 - 239));
    const g = Math.round(68  + s * (191 - 68));
    const b = Math.round(68  + s * (36  - 68));
    return `rgb(${r},${g},${b})`;
  } else {
    const s = (t - 0.5) / 0.5;
    const r = Math.round(251 + s * (99  - 251));
    const g = Math.round(191 + s * (102 - 191));
    const b = Math.round(36  + s * (241 - 36));
    return `rgb(${r},${g},${b})`;
  }
}

function UAVMiniMap({ isDark }: { isDark: boolean }) {
  // Autoplay: ping-pong risk 0→100→0 over 7 s.
  const { value: risk, setValue: setRisk, containerRef, interactionHandlers } = useAutoplay({
    min: 0, max: 100, periodMs: 7000, representativeValue: 50,
  });

  // Path is computed synchronously from risk — NO CSS `transition: d` (Safari unsupported).
  const pathD = uavRoutePath(risk);
  const color = routeColor(risk);

  const bg        = isDark ? "#0f172a" : "#f0f9ff";
  const terra     = isDark ? "#1e3a2a" : "#d1fae5";
  const stormFill = isDark ? "#334155" : "#94a3b8";
  const textC     = isDark ? "#94a3b8" : "#475569";

  return (
    /* containerRef + interactionHandlers wire up autoplay pause/resume */
    <div ref={containerRef} {...interactionHandlers}>
      <IllustrationCard>
        <svg
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          width="100%"
          style={{ display: "block", borderRadius: 8, background: bg, marginBottom: 10 }}
          role="img"
          aria-label="Top-down UAV route map showing storm avoidance"
        >
          {/* Terrain patches */}
          <rect x="0" y="0" width={MAP_W} height={MAP_H} fill={bg} />
          <ellipse cx="80" cy="150" rx="55" ry="30" fill={terra} opacity={0.6} />
          <ellipse cx="220" cy="55" rx="40" ry="22" fill={terra} opacity={0.5} />

          {/* Storm cell */}
          <circle cx={STORM.x} cy={STORM.y} r={STORM.r} fill={stormFill} opacity={0.75} />
          <circle cx={STORM.x} cy={STORM.y} r={STORM.r + 10} fill="none"
            stroke={stormFill} strokeWidth="1.5" opacity={0.3} strokeDasharray="4,4" />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x1 = STORM.x + Math.cos(rad) * (STORM.r - 8);
            const y1 = STORM.y + Math.sin(rad) * (STORM.r - 8);
            const x2 = STORM.x + Math.cos(rad + 0.9) * (STORM.r - 20);
            const y2 = STORM.y + Math.sin(rad + 0.9) * (STORM.r - 20);
            return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="1" opacity={0.25} />;
          })}
          <text x={STORM.x} y={STORM.y + 4} textAnchor="middle"
            fontSize="9" fill="white" opacity={0.6} fontFamily="ui-monospace,monospace">STORM</text>

          {/* Route — d recomputed each frame; no CSS transition: d (breaks Safari) */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Arrow — fill transition is fine on all browsers */}
          <polygon
            points={`${GOAL.x - 1},${GOAL.y - 5} ${GOAL.x + 8},${GOAL.y} ${GOAL.x - 1},${GOAL.y + 5}`}
            fill={color}
          />

          {/* Markers */}
          <circle cx={START.x} cy={START.y} r="5" fill="#64748b" />
          <circle cx={GOAL.x} cy={GOAL.y} r="5" fill="#22c55e" />
          <circle cx={GOAL.x} cy={GOAL.y} r="9" fill="none" stroke="#22c55e" strokeWidth="1.5" opacity={0.4} />
          <text x={START.x} y={START.y - 9} textAnchor="middle" fontSize="9"
            fill={textC} fontFamily="ui-monospace,monospace">Start</text>
          <text x={GOAL.x} y={GOAL.y - 12} textAnchor="middle" fontSize="9"
            fill={textC} fontFamily="ui-monospace,monospace">Goal</text>
        </svg>

        <Slider
          label="Risk aversion"
          value={risk}
          min={0}
          max={100}
          onChange={(v) => { setRisk(v); interactionHandlers.onPointerDown(); }}
          formatValue={(v) => (v === 0 ? "None (straight)" : v === 100 ? "Maximum" : `${v}%`)}
          accentColor="#6366f1"
        />
      </IllustrationCard>
    </div>
  );
}

// ─── Conformal coverage illustration ─────────────────────────────────────────

// Deterministic point cloud: linear trend + seeded noise
function makeCoveragePoints(n = 32) {
  // Seeded LCG so layout is stable across renders
  let seed = 42;
  const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };
  const pts = [];
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1; // [-1, 1]
    const y = 0.5 * x + 0.3 * x * x + (rand() - 0.5) * 0.55;
    pts.push({ x, y });
  }
  return pts;
}

const COV_PTS = makeCoveragePoints(32);

// For a given coverage target (80–99%), compute band half-width
// using empirical quantile of residuals from linear fit y ≈ 0.5x
function bandHalfWidth(targetPct: number): number {
  const residuals = COV_PTS.map((p) => Math.abs(p.y - (0.5 * p.x)));
  residuals.sort((a, b) => a - b);
  const idx = Math.max(0, Math.ceil((targetPct / 100) * residuals.length) - 1);
  return residuals[idx];
}

function CoverageSVG({ isDark }: { isDark: boolean }) {
  // Autoplay: ping-pong coverage target 80→99→80 over 8 s.
  const { value: target, setValue: setTarget, containerRef, interactionHandlers } = useAutoplay({
    min: 80, max: 99, periodMs: 8000, representativeValue: 90,
  });

  const hw = bandHalfWidth(target);

  const SVG_W = 280;
  const SVG_H = 160;
  const px = (x: number) => 20 + ((x + 1) / 2) * (SVG_W - 40);
  const py = (y: number) => SVG_H / 2 - y * 60;

  const bandFill   = isDark ? "rgba(99,102,241,0.18)" : "rgba(99,102,241,0.12)";
  const bandStroke = "#6366f1";
  const gridC      = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const textC      = isDark ? "#94a3b8" : "#64748b";

  const bandTop  = py(0.5 * 1 + hw);
  const bandBot  = py(0.5 * 1 - hw);
  const bandTopL = py(0.5 * -1 + hw);
  const bandBotL = py(0.5 * -1 - hw);

  const x0 = px(-1);
  const x1 = px(1);

  const inside = COV_PTS.filter((p) => Math.abs(p.y - 0.5 * p.x) <= hw).length;
  const pct    = Math.round((inside / COV_PTS.length) * 100);

  return (
    /* containerRef + interactionHandlers wire autoplay pause/resume */
    <div ref={containerRef} {...interactionHandlers} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <IllustrationCard>
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ display: "block", marginBottom: 10 }}
          role="img"
          aria-label="Scatter plot with conformal prediction band"
        >
          {[-0.5, 0, 0.5].map((v) => (
            <line key={v} x1={px(-1)} y1={py(v)} x2={px(1)} y2={py(v)} stroke={gridC} strokeWidth="1" />
          ))}

          {/* Prediction band — recomputed each rAF tick, no CSS `d` transition */}
          <polygon
            points={`${x0},${bandTopL} ${x1},${bandTop} ${x1},${bandBot} ${x0},${bandBotL}`}
            fill={bandFill}
          />
          <line x1={x0} y1={bandTopL} x2={x1} y2={bandTop}
            stroke={bandStroke} strokeWidth="1.5" strokeDasharray="4,3" opacity={0.7} />
          <line x1={x0} y1={bandBotL} x2={x1} y2={bandBot}
            stroke={bandStroke} strokeWidth="1.5" strokeDasharray="4,3" opacity={0.7} />
          <line x1={x0} y1={py(-0.5)} x2={x1} y2={py(0.5)}
            stroke={bandStroke} strokeWidth="1.5" opacity={0.55} />

          {COV_PTS.map((p, i) => {
            const inBand = Math.abs(p.y - 0.5 * p.x) <= hw;
            return (
              <circle key={i} cx={px(p.x)} cy={py(p.y)} r="3.5"
                fill={inBand ? "#6366f1" : "#ef4444"} opacity={inBand ? 0.85 : 0.7} />
            );
          })}

          <text x={SVG_W - 6} y={14} textAnchor="end" fontSize="10"
            fontFamily="ui-monospace,monospace" fill={textC}>
            {inside}/{COV_PTS.length} inside ({pct}%)
          </text>
        </svg>

        <Slider
          label="Coverage target"
          value={target}
          min={80}
          max={99}
          onChange={(v) => { setTarget(v); interactionHandlers.onPointerDown(); }}
          formatValue={(v) => `${v}%`}
          accentColor="#6366f1"
        />
      </IllustrationCard>
    </div>
  );
}

// ─── Privacy noise illustration ───────────────────────────────────────────────
// Two clusters; noise slider jitters positions

function makePrivacyPoints() {
  let seed = 7;
  const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };
  const pts: { bx: number; by: number; label: 0 | 1 }[] = [];
  // Cluster 0: centre (-0.35, 0.1)
  for (let i = 0; i < 24; i++) {
    const angle = rand() * Math.PI * 2;
    const r = rand() * 0.28;
    pts.push({ bx: -0.35 + Math.cos(angle) * r, by: 0.1 + Math.sin(angle) * r, label: 0 });
  }
  // Cluster 1: centre (0.35, -0.1)
  for (let i = 0; i < 24; i++) {
    const angle = rand() * Math.PI * 2;
    const r = rand() * 0.28;
    pts.push({ bx: 0.35 + Math.cos(angle) * r, by: -0.1 + Math.sin(angle) * r, label: 1 });
  }
  return pts;
}

const PRIV_BASE = makePrivacyPoints();

// Pre-generate random offsets per point (stable)
const PRIV_OFFSETS = (() => {
  let seed = 99;
  const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };
  return PRIV_BASE.map(() => ({ dx: rand() - 0.5, dy: rand() - 0.5 }));
})();

function PrivacySVG({ isDark }: { isDark: boolean }) {
  // Autoplay: ping-pong DP noise 0→100→0 over 6 s.
  const { value: noise, setValue: setNoise, containerRef, interactionHandlers } = useAutoplay({
    min: 0, max: 100, periodMs: 6000, representativeValue: 0,
  });

  const sigma = (noise / 100) * 0.7;

  const SVG_W = 280;
  const SVG_H = 160;
  const px = (x: number) => SVG_W / 2 + x * 100;
  const py = (y: number) => SVG_H / 2 - y * 100;

  const c0    = isDark ? "#6366f1" : "#4f46e5";
  const c1    = isDark ? "#22d3ee" : "#0891b2";
  const textC = isDark ? "#94a3b8" : "#64748b";

  return (
    /* containerRef + interactionHandlers wire autoplay pause/resume */
    <div ref={containerRef} {...interactionHandlers}>
      <IllustrationCard>
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ display: "block", marginBottom: 10 }}
          role="img"
          aria-label="Point cloud privacy noise illustration"
        >
          {/* Points recomputed each rAF tick from noise value */}
          {PRIV_BASE.map((p, i) => {
            const nx = p.bx + PRIV_OFFSETS[i].dx * sigma;
            const ny = p.by + PRIV_OFFSETS[i].dy * sigma;
            const opacity = Math.max(0.2, 0.85 - sigma * 0.5);
            return (
              <circle key={i} cx={px(nx)} cy={py(ny)} r="4"
                fill={p.label === 0 ? c0 : c1} opacity={opacity} />
            );
          })}
          {/* Cluster labels fade as noise increases */}
          <text x={px(-0.35)} y={py(0.1) - 22} textAnchor="middle" fontSize="9"
            fontFamily="ui-monospace,monospace" fill={textC}
            opacity={Math.max(0, 1 - noise / 40)}>
            Group A
          </text>
          <text x={px(0.35)} y={py(-0.1) + 28} textAnchor="middle" fontSize="9"
            fontFamily="ui-monospace,monospace" fill={textC}
            opacity={Math.max(0, 1 - noise / 40)}>
            Group B
          </text>
        </svg>

        <Slider
          label="Privacy noise (DP σ)"
          value={noise}
          min={0}
          max={100}
          onChange={(v) => { setNoise(v); interactionHandlers.onPointerDown(); }}
          formatValue={(v) => (v === 0 ? "None" : v < 40 ? "Low" : v < 75 ? "Medium" : "High")}
          accentColor="#22d3ee"
        />
      </IllustrationCard>
    </div>
  );
}

// ─── Likert stacked bars ──────────────────────────────────────────────────────
// Generic survey items, illustrative percentages

const LIKERT_ITEMS = [
  { label: "Item A", vals: [5, 12, 18, 38, 27] },
  { label: "Item B", vals: [4, 9,  22, 42, 23] },
  { label: "Item C", vals: [8, 14, 25, 32, 21] },
  { label: "Item D", vals: [3, 7,  16, 45, 29] },
];

const LIKERT_LABELS = ["Strongly\nDisagree", "Disagree", "Neutral", "Agree", "Strongly\nAgree"];
const LIKERT_COLORS = ["#ef4444", "#f97316", "#94a3b8", "#34d399", "#10b981"];

function LikertBars({ isDark }: { isDark: boolean }) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;
    if (prefersReduced) { setAnimated(true); return; }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true); },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const textC = isDark ? "#94a3b8" : "#64748b";
  const bgBar = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";

  return (
    <IllustrationCard>
      <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {LIKERT_ITEMS.map((item) => {
          const total = item.vals.reduce((a, b) => a + b, 0);
          return (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "ui-monospace, monospace",
                  color: textC,
                  width: 42,
                  flexShrink: 0,
                  letterSpacing: "0.04em",
                }}
              >
                {item.label}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 20,
                  borderRadius: 4,
                  overflow: "hidden",
                  display: "flex",
                  background: bgBar,
                }}
              >
                {item.vals.map((v, ci) => (
                  <div
                    key={ci}
                    title={`${LIKERT_LABELS[ci].replace("\n", " ")}: ${v}%`}
                    style={{
                      height: "100%",
                      background: LIKERT_COLORS[ci],
                      width: animated ? `${(v / total) * 100}%` : "0%",
                      transition: animated
                        ? `width 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${ci * 0.06}s`
                        : "none",
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "ui-monospace, monospace",
                  color: textC,
                  width: 28,
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {item.vals[3] + item.vals[4]}%
              </span>
            </div>
          );
        })}

        {/* Legend */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
          {LIKERT_LABELS.map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: LIKERT_COLORS[i],
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 9,
                  fontFamily: "ui-monospace, monospace",
                  color: textC,
                  letterSpacing: "0.03em",
                }}
              >
                {l.replace("\n", " ")}
              </span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 10, fontFamily: "ui-monospace, monospace", color: textC, margin: 0, opacity: 0.6 }}>
          Illustrative survey data · generic item labels · 5-point Likert scale · n≈fictional
        </p>
      </div>
    </IllustrationCard>
  );
}

// ─── Figure lightbox ──────────────────────────────────────────────────────────
function FigureLightbox({
  src,
  alt,
  caption,
  buttonLabel,
}: {
  src: string;
  alt: string;
  caption: string;
  buttonLabel?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="text-xs font-mono tracking-wide px-3 py-1.5 rounded-lg border border-border text-fg-muted hover:text-fg hover:bg-surface-raised transition-colors"
          style={{ cursor: "pointer" }}
        >
          {buttonLabel ?? "See figure from the paper →"}
        </button>
      </DialogTrigger>
      <DialogContent
        className="max-w-3xl w-full"
        style={{ padding: "20px" }}
        aria-describedby="fig-desc"
      >
        <DialogHeader>
          <DialogTitle className="text-sm font-mono tracking-wide">Research figure</DialogTitle>
        </DialogHeader>
        <div className="relative rounded-lg overflow-hidden border border-border bg-surface">
          <Image
            src={src}
            alt={alt}
            width={900}
            height={560}
            className="w-full h-auto object-contain"
            priority
            sizes="(max-width: 768px) 95vw, 800px"
          />
        </div>
        <p
          id="fig-desc"
          className="text-xs font-mono text-fg-subtle mt-2 leading-relaxed"
        >
          {caption}
        </p>
      </DialogContent>
    </Dialog>
  );
}

// ─── Theme hook (client-safe) ────────────────────────────────────────────────
function useIsDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const check = () => setDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function ResearchThemes() {
  const isDark = useIsDark();

  return (
    <section
      id="research"
      className="w-full px-6 lg:px-[8%] py-24 scroll-mt-20 border-t border-border"
    >
      <Reveal className="max-w-5xl mx-auto">
        <p className="text-xs font-mono tracking-widest uppercase text-fg-muted mb-2">
          Research
        </p>
        <h2 className="text-4xl sm:text-5xl font-bold text-fg tracking-tight mb-6">
          Three Themes
        </h2>
        <p className="text-base text-fg-muted leading-relaxed max-w-2xl mb-16">
          All work is grounded in rigorous statistical guarantees. The primary
          thread is decision-making under uncertainty for autonomous systems.
        </p>

        {/* ── Theme 1: UAV & DRO ─────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-20">
          <div>
            <span className="inline-block text-xs font-mono tracking-widest uppercase px-3 py-1 rounded-full border mb-4 bg-indigo-500/10 border-indigo-500/30 text-indigo-400">
              UAV Routing &amp; DRO
            </span>
            <p className="text-base text-fg-muted leading-relaxed mb-6">
              CVaR and Wasserstein distributionally robust optimisation for UAV
              route planning under stochastic wind. Bayesian forecast correction,
              3D altitude-aware routing, and PX4 SITL simulation cross-validation
              across six global climate zones.
            </p>
            <FigureLightbox
              src="/research/fig_frontier.webp"
              alt="Pareto frontier chart of CVaR vs cost for WDRO and tuned-CVaR baseline across six climate zones"
              caption="Risk–cost frontier for WDRO-MOR and a per-zone tuned CVaR baseline across six global climate zones. From the public wdro-mor reproducibility release."
            />
          </div>
          <UAVMiniMap isDark={isDark} />
        </div>

        {/* ── Theme 2: Trustworthy ML ────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-20 lg:grid-flow-dense">
          <div className="lg:col-start-2">
            <span className="inline-block text-xs font-mono tracking-widest uppercase px-3 py-1 rounded-full border mb-4 bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
              Trustworthy ML
            </span>
            <p className="text-base text-fg-muted leading-relaxed mb-6">
              Conformal prediction for finite-sample coverage certificates.
              Differential privacy (DP-SGD, Opacus) for federated learning.
              Last-layer Laplace posteriors and embedding-based clustering
              benchmarks. Statistical rigour for ML systems that must behave
              reliably in deployment.
            </p>
            <FigureLightbox
              src="/research/fig_litfloor.webp"
              alt="Scatter plot comparing literature coverage gaps to the theoretical conformal floor"
              caption="Coverage gap (reported − nominal) for 11 methods from the conformal-prediction literature versus the theoretical floor (gray band: 0–95th percentile of floor). Orange diamonds exceed the floor (p < 0.05); blue circles are statistically indistinguishable. Most reported gaps are floor-bound, not method-specific improvements."
            />
          </div>
          <div className="lg:col-start-1 lg:row-start-1 flex flex-col gap-5">
            <CoverageSVG isDark={isDark} />
            <PrivacySVG isDark={isDark} />
          </div>
        </div>

        {/* ── Theme 3: Applied Bangladesh ────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <span className="inline-block text-xs font-mono tracking-widest uppercase px-3 py-1 rounded-full border mb-4 bg-amber-500/10 border-amber-500/30 text-amber-400">
              Applied Research · Bangladesh
            </span>
            <p className="text-base text-fg-muted leading-relaxed mb-6">
              Quantitative and survey studies on Bangladesh&apos;s readymade garment
              (RMG) sector, textile wastewater, and urban waste classification.
              Survey design, EFA-based scale validation, ANOVA, and regression
              pipelines.
            </p>
            <ul className="space-y-3">
              {[
                { title: "Environmental Challenges of Textile Wastewater in Bangladesh", venue: "ICTSE 2025, BUTEX" },
                { title: "Determinants of Pay Satisfaction and Working Conditions Among Bangladeshi RMG Workers", venue: "ICTSE 2026, BUTEX" },
                { title: "Incentive Pay, Style Disruptions, and Overtime: Statistical Determinants of Productivity in Bangladeshi RMG", venue: "ICTSE 2026, BUTEX" },
                { title: "Intelligent Waste Classification for Urban Bangladesh: A MobileNetV3 Approach", venue: "PECCII 2026, PUST" },
              ].map((p) => (
                <li key={p.title} className="flex gap-3 items-start">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500/60" />
                  <span>
                    <span className="text-sm text-fg leading-snug">{p.title}</span>
                    <span className="block text-xs font-mono text-fg-subtle mt-0.5">{p.venue}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <LikertBars isDark={isDark} />
        </div>
      </Reveal>
    </section>
  );
}
