/**
 * StoryPoster — Phase 1 base for the scroll-story section.
 *
 * A fully static, server-renderable section: an SVG illustration
 * (top-down map of the three-planner scenario) plus the five story captions
 * as a normal text block. No WebGL, no animation, no pinned scroll height.
 *
 * Theme-aware via CSS variables only; works light + dark with JS off.
 */

const C_SHORT = "#a8a29e"; // SP-1 warm stone
const C_AVG   = "#c8a97e"; // AW-1 muted sand
const C_RISK  = "#6366f1"; // RA-1 indigo
const C_GOAL  = "#22c55e"; // landing pad green
const C_CRASH = "#ef4444"; // crash marker red

// Top-down SVG coordinate helpers (world → SVG)
// World X: -14..+14 → SVG x: 60..740 (680px wide, centre 400)
// World Z: -10..+10 → SVG y: 60..400 (positive Z = top of SVG)
function wx(x: number) { return 400 + x * 22.86; }
function wz(z: number) { return 230 - z * 17; }

// Route control points
// SP-1: straight line into storm core
const sp1 = [
  { x: wx(-14), y: wz(0)   }, // all routes leave the START pad
  { x: wx(0),   y: wz(1.0) },
  { x: wx(6),   y: wz(0.5) },
  { x: wx(8.3), y: wz(0.2) },   // crash inside storm
];

// AW-1: skirts edge, crashes south
const aw1 = [
  { x: wx(-14), y: wz(0)    },
  { x: wx(-5),  y: wz(-2.5) },
  { x: wx(4),   y: wz(-3.5) },
  { x: wx(7.5), y: wz(-3.0) },
  { x: wx(10),  y: wz(-5.5) }, // crash
];

// RA-1: wide northern arc, lands at goal
const ra1 = [
  { x: wx(-14), y: wz(0)    },
  { x: wx(-7),  y: wz(5)    },
  { x: wx(0),   y: wz(8.5)  },
  { x: wx(8),   y: wz(8.5)  },
  { x: wx(13),  y: wz(4)    },
  { x: wx(14),  y: wz(0)    },
];

function polyline(pts: { x: number; y: number }[]): string {
  return pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

function cubicPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const cp = pts[i - 1];
    const ep = pts[i];
    const cpx = ((cp.x + ep.x) / 2).toFixed(1);
    const cpy = ((cp.y + ep.y) / 2).toFixed(1);
    if (i === 1) {
      d += ` Q ${cpx} ${cpy} ${ep.x.toFixed(1)} ${ep.y.toFixed(1)}`;
    } else {
      d += ` T ${ep.x.toFixed(1)} ${ep.y.toFixed(1)}`;
    }
  }
  return d;
}

const STORM_X = wx(8);
const STORM_Y = wz(0);

const CAPTIONS = [
  "Every flight starts with a forecast.",
  "Forecasts are wrong exactly where it matters.",
  "Planners built for the average wind fly straight into it.",
  "A risk-aware planner prices the worst plausible gust, and flies past it.",
  "That is the problem I work on.",
];

