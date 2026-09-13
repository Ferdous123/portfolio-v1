export type PublicationStatus = "published" | "accepted" | "inprep";
export type PublicationTheme = "uav-robust" | "trustworthy-ml" | "applied-bd";

export interface Publication {
  title: string;
  venue: string;
  date: string;
  /** ISO date string for sorting / charting */
  dateISO: string;
  status: PublicationStatus;
  /** True = first author */
  firstAuthor: boolean;
  /** True = corresponding author */
  corresponding: boolean;
  theme: PublicationTheme;
  codeUrl?: string;
  /** For in-prep: target venue label */
  targetVenue?: string;
}

export const publications: Publication[] = [
  // --- Published ---
  {
    title: "Risk-Aware Drone Routing with Stochastic Wind Fields",
    venue: "IEEE ICCIT 2025 (Scopus)",
    date: "Dec 2025",
    dateISO: "2025-12-01",
    status: "published",
    firstAuthor: true,
    corresponding: true,
    theme: "uav-robust",
  },
  {
    title: "Bayesian Wind Forecast Correction for Real-Time CVaR-Based UAV Replanning",
    venue: "IEEE QPAIN 2026 (Scopus)",
    date: "Apr 2026",
    dateISO: "2026-04-01",
    status: "published",
    firstAuthor: true,
    corresponding: true,
    theme: "uav-robust",
  },
  {
    title: "Vertical Wind-Profile Driven 3D UAV Routing with CVaR-Based Altitude Optimization",
    venue: "IEEE QPAIN 2026 (Scopus)",
    date: "Apr 2026",
    dateISO: "2026-04-01",
    status: "published",
    firstAuthor: true,
    corresponding: true,
    theme: "uav-robust",
  },
  {
    title: "Environmental Challenges of Textile Wastewater in Bangladesh",
    venue: "ICTSE 2025, BUTEX",
    date: "May 2025",
    dateISO: "2025-05-01",
    status: "published",
    firstAuthor: true,
    corresponding: false,
    theme: "applied-bd",
  },
  {
    title: "Determinants of Pay Satisfaction and Working Conditions Among Bangladeshi RMG Workers",
    venue: "ICTSE 2026, BUTEX",
    date: "Jun 2026",
    dateISO: "2026-06-01",
    status: "published",
    firstAuthor: false,
    corresponding: true,
    theme: "applied-bd",
  },
  {
    title: "Incentive Pay, Style Disruptions, and Overtime: Statistical Determinants of Productivity in Bangladeshi RMG",
    venue: "ICTSE 2026, BUTEX",
    date: "Jun 2026",
    dateISO: "2026-06-01",
    status: "published",
    firstAuthor: false,
    corresponding: false,
    theme: "applied-bd",
  },
  {
    title: "Intelligent Waste Classification for Urban Bangladesh: A MobileNetV3 Approach",
    venue: "PECCII 2026, PUST",
    date: "Jun 2026",
    dateISO: "2026-06-01",
    status: "published",
    firstAuthor: false,
    corresponding: true,
    theme: "applied-bd",
  },
  // --- Accepted ---
  {
    title: "Disease-Specific vs. Cross-Disease Clusters in PubMed: A Six-Embedding Benchmark at Scale",
    venue: "ICCA 2026",
    date: "Aug 2026",
    dateISO: "2026-08-01",
    status: "accepted",
    firstAuthor: true,
    corresponding: true,
    theme: "trustworthy-ml",
  },
  {
    title: "DP-SGD Noise Direction Does Not Shape the Last-Layer Laplace Posterior",
    venue: "ICCA 2026",
    date: "Aug 2026",
    dateISO: "2026-08-01",
    status: "accepted",
    firstAuthor: true,
    corresponding: true,
    theme: "trustworthy-ml",
  },
  // --- In preparation ---
  {
    title: "Wasserstein Distributionally Robust Multi-Objective UAV Routing",
    venue: "",
    date: "2026",
    dateISO: "2026-09-01",
    status: "inprep",
    firstAuthor: true,
    corresponding: true,
    theme: "uav-robust",
    targetVenue: "PLOS ONE",
    codeUrl: "https://github.com/Ferdous123/wdro-mor",
  },
  {
    title: "Physics-Constrained Differentially Private Federated Learning for Byzantine-Resilient Wind Hazard Estimation Across UAV Fleets",
    venue: "",
    date: "2026",
    dateISO: "2026-09-01",
    status: "inprep",
    firstAuthor: true,
    corresponding: true,
    theme: "trustworthy-ml",
    targetVenue: "Engineering Applications of Artificial Intelligence (Elsevier)",
  },
  {
    title: "Conformal Pareto Certificates: Distribution-Free Finite-Sample Guarantees for Multi-Objective UAV Routing",
    venue: "",
    date: "2026",
    dateISO: "2026-09-01",
    status: "inprep",
    firstAuthor: true,
    corresponding: true,
    theme: "uav-robust",
    targetVenue: "IEEE Access",
  },
  {
    title: "The Group Coverage Gap Has an Exact Finite-Sample Floor: A Pre-Registered Study of Conformal Fairness Interventions on Standard Benchmarks",
    venue: "",
    date: "2026",
    dateISO: "2026-09-01",
    status: "inprep",
    firstAuthor: true,
    corresponding: true,
    theme: "trustworthy-ml",
    targetVenue: "IEEE Access",
    codeUrl: "https://github.com/Ferdous123/covgap-floor",
  },
  {
    title: "Limits of Bootstrap-Based Uncertainty Decomposition for Fair Conformal Prediction: An Empirical Study",
    venue: "",
    date: "2026",
    dateISO: "2026-09-01",
    status: "inprep",
    firstAuthor: true,
    corresponding: true,
    theme: "trustworthy-ml",
    targetVenue: "AJSE",
  },
];

// Derived counts — computed from data, never hardcoded
export const pubStats = {
  get total() {
    return publications.filter(
      (p) => p.status === "published" || p.status === "accepted"
    ).length;
  },
  get firstAuthor() {
    return publications.filter(
      (p) =>
        p.firstAuthor &&
        (p.status === "published" || p.status === "accepted")
    ).length;
  },
  get corresponding() {
    return publications.filter(
      (p) =>
        p.corresponding &&
        (p.status === "published" || p.status === "accepted")
    ).length;
  },
  get inPrep() {
    return publications.filter((p) => p.status === "inprep").length;
  },
};
