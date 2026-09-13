export interface ProjectEntry {
  title: string;
  description: string;
  tags: string[];
  codeUrl?: string;
  liveUrl?: string;
  isNDA?: boolean;
  category: "research" | "tool" | "legacy";
}

export const projects: ProjectEntry[] = [
  {
    title: "TRACE",
    description:
      "Evidence-management system where every extracted claim traces back to its source passage. Under continuous development at an AI supercomputer lab. Details, code, and results are not public.",
    tags: ["Evidence Tracing", "NLP", "Research Infrastructure"],
    isNDA: true,
    category: "research",
  },
  {
    title: "WDRO-MOR",
    description:
      "Reproducibility release for Wasserstein Distributionally Robust Multi-Objective UAV Routing. Full code and dataset for the PLOS ONE manuscript.",
    tags: ["Wasserstein DRO", "CVaR", "NSGA-II", "UAV", "Python"],
    codeUrl: "https://github.com/Ferdous123/wdro-mor",
    category: "research",
  },
  {
    title: "covgap-floor",
    description:
      "Pre-registered 14-arm study confirming an exact finite-sample floor on the group coverage gap in conformal prediction. Nine datasets, public code and data.",
    tags: ["Conformal Prediction", "Fairness", "Bootstrap", "Python"],
    codeUrl: "https://github.com/Ferdous123/covgap-floor",
    category: "research",
  },
  {
    title: "LegalMind",
    description:
      "Local-GGUF-inference legal document intelligence: OCR, multi-pass extraction, hybrid retrieval, and claim-level verification firewall. Runs fully on-premise — confidential files never leave the machine.",
    tags: ["LLM", "OCR", "Hybrid Retrieval", "Privacy", "TypeScript"],
    codeUrl: "https://github.com/Ferdous123/LegalMind",
    category: "tool",
  },
  {
    title: "ProjectHarbor",
    description:
      "Research control dashboard for managing projects, notebooks, sync, and automation. TypeScript, with a focus on keeping long-running experiments observable.",
    tags: ["TypeScript", "Dashboard", "Automation", "Research Tooling"],
    codeUrl: "https://github.com/Ferdous123/ProjectHarbor",
    category: "tool",
  },
  {
    title: "CS Dept Help-Desk",
    description:
      "Gradio web app deployed for the AIUB Computer Science department. Faculty availability grid, per-faculty student queue, cross-device sync.",
    tags: ["Gradio", "Python", "Hugging Face Spaces"],
    category: "tool",
  },
  {
    title: "PX4 SITL Cross-Validation",
    description:
      "Simulation cross-check of three published UAV papers in PX4 SITL. QPAIN 2026 CVaR replanning paper reproduces at 87.4% vs 79.6% wind-bias accuracy. Vertical-profile paper: airframe model within 0.3%, energy within 2.0%, onboard planner 0.112 s.",
    tags: ["PX4 SITL", "UAV Simulation", "ArduPilot", "Validation"],
    category: "research",
  },
];

export const legacyProjects: { title: string; tech: string; note: string }[] =
  [
    { title: "SmartRent", tech: "PHP", note: "House-rent & tenant management" },
    {
      title: "Freshcart",
      tech: "PHP",
      note: "E-commerce platform",
    },
    { title: "HRMS", tech: "C#", note: "Human resource management system" },
  ];
