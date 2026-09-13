import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t border-border px-6 lg:px-[8%] py-10">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="text-sm font-semibold text-fg">Ferdus Hossain</p>
          <a
            href="mailto:ferdus.h.r362@gmail.com"
            className="text-xs font-mono text-fg-subtle mt-1 hover:text-fg transition-colors"
          >
            ferdus.h.r362@gmail.com
          </a>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://github.com/Ferdous123"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-fg-subtle hover:text-fg transition-colors"
          >
            <FaGithub size={18} />
          </a>
          <a
            href="https://www.linkedin.com/in/ferdous-hossain-199782374/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-fg-subtle hover:text-fg transition-colors"
          >
            <FaLinkedin size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
