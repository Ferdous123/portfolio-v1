"use client";

import { useMemo } from "react";
import { publications } from "@/constants/publications";

const THEME_COLORS: Record<string, string> = {
  "uav-robust": "#818cf8",
  "trustworthy-ml": "#34d399",
  "applied-bd": "#fbbf24",
};

export default function PublicationTimeline() {
  const sorted = useMemo(() => {
    return [...publications]
      .filter((p) => p.status !== "inprep")
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  }, []);

  // Build cumulative count
  const timeline = useMemo(() => {
    const points: { dateISO: string; cumulative: number; theme: string; title: string }[] = [];
    sorted.forEach((p, i) => {
      points.push({
        dateISO: p.dateISO,
        cumulative: i + 1,
        theme: p.theme,
        title: p.title,
      });
    });
    return points;
  }, [sorted]);

  const W = 680;
  const H = 100;
  const PAD = { left: 40, right: 24, top: 16, bottom: 28 };

  const dates = timeline.map((p) => new Date(p.dateISO).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const maxCount = timeline.length;

  function xOf(iso: string) {
    const t = new Date(iso).getTime();
    const ratio = maxDate === minDate ? 0.5 : (t - minDate) / (maxDate - minDate);
    return PAD.left + ratio * (W - PAD.left - PAD.right);
  }

  function yOf(count: number) {
    return PAD.top + (1 - count / maxCount) * (H - PAD.top - PAD.bottom);
  }

  const polyline = timeline
    .map((p) => `${xOf(p.dateISO)},${yOf(p.cumulative)}`)
    .join(" ");

  // X-axis year ticks
  const years = Array.from(
    new Set(timeline.map((p) => p.dateISO.slice(0, 4)))
  );

  return (
    <div className="border border-border rounded-xl bg-surface p-4 overflow-x-auto">
      <p className="text-xs font-mono tracking-widest uppercase text-fg-subtle mb-3">
        Cumulative published / accepted works over time
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: 280 }}
        aria-label="Cumulative publication timeline"
      >
        {/* Grid lines */}
        {[1, 3, 5, 7, 9].filter((v) => v <= maxCount).map((v) => (
          <line
            key={v}
            x1={PAD.left}
            y1={yOf(v)}
            x2={W - PAD.right}
            y2={yOf(v)}
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.12"
            strokeDasharray="4,4"
          />
        ))}

        {/* Step line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="#818cf8"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dots */}
        {timeline.map((p, i) => (
          <circle
            key={i}
            cx={xOf(p.dateISO)}
            cy={yOf(p.cumulative)}
            r="3"
            fill={THEME_COLORS[p.theme] ?? "#818cf8"}
          >
            <title>{p.title}</title>
          </circle>
        ))}

        {/* Y-axis label */}
        <text
          x={PAD.left - 6}
          y={yOf(maxCount)}
          textAnchor="end"
          fontSize="9"
          fill="currentColor"
          fillOpacity="0.45"
          dominantBaseline="middle"
        >
          {maxCount}
        </text>
        <text
          x={PAD.left - 6}
          y={yOf(1)}
          textAnchor="end"
          fontSize="9"
          fill="currentColor"
          fillOpacity="0.45"
          dominantBaseline="middle"
        >
          1
        </text>

        {/* X-axis year labels */}
        {years.map((y) => {
          const x = xOf(`${y}-01-01`);
          return (
            <text
              key={y}
              x={Math.max(PAD.left, Math.min(W - PAD.right, x))}
              y={H - 4}
              textAnchor="middle"
              fontSize="9"
              fill="currentColor"
              fillOpacity="0.45"
            >
              {y}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-2">
        {Object.entries(THEME_COLORS).map(([k, c]) => (
          <span key={k} className="flex items-center gap-1.5 text-xs font-mono text-fg-subtle">
            <span className="w-2 h-2 rounded-full" style={{ background: c }} />
            {k === "uav-robust" ? "UAV & DRO" : k === "trustworthy-ml" ? "Trustworthy ML" : "Applied · BD"}
          </span>
        ))}
      </div>
    </div>
  );
}
