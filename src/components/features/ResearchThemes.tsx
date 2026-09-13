import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";

interface Theme {
  id: string;
  label: string;
  color: string;
  description: string;
  figure?: string;
  figureCaption?: string;
  alt?: string;
  papers?: { title: string; venue: string }[];
}

const themes: Theme[] = [
  {
    id: "uav-robust",
    label: "UAV Routing & DRO",
    color: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
    description:
      "CVaR and Wasserstein distributionally robust optimisation for UAV route planning under stochastic wind. Bayesian forecast correction, 3D altitude-aware routing, and PX4 SITL simulation cross-validation across six global climate zones.",
    figure: "/research/fig_frontier.webp",
    figureCaption:
      "Risk–cost frontier for WDRO-MOR and a per-zone tuned CVaR baseline across six global climate zones. From the public wdro-mor reproducibility release.",
    alt: "Pareto frontier chart of CVaR vs cost for WDRO and tuned-CVaR baseline across six climate zones",
  },
  {
    id: "trustworthy-ml",
    label: "Trustworthy ML",
    color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    description:
      "Conformal prediction for finite-sample coverage certificates. Differential privacy (DP-SGD, Opacus) for federated learning. Last-layer Laplace posteriors and embedding-based clustering benchmarks. Statistical rigour for ML systems that must behave reliably in deployment.",
    figure: "/research/fig_litfloor.webp",
    figureCaption:
      "Coverage gap (reported − nominal) for 11 methods from the conformal-prediction literature versus the theoretical floor (gray band: 0–95th percentile of floor). Orange diamonds exceed the floor (p < 0.05); blue circles are statistically indistinguishable. Most reported gaps are floor-bound, not method-specific improvements.",
    alt: "Scatter plot comparing literature coverage gaps to the theoretical conformal floor across 11 methods",
  },
  {
    id: "applied-bd",
    label: "Applied Research · Bangladesh",
    color: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    description:
      "Quantitative and survey studies on Bangladesh's readymade garment (RMG) sector, textile wastewater, and urban waste classification. Survey design, EFA-based scale validation, ANOVA, and regression pipelines.",
    papers: [
      { title: "Environmental Challenges of Textile Wastewater in Bangladesh", venue: "ICTSE 2025, BUTEX" },
      { title: "Determinants of Pay Satisfaction and Working Conditions Among Bangladeshi RMG Workers", venue: "ICTSE 2026, BUTEX" },
      { title: "Incentive Pay, Style Disruptions, and Overtime: Statistical Determinants of Productivity in Bangladeshi RMG", venue: "ICTSE 2026, BUTEX" },
      { title: "Intelligent Waste Classification for Urban Bangladesh: A MobileNetV3 Approach", venue: "PECCII 2026, PUST" },
    ],
  },
];

export default function ResearchThemes() {
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

        <div className="space-y-16">
          {themes.map((theme, i) => (
            <div
              key={theme.id}
              className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "lg:grid-flow-dense" : ""}`}
            >
              {/* Text column */}
              <div className={i % 2 === 1 ? "lg:col-start-2" : ""}>
                <span
                  className={`inline-block text-xs font-mono tracking-widest uppercase px-3 py-1 rounded-full border mb-4 ${theme.color}`}
                >
                  {theme.label}
                </span>
                <p className="text-base text-fg-muted leading-relaxed">
                  {theme.description}
                </p>

                {/* Applied BD: paper list instead of figure */}
                {theme.papers && (
                  <ul className="mt-6 space-y-3">
                    {theme.papers.map((p) => (
                      <li key={p.title} className="flex gap-3 items-start">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500/60" />
                        <span>
                          <span className="text-sm text-fg leading-snug">{p.title}</span>
                          <span className="block text-xs font-mono text-fg-subtle mt-0.5">{p.venue}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Figure column (only for themes with a figure) */}
              {theme.figure && (
                <div className={i % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}>
                  <figure>
                    <div className="relative rounded-xl overflow-hidden border border-border bg-surface">
                      <Image
                        src={theme.figure}
                        alt={theme.alt ?? ""}
                        width={800}
                        height={500}
                        className="w-full h-auto object-contain"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <figcaption className="mt-2 text-xs font-mono text-fg-subtle">
                      {theme.figureCaption}
                    </figcaption>
                  </figure>
                </div>
              )}

              {/* Applied BD: placeholder visual on desktop (right column) */}
              {!theme.figure && (
                <div className={`hidden lg:flex items-center justify-center rounded-xl border border-border bg-surface/50 aspect-[8/5] ${i % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}`}>
                  <div className="text-center px-6">
                    <p className="text-xs font-mono tracking-widest uppercase text-fg-subtle mb-3">Papers</p>
                    <p className="text-3xl font-bold text-fg">4</p>
                    <p className="text-xs font-mono text-fg-subtle mt-1">published · 2025–2026</p>
                    <div className="mt-4 flex flex-col gap-1.5">
                      {["ICTSE 2025", "ICTSE 2026", "PECCII 2026"].map((v) => (
                        <span key={v} className="text-xs font-mono text-fg-subtle px-3 py-1 rounded-full border border-border">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
