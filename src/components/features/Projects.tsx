import { Reveal } from "@/components/ui/Reveal";
import { projects, legacyProjects, type ProjectEntry } from "@/constants/projects";

function ProjectCard({ project }: { project: ProjectEntry }) {
  return (
    <div className="p-6 rounded-xl border border-border bg-surface hover:bg-surface-raised transition-colors duration-200 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-fg leading-snug">
          {project.title}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          {project.isNDA && (
            <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full border border-amber-500/40 text-amber-400 bg-amber-500/10">
              NDA
            </span>
          )}
          {project.codeUrl && (
            <a
              href={project.codeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-fg-subtle hover:text-accent transition-colors"
              aria-label={`Code for ${project.title}`}
            >
              Code →
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-fg-subtle hover:text-accent transition-colors"
              aria-label={`Live demo for ${project.title}`}
            >
              Live →
            </a>
          )}
        </div>
      </div>

      <p className="text-sm text-fg-muted leading-relaxed flex-1">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-mono px-2 py-0.5 rounded-md bg-surface-subtle text-fg-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Projects() {
  return (
    <section
      id="projects"
      className="w-full px-6 lg:px-[8%] py-24 scroll-mt-20 border-t border-border"
    >
      <Reveal className="max-w-5xl mx-auto">
        <p className="text-xs font-mono tracking-widest uppercase text-fg-muted mb-2">
          Projects & Code
        </p>
        <h2 className="text-4xl sm:text-5xl font-bold text-fg tracking-tight mb-16">
          Selected Work
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {projects.map((p) => (
            <ProjectCard key={p.title} project={p} />
          ))}
        </div>

        {/* Legacy engineering strip */}
        <div>
          <p className="text-xs font-mono tracking-widest uppercase text-fg-subtle mb-5">
            Earlier Engineering
          </p>
          <div className="flex flex-wrap gap-3">
            {legacyProjects.map((p) => (
              <div
                key={p.title}
                className="px-4 py-2.5 rounded-lg border border-border bg-surface text-sm text-fg-muted"
              >
                <span className="font-medium text-fg">{p.title}</span>
                <span className="mx-2 text-fg-subtle">·</span>
                <span className="font-mono text-xs text-fg-subtle">{p.tech}</span>
                <span className="mx-2 text-fg-subtle">·</span>
                <span className="text-xs text-fg-subtle">{p.note}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
