"use client";

/**
 * ScrollStory3DLoader — progressive-enhancement wrapper.
 *
 * Phase 1 base (always): StoryPoster SSR-rendered — readable with JS off,
 * WebGL off, any browser.
 *
 * Phase 2 enhancement (client only): live WebGL scene. Gates:
 *  - LazyScene dynamic import must resolve.
 *  - Canvas.onCreated must fire within 8 s.
 *  - ErrorBoundary catches any runtime error.
 *  - Timeout / error / no-WebGL → silently stays on StoryPoster.
 *
 * Hydration note: "use client" components ARE server-rendered in Next.js
 * App Router, so StoryPoster appears in the initial HTML even without JS.
 */

import dynamic from "next/dynamic";
import { useEffect, useState, useRef, useCallback } from "react";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import StoryPoster from "@/components/features/StoryPoster";

// Lazy-load the heavy 3D scene — browser-only APIs, never SSR.
const ENABLE_LIVE_3D = false;

const LazyScene = dynamic(
  () => import("@/components/features/ScrollStory3D"),
  {
    ssr: false,
    // While the JS chunk loads, render nothing (hidden div, so layout is fine).
    loading: () => null,
  }
);

const TIMEOUT_MS = 8000;

export default function ScrollStory3DLoader() {
  /**
   * Three-state machine:
   *   "poster"   — server initial; client pre-enhancement
   *   "trying"   — mounted, timer running, LazyScene initialising in hidden div
   *   "enhanced" — Canvas.onCreated fired ✓, show full 3D scene
   *   "failed"   — timeout or error → show poster forever
   */
  const [status, setStatus] = useState<"poster" | "trying" | "enhanced" | "failed">("poster");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Live 3D stays off until the Phase 2/3 realistic story replaces the old scene.
    if (!ENABLE_LIVE_3D) return;
    // Switch to "trying" only on the client (useEffect never runs server-side).
    setStatus("trying");
    timerRef.current = setTimeout(() => setStatus("failed"), TIMEOUT_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleReady = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("enhanced");
  }, []);

  const handleError = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("failed");
  }, []);

  // ── Static baseline (server render + fallback states) ─────────────────────
  if (status === "poster" || status === "failed") {
    return <StoryPoster />;
  }

  // ── Enhancement live ───────────────────────────────────────────────────────
  if (status === "enhanced") {
    return (
      <ErrorBoundary fallback={<StoryPoster />} onError={handleError}>
        <LazyScene onReady={handleReady} />
      </ErrorBoundary>
    );
  }

  // ── Trying: show poster + LazyScene initialising in a zero-layout div ─────
  // The hidden div is aria-hidden so assistive tech skips it.
  // display:none prevents layout contribution — no height, no paint.
  // Once LazyScene's Canvas.onCreated fires, handleReady → "enhanced".
  return (
    <>
      <StoryPoster />
      <div style={{ display: "none" }} aria-hidden>
        <ErrorBoundary fallback={null} onError={handleError}>
          <LazyScene onReady={handleReady} />
        </ErrorBoundary>
      </div>
    </>
  );
}
