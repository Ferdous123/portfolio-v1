import { FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="border-t border-border px-6 lg:px-[8%] py-10 scroll-mt-20"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="text-sm font-semibold text-fg">Ferdus Hossain</p>
          <a
            href="mailto:ferdus.h.r362@gmail.com"
            className="text-xs font-mono text-fg-subtle mt-1 block hover:text-fg transition-colors"
          >
            ferdus.h.r362@gmail.com
          </a>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="/about"
            className="text-xs font-mono tracking-widest uppercase text-fg-subtle hover:text-fg transition-colors"
          >
            About
          </a>
          <a
            href="https://github.com/Ferdous123"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
            className="text-fg-subtle hover:text-fg transition-colors"
          >
            <FaGithub size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
