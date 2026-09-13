import { Reveal } from "@/components/ui/Reveal";

const honors = [
  {
    title: "Dean's List Award",
    org: "Faculty of Science & Technology, AIUB",
    detail: "Six semesters: Fall 2023-24 through Spring 2025-26",
  },
  {
    title: "Magna Cum Laude",
    org: "AIUB",
    detail: "Anticipated at 2028 convocation",
  },
];

const education = [
  {
    degree: "B.Sc. in Computer Science & Engineering",
    major: "Major: Information Systems",
    institution: "American International University-Bangladesh (AIUB)",
    location: "Dhaka",
    gpa: "CGPA 3.91 / 4.00",
    year: "2026",
  },
  {
    degree: "HSC Science",
    major: "",
    institution: "Dr. Mahbubur Rahman Mollah College",
    location: "",
    gpa: "GPA 5.00 / 5.00",
    year: "2021",
  },
  {
    degree: "SSC Science",
    major: "",
    institution: "Ideal School & College, Motijheel, Dhaka",
    location: "",
    gpa: "GPA 4.94 / 5.00",
    year: "2019",
  },
];

const skillGroups = [
  {
    label: "Optimisation & DRO",
    skills: ["CVaR", "Wasserstein DRO", "NSGA-II", "cvxpy", "pymoo"],
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
    skills: ["PyTorch", "scikit-learn", "Python", "NumPy", "pandas"],
  },
  {
    label: "Research Methods",
    skills: ["Survey Design", "NVivo", "LaTeX", "Pre-registration", "SITL"],
  },
  {
    label: "Engineering",
    skills: ["TypeScript", "Next.js", "SQL", "Git", "PX4 SITL"],
  },
];

export default function HonorsEducation() {
  return (
    <section
      id="honors"
      className="w-full px-6 lg:px-[8%] py-24 scroll-mt-20 border-t border-border"
    >
      <Reveal className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-16">
          {/* Education */}
          <div className="lg:col-span-2">
            <p className="text-xs font-mono tracking-widest uppercase text-fg-muted mb-2">
              Education
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-fg tracking-tight mb-12">
              Background
            </h2>

            <div className="space-y-0">
              {education.map((ed, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_auto] gap-4 py-6 border-t border-border first:border-t-0 first:pt-0"
                >
                  <div>
                    <p className="text-base font-semibold text-fg leading-snug">
                      {ed.degree}
                      {ed.major && (
                        <span className="text-fg-muted font-normal"> — {ed.major}</span>
                      )}
                    </p>
                    <p className="text-sm text-fg-muted mt-1">{ed.institution}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono text-fg-subtle">{ed.year}</p>
                    <p className="text-xs font-mono text-accent mt-1">{ed.gpa}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="mt-12">
              <p className="text-xs font-mono tracking-widest uppercase text-fg-muted mb-8">
                Methods & Tools
              </p>
              <div className="grid grid-cols-2 gap-0 border-l border-t border-border rounded-xl overflow-hidden">
                {skillGroups.map(({ label, skills }) => (
                  <div key={label} className="p-5 border-r border-b border-border">
                    <p className="text-xs font-mono tracking-widest uppercase text-fg-subtle mb-3">
                      {label}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s) => (
                        <span
                          key={s}
                          className="text-xs font-mono px-2 py-0.5 rounded-md bg-surface-subtle text-fg-muted"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Honors */}
          <div>
            <p className="text-xs font-mono tracking-widest uppercase text-fg-muted mb-2">
              Honors
            </p>
            <h2 className="text-4xl font-bold text-fg tracking-tight mb-12">
              Awards
            </h2>

            <div className="space-y-6">
              {honors.map((h, i) => (
                <div key={i} className="border-l-2 border-accent pl-5">
                  <p className="text-base font-semibold text-fg">{h.title}</p>
                  <p className="text-sm text-fg-muted mt-0.5">{h.org}</p>
                  <p className="text-xs font-mono text-fg-subtle mt-1">{h.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
