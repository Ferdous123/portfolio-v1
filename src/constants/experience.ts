import { type ExperienceEntry } from "@/types";

export const experiences: ExperienceEntry[] = [
  {
    role: "Research Assistant",
    company: "UCHRG Lab, AIUB",
    companyUrl: "https://www.aiub.edu",
    period: "May 2026 – Present",
    badge: "RA",
    summary:
      "Research Assistant at the Ubiquitous, Cloud & HCI Research Group under Prof. Dr. Kamruddin Md. Nur. Contributing to ongoing experimental studies in decision-making under uncertainty for autonomous systems.",
    highlights: [
      "Conducting experiments on distributionally robust optimisation for UAV route planning under real-world stochastic wind conditions.",
      "Developing physics-constrained privacy-preserving machine learning methods for federated wind-hazard estimation across UAV fleets.",
      "Working on conformal prediction guarantees for multi-objective routing, bridging the gap between theoretical coverage certificates and operational planning.",
    ],
    tags: [
      "Wasserstein DRO",
      "CVaR",
      "Conformal Prediction",
      "Federated Learning",
      "Differential Privacy",
      "PyTorch",
      "Python",
      "pymoo",
    ],
  },
  {
    role: "Research Intern",
    company: "Applied Intelligence and Informatics Lab",
    companyUrl: "https://www.nottingham.ac.uk",
    period: "Jun 2026 – Sep 2026",
    badge: "Intern",
    summary:
      "Remote research internship at the Applied Intelligence and Informatics Lab (AIIL), University of Nottingham, UK, under Dr. Md. Saef Ullah Miah. Supplied quantitative analysis and survey methodology for applied collaborative studies.",
    highlights: [
      "Co-designed survey instruments for labour-market studies of Bangladeshi RMG workers, including EFA-based scale validation and ANOVA-regression pipelines.",
      "Contributed the quantitative and data-processing side of two accepted conference papers on RMG productivity and waste classification.",
      "Reviewed and cleaned datasets for statistical analysis using Python, SPSS, and R.",
    ],
    tags: [
      "Survey Design",
      "EFA",
      "ANOVA",
      "Regression",
      "Python",
      "SPSS",
      "R",
      "NVivo",
    ],
  },
  {
    role: "Departmental Intern",
    company: "Department of Computer Science, AIUB",
    companyUrl: "https://www.aiub.edu",
    period: "2026",
    badge: "Intern",
    summary:
      "First point of contact for students on academic procedures and faculty availability. Designed and deployed the department help-desk system that now handles faculty availability, per-faculty student queues, and cross-device sync.",
    highlights: [
      "Built and deployed a Gradio-based help-desk web application for the AIUB CS department, live at ferdus/cs-dept-helpdesk on Hugging Face Spaces.",
      "Implemented a tappable faculty availability grid, per-faculty student queue, and an availability dropdown with cross-device sync.",
      "Served as first contact for students navigating academic procedures, faculty schedules, and department workflows.",
    ],
    tags: ["Gradio", "Python", "Hugging Face Spaces", "Web App", "TypeScript"],
  },
];