export function StoryPoster() {
  const startX = wx(-14), startY = wz(0);
  const goalX  = wx(14),  goalY  = wz(0);

  return (
    <section
      aria-label="Story illustration: three UAV planners in a wind storm"
      style={{ width: "100%", padding: "3rem 0 2.5rem" }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 1rem" }}>

        {/* ── SVG Illustration ── */}
        <div
          style={{
            width: "100%",
            borderRadius: "1rem",
            overflow: "hidden",
            border: "1px solid var(--border)",
            background: "var(--canvas)",
            position: "relative",
          }}
        >
          <svg
            viewBox="0 0 800 460"
            width="100%"
            aria-hidden="true"
            style={{ display: "block" }}
          >
            {/* Background */}
            <defs>
              <radialGradient id="stormGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#334155" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#475569" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="goalGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={C_GOAL} stopOpacity="0.25" />
                <stop offset="100%" stopColor={C_GOAL} stopOpacity="0" />
              </radialGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Canvas background */}
            <rect width="800" height="460" fill="var(--canvas)" />

            {/* Terrain suggestion: subtle contour bands */}
            {[160, 130, 100, 70].map((r, i) => (
              <ellipse
                key={i}
                cx="400"
                cy="230"
                rx={320 - i * 40}
                ry={150 - i * 20}
                fill="none"
                stroke="var(--border)"
                strokeWidth="1"
                opacity={0.4 - i * 0.06}
              />
            ))}

            {/* Mountain ridgeline suggestion top */}
            <path
              d="M 0 80 Q 100 60, 200 70 Q 300 55, 400 65 Q 500 55, 600 70 Q 700 60, 800 75"
              fill="none"
              stroke="var(--border)"
              strokeWidth="1.5"
              opacity="0.3"
            />
            {/* Mountain ridgeline suggestion bottom */}
            <path
              d="M 0 380 Q 100 400, 200 390 Q 300 405, 400 395 Q 500 405, 600 390 Q 700 400, 800 385"
              fill="none"
              stroke="var(--border)"
              strokeWidth="1.5"
              opacity="0.3"
            />

            {/* Storm cell */}
            <circle
              cx={STORM_X}
              cy={STORM_Y}
              r="90"
              fill="url(#stormGrad)"
            />
            {/* Storm swirl rings */}
            {[65, 48, 32].map((r, i) => (
              <circle
                key={i}
                cx={STORM_X}
                cy={STORM_Y}
                r={r}
                fill="none"
                stroke="#475569"
                strokeWidth="1"
                strokeDasharray={`${r * 0.8} ${r * 0.4}`}
                opacity={0.5 - i * 0.1}
              />
            ))}
            {/* Lightning bolt */}
            <path
              d={`M ${STORM_X - 8} ${STORM_Y - 30} L ${STORM_X + 2} ${STORM_Y - 2} L ${STORM_X - 4} ${STORM_Y - 2} L ${STORM_X + 8} ${STORM_Y + 28}`}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeLinejoin="round"
              opacity="0.9"
              filter="url(#glow)"
            />
            {/* Storm label */}
            <text
              x={STORM_X + 0}
              y={STORM_Y + 110}
              textAnchor="middle"
              fontSize="10"
              fill="var(--fg-muted)"
              fontFamily="ui-monospace, monospace"
              letterSpacing="0.08em"
            >
              STORM CELL
            </text>

            {/* Rain streaks under storm */}
            {Array.from({ length: 12 }, (_, i) => {
              const rx = STORM_X - 50 + i * 9;
              return (
                <line
                  key={i}
                  x1={rx}
                  y1={STORM_Y + 45}
                  x2={rx - 4}
                  y2={STORM_Y + 70}
                  stroke="#93c5fd"
                  strokeWidth="1"
                  opacity="0.35"
                />
              );
            })}

            {/* SP-1 route (crashes) */}
            <polyline
              points={polyline(sp1)}
              fill="none"
              stroke={C_SHORT}
              strokeWidth="2"
              strokeDasharray="8 5"
              opacity="0.8"
            />
            {/* SP-1 crash marker */}
            {(() => {
              const p = sp1[sp1.length - 1];
              return (
                <g key="sp1-crash" filter="url(#glow)">
                  <line x1={p.x - 7} y1={p.y - 7} x2={p.x + 7} y2={p.y + 7} stroke={C_CRASH} strokeWidth="2.5" />
                  <line x1={p.x + 7} y1={p.y - 7} x2={p.x - 7} y2={p.y + 7} stroke={C_CRASH} strokeWidth="2.5" />
                </g>
              );
            })()}

            {/* AW-1 route (crashes) */}
            <polyline
              points={polyline(aw1)}
              fill="none"
              stroke={C_AVG}
              strokeWidth="2"
              strokeDasharray="8 5"
              opacity="0.8"
            />
            {/* AW-1 crash marker */}
            {(() => {
              const p = aw1[aw1.length - 1];
              return (
                <g key="aw1-crash" filter="url(#glow)">
                  <line x1={p.x - 7} y1={p.y - 7} x2={p.x + 7} y2={p.y + 7} stroke={C_CRASH} strokeWidth="2.5" />
                  <line x1={p.x + 7} y1={p.y - 7} x2={p.x - 7} y2={p.y + 7} stroke={C_CRASH} strokeWidth="2.5" />
                </g>
              );
            })()}

            {/* RA-1 route (arc, lands at goal) */}
            <polyline
              points={polyline(ra1)}
              fill="none"
              stroke={C_RISK}
              strokeWidth="2.5"
              opacity="0.92"
            />
            {/* RA-1 arrow at landing */}
            {(() => {
              const p = ra1[ra1.length - 1];
              const prev = ra1[ra1.length - 2];
              const angle = Math.atan2(p.y - prev.y, p.x - prev.x) * 180 / Math.PI;
              return (
                <g transform={`translate(${p.x},${p.y}) rotate(${angle})`}>
                  <polygon points="0,0 -10,-5 -10,5" fill={C_RISK} opacity="0.9" />
                </g>
              );
            })()}

            {/* Goal glow */}
            <circle cx={goalX} cy={goalY} r="35" fill="url(#goalGrad)" />

            {/* Start pad */}
            <circle cx={startX} cy={startY} r="12" fill="none" stroke="#64748b" strokeWidth="2" />
            <circle cx={startX} cy={startY} r="4" fill="#64748b" />
            <text
              x={startX}
              y={startY - 18}
              textAnchor="middle"
              fontSize="10"
              fill="var(--fg-muted)"
              fontFamily="ui-monospace, monospace"
              letterSpacing="0.06em"
            >
              START
            </text>

            {/* Goal pad */}
            <circle cx={goalX} cy={goalY} r="12" fill="none" stroke={C_GOAL} strokeWidth="2.5" />
            <circle cx={goalX} cy={goalY} r="4" fill={C_GOAL} />
            <text
              x={goalX}
              y={goalY - 18}
              textAnchor="middle"
              fontSize="10"
              fill={C_GOAL}
              fontFamily="ui-monospace, monospace"
              letterSpacing="0.06em"
            >
              GOAL
            </text>

            {/* Aircraft icons at mid-path (simple fixed-wing silhouettes) */}
            {/* SP-1 at roughly the halfway point */}
            {(() => {
              const p = sp1[1]; // mid-ish
              return (
                <g transform={`translate(${p.x},${p.y})`}>
                  <ellipse cx="0" cy="0" rx="8" ry="2" fill={C_SHORT} opacity="0.7" />
                  <rect x="-3" y="-5" width="6" height="9" fill={C_SHORT} opacity="0.7" />
                </g>
              );
            })()}

            {/* RA-1 at its arc peak */}
            {(() => {
              const p = ra1[2]; // top of arc
              return (
                <g transform={`translate(${p.x},${p.y}) rotate(-30)`}>
                  <ellipse cx="0" cy="0" rx="8" ry="2" fill={C_RISK} opacity="0.9" />
                  <rect x="-3" y="-5" width="6" height="9" fill={C_RISK} opacity="0.9" />
                </g>
              );
            })()}

            {/* Legend */}
            <rect x="14" y="14" width="190" height="80" rx="8"
              fill="var(--canvas)" opacity="0.85"
              stroke="var(--border)" strokeWidth="1"
            />
            {[
              { color: C_SHORT, label: "SP-1 · Shortest path",      dash: "8 5", y: 36 },
              { color: C_AVG,   label: "AW-1 · Avg-wind planner",   dash: "8 5", y: 55 },
              { color: C_RISK,  label: "RA-1 · Risk-aware (ours)", dash: "none", y: 74 },
            ].map((item) => (
              <g key={item.label}>
                <line
                  x1="26" y1={item.y} x2="54" y2={item.y}
                  stroke={item.color}
                  strokeWidth="2"
                  strokeDasharray={item.dash === "none" ? "" : item.dash}
                />
                <text
                  x="62"
                  y={item.y + 4}
                  fontSize="10"
                  fill="var(--fg-muted)"
                  fontFamily="ui-monospace, monospace"
                >
                  {item.label}
                </text>
              </g>
            ))}

            {/* Illustration tag */}
            <text
              x="786"
              y="450"
              textAnchor="end"
              fontSize="8"
              fill="var(--fg-subtle)"
              fontFamily="ui-monospace, monospace"
              letterSpacing="0.1em"
            >
              ILLUSTRATION
            </text>
          </svg>
        </div>

        {/* ── Captions as real text ── */}
        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {CAPTIONS.map((caption, i) => (
            <p
              key={i}
              style={{
                margin: 0,
                fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
                lineHeight: 1.5,
                color: i === CAPTIONS.length - 1
                  ? "var(--accent)"
                  : "var(--fg-muted)",
                fontWeight: i === CAPTIONS.length - 1 ? 600 : 400,
                paddingLeft: "0.5rem",
                borderLeft: `2px solid ${i === CAPTIONS.length - 1 ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              {caption}
            </p>
          ))}
        </div>

        {/* ── Planner key ── */}
        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          {[
            { color: C_SHORT, id: "SP-1", desc: "Shortest path" },
            { color: C_AVG,   id: "AW-1", desc: "Average-wind planner" },
            { color: C_RISK,  id: "RA-1", desc: "Risk-aware planner (ours)" },
          ].map((item) => (
            <span
              key={item.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.75rem",
                fontFamily: "ui-monospace, monospace",
                color: "var(--fg-muted)",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "0.4rem",
                padding: "0.25rem 0.6rem",
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 2,
                  background: item.color,
                  borderRadius: 1,
                  flexShrink: 0,
                }}
              />
              <strong style={{ color: item.color }}>{item.id}</strong>
              {" "}{item.desc}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StoryPoster;
