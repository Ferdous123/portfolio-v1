import { ImageResponse } from "next/og";
import { pubStats } from "@/constants/publications";

export const runtime = "edge";
export const alt = "Ferdus Hossain — Distributionally Robust Optimisation & Trustworthy ML";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const stats = [
    { value: pubStats.total,          label: "peer-reviewed" },
    { value: pubStats.firstAuthor,    label: "first author"  },
    { value: pubStats.corresponding,  label: "corresponding" },
    { value: pubStats.inPrep,         label: "in preparation"},
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0a0a0a",
          padding: "72px 80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 80,
            right: 80,
            height: 3,
            background: "linear-gradient(90deg, #6366f1, #4f46e5)",
            borderRadius: 2,
          }}
        />

        {/* Status badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: "#22c55e",
            }}
          />
          <span
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 13,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#6b7280",
            }}
          >
            Open to research collaborations
          </span>
        </div>

        {/* Name */}
        <h1
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#f9fafb",
            lineHeight: 1.0,
            letterSpacing: "-0.04em",
            margin: 0,
          }}
        >
          Ferdus Hossain
        </h1>

        {/* Focus line */}
        <p
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 17,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#6366f1",
            marginTop: 20,
            marginBottom: 40,
          }}
        >
          DRO · CVaR · Conformal Prediction · Differential Privacy
        </p>

        {/* Stat cards */}
        <div style={{ display: "flex", gap: 20 }}>
          {stats.map(({ value, label }) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "18px 24px",
                borderRadius: 12,
                border: "1px solid #1f2937",
                background: "#111827",
                minWidth: 140,
              }}
            >
              <span
                style={{
                  fontSize: 42,
                  fontWeight: 700,
                  color: "#f9fafb",
                  lineHeight: 1,
                }}
              >
                {value}
              </span>
              <span
                style={{
                  fontFamily: "ui-monospace, monospace",
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#6b7280",
                  marginTop: 6,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Footer domain */}
        <p
          style={{
            position: "absolute",
            bottom: 44,
            right: 80,
            fontFamily: "ui-monospace, monospace",
            fontSize: 13,
            color: "#374151",
            letterSpacing: "0.05em",
          }}
        >
          ferdus.vercel.app
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
