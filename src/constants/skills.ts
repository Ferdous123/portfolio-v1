export interface SkillGroup {
  label: string;
  skills: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    label: "Optimisation & DRO",
    skills: [
      "CVaR",
      "Wasserstein DRO",
      "NSGA-II",
      "cvxpy",
      "pymoo",
    ],
  },
  {
    label: "Trustworthy ML",
    skills: [
      "Conformal Prediction",
      "Differential Privacy",
      "DP-SGD",
      "Opacus",
      "Federated Learning",
    ],
  },
  {
    label: "Inference & Stats",
    skills: [
      "Bayesian Inference",
      "Bootstrap CIs",
      "EFA",
      "ANOVA",
      "statsmodels",
      "R",
      "SPSS",
    ],
  },
  {
    label: "ML Engineering",
    skills: [
      "PyTorch",
      "scikit-learn",
      "Python",
      "NumPy",
      "pandas",
    ],
  },
  {
    label: "Research Methods",
    skills: [
      "Survey Design",
      "NVivo",
      "LaTeX",
      "Pre-registration",
      "SITL Validation",
    ],
  },
  {
    label: "Engineering",
    skills: [
      "TypeScript",
      "Next.js",
      "SQL",
      "Git",
      "PX4 SITL",
    ],
  },
];
