"use client";
import { useState, useEffect } from "react";

const DOMAINS = [
  "Decision-Making Under Uncertainty",
  "Autonomous UAV Systems",
  "Trustworthy AI",
  "Privacy-Preserving Machine Learning",
];

const TYPE_SPEED = 55;   // ms per char
const DELETE_SPEED = 28; // ms per char
const PAUSE_AFTER = 1800; // ms after full word
const PAUSE_BEFORE = 300; // ms before starting delete

export function useTypingAnimation(enabled: boolean) {
  // Always initialise with the first domain so SSR (and no-JS) renders the full
  // text rather than an empty string. When animated, the state starts in "pause"
  // so it holds DOMAINS[0] briefly, then deletes and types the next domain.
  const [displayed, setDisplayed] = useState(DOMAINS[0]);
  const [domainIndex, setDomainIndex] = useState(0);
  const [phase, setPhase] = useState<"type" | "pause" | "delete" | "wait">(
    enabled ? "pause" : "type"
  );

  useEffect(() => {
    if (!enabled) return;

    const target = DOMAINS[domainIndex];

    if (phase === "type") {
      if (displayed.length < target.length) {
        const t = setTimeout(() => {
          setDisplayed(target.slice(0, displayed.length + 1));
        }, TYPE_SPEED);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase("pause"), PAUSE_AFTER);
        return () => clearTimeout(t);
      }
    }

    if (phase === "pause") {
      const t = setTimeout(() => setPhase("delete"), PAUSE_BEFORE);
      return () => clearTimeout(t);
    }

    if (phase === "delete") {
      if (displayed.length > 0) {
        const t = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1));
        }, DELETE_SPEED);
        return () => clearTimeout(t);
      } else {
        setDomainIndex((i) => (i + 1) % DOMAINS.length);
        setPhase("type");
      }
    }
  }, [displayed, phase, domainIndex, enabled]);

  return { displayed, domains: DOMAINS };
}
