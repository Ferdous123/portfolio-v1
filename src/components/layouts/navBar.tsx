"use client";

import { FaMoon, FaSun } from "react-icons/fa";
import { HiMenuAlt3 } from "react-icons/hi";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { navLinks } from "@/constants/navigation";
import { useTheme } from "@/hooks/useTheme";
import { useScrolled } from "@/hooks/useScrolled";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

// Scroll-spy: returns the currently visible section id (home page only)
function useActiveSection(enabled: boolean): string {
  const [active, setActive] = useState("");
  useEffect(() => {
    if (!enabled) return;
    const sectionIds = navLinks
      .filter((l) => l.href.startsWith("/#"))
      .map((l) => l.href.slice(2));

    const observers: IntersectionObserver[] = [];
    const visibleMap: Record<string, number> = {};

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          visibleMap[id] = entry.isIntersecting ? entry.intersectionRatio : 0;
          const best = Object.entries(visibleMap).sort((a, b) => b[1] - a[1])[0];
          if (best && best[1] > 0) setActive(best[0]);
        },
        { threshold: [0, 0.1, 0.3], rootMargin: "-80px 0px -20% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [enabled]);
  return active;
}

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const { isDarkMode, toggleDark, mounted } = useTheme();
  const isScrolled = useScrolled();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAbout = pathname === "/about";

  const activeSection = useActiveSection(isHome);

  // Determine active nav item
  const getIsActive = (href: string) => {
    if (href === "/about") return isAbout;
    if (href.startsWith("/#") && isHome) {
      const id = href.slice(2);
      return activeSection === id;
    }
    return false;
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-[8%] py-5 transition-all duration-500 ${
          isScrolled
            ? "bg-canvas/85 backdrop-blur-xl border-b border-border/60"
            : ""
        }`}
      >
        <Link
          href="/"
          className="text-sm font-semibold tracking-widest uppercase text-fg hover:text-accent transition-colors duration-200"
        >
          Ferdus
        </Link>

        <ul className="hidden md:flex items-center gap-10">
          {navLinks.map(({ label, href }) => {
            const active = getIsActive(href);
            return (
              <li
                key={href}
                className="relative"
                onMouseEnter={() => setHoveredLink(href)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <Link
                  href={href}
                  className={`text-xs font-medium tracking-widest uppercase transition-colors duration-200 ${
                    active ? "text-fg" : "text-fg-muted hover:text-fg"
                  }`}
                >
                  {label}
                  {hoveredLink === href && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute left-0 right-0 -bottom-1.5 h-px bg-accent"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  {active && hoveredLink !== href && (
                    <span className="absolute left-0 right-0 -bottom-1.5 h-px bg-accent/60" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleDark}
            aria-label={
              mounted
                ? isDarkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
                : "Toggle theme"
            }
            className="flex h-8 w-8 items-center justify-center text-fg-muted hover:text-fg transition-colors"
          >
            {mounted ? (
              isDarkMode ? (
                <FaSun size={14} />
              ) : (
                <FaMoon size={14} />
              )
            ) : (
              <span className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden flex h-8 w-8 items-center justify-center text-fg-secondary"
            aria-label="Open menu"
          >
            <HiMenuAlt3 size={20} />
          </button>
        </div>
      </nav>

      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent
          aria-describedby={undefined}
          className="w-72 data-[side=right]:w-72 sm:max-w-72 data-[side=right]:sm:max-w-72 bg-canvas flex flex-col py-16 px-8 gap-2 border-l border-border"
        >
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <p className="text-xs font-mono tracking-widest text-fg-muted uppercase mb-6">
            Navigation
          </p>
          {navLinks.map(({ label, href }) => {
            const active = getIsActive(href);
            return (
              <SheetClose key={href} asChild>
                <Link
                  href={href}
                  className={`py-2 text-sm font-medium border-b border-border transition-colors ${
                    active ? "text-fg" : "text-fg-secondary hover:text-fg"
                  }`}
                >
                  {label}
                </Link>
              </SheetClose>
            );
          })}
        </SheetContent>
      </Sheet>
    </>
  );
}
