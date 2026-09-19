"use client";

/**
 * StoryBackground — the drone story as a whole-page background (BRIEF item 29).
 *
 * Base (SSR, no JS, or any failure): a position:fixed poster <img> behind the
 * page, dimmed by a theme-aware scrim. Never background-attachment:fixed.
 *
 * Enhancement (Tier A): a fixed full-viewport <canvas> scrubs the frame
 * sequence extracted from the owner's story video
 * (scripts/video-to-story-frames.mjs → public/story/{landscape,portrait}/NNN.webp)
 * by overall page scroll progress, lerp-smoothed, drawn only when the frame index changes,
 * rAF-throttled. Progressive loading (every 8th frame first), compressed blobs
 * kept, decoded frames in a small LRU (ImageBitmap, or <img> where
 * createImageBitmap is missing). Save-Data → every 3rd frame only.
 * It is user-driven scrubbing, so it also runs under reduced motion.
 *
 * Any error, a missing frame, or an 8 s first-frame timeout keeps the poster.
 */

import { useEffect, useRef, useState } from "react";

/** Tier B (live WebGL on top) stays off. */
export const ENABLE_LIVE_3D = false;

/** Default frame count; public/story/manifest.json overrides it. */
let FRAME_COUNT = 169;
const FIRST_FRAME_TIMEOUT_MS = 8000;
const LERP = 0.16;

/** The five story beats, mapped to ranges of overall page scroll progress. */
const BEATS: { from: number; text: string }[] = [
  { from: 0.0, text: "Every flight starts with a forecast." },
  { from: 0.2, text: "Forecasts are wrong exactly where it matters." },
  { from: 0.4, text: "Planners built for the average wind fly straight into it." },
  { from: 0.6, text: "A risk-aware planner prices the worst plausible gust, and flies past it." },
  { from: 0.85, text: "That is the problem I work on." },
];
/** Beat shown with the static poster (poster = the frame at 40%, lead aircraft entering the storm). */
const POSTER_BEAT = 2;

function beatAt(p: number): number {
  let b = 0;
  for (let i = 0; i < BEATS.length; i++) if (p >= BEATS[i].from) b = i;
  return b;
}

type Shape = "landscape" | "portrait";
type Decoded = ImageBitmap | HTMLImageElement;

function frameUrl(shape: Shape, i: number) {
  return `/story/${shape}/${String(i).padStart(3, "0")}.webp`;
}

export default function StoryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chipRef = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let failed = false;
    const cleanups: (() => void)[] = [];

    const fail = () => {
      failed = true;
      if (disposed) return;
      setReady(false);
      if (chipRef.current) chipRef.current.textContent = BEATS[POSTER_BEAT].text;
    };

    try {
      const ctx = canvas.getContext("2d");
      if (!ctx || typeof window.fetch !== "function" || typeof window.requestAnimationFrame !== "function") return;

      const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      const step = conn && conn.saveData ? 3 : 1;
      const hasBitmap = typeof window.createImageBitmap === "function";
      const LRU_MAX = window.innerWidth < 768 ? 14 : 24;

      let shape: Shape = window.innerWidth / Math.max(1, window.innerHeight) < 1 ? "portrait" : "landscape";
      let generation = 0;
      const blobs = new Map<number, Blob>();
      const decoded = new Map<number, Decoded>(); // insertion order = LRU order
      const decoding = new Set<number>();
      const objectUrls = new Map<number, string>();
      const ac = typeof AbortController === "function" ? new AbortController() : null;
      const signal = ac ? ac.signal : undefined;

      // Scroll state
      let docMax = 1;
      let target = 0;
      let current = 0;
      let drawn = -1;
      let wanted = 0;
      let rafId = 0;
      let beat = -1;
      let firstDrawn = false;

      const available = (i: number) => i - (i % step);

      const measure = () => {
        docMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      };
      const readTarget = () => {
        target = Math.min(1, Math.max(0, (window.pageYOffset || document.documentElement.scrollTop) / docMax));
      };

      const evict = () => {
        while (decoded.size > LRU_MAX) {
          const oldest = decoded.keys().next().value as number;
          if (oldest === drawn) {
            // keep the frame on screen; move it to the fresh end
            const d = decoded.get(oldest)!;
            decoded.delete(oldest);
            decoded.set(oldest, d);
            if (decoded.size <= LRU_MAX + 1) break;
            continue;
          }
          const d = decoded.get(oldest);
          decoded.delete(oldest);
          if (d && "close" in d && typeof d.close === "function") d.close();
          const u = objectUrls.get(oldest);
          if (u) { URL.revokeObjectURL(u); objectUrls.delete(oldest); }
        }
      };

      const touch = (i: number) => {
        const d = decoded.get(i);
        if (d) { decoded.delete(i); decoded.set(i, d); }
        return d;
      };

      const decode = (i: number, gen: number): Promise<Decoded | null> => {
        const blob = blobs.get(i);
        if (!blob || decoding.has(i)) return Promise.resolve(null);
        decoding.add(i);
        const done = (d: Decoded | null) => {
          decoding.delete(i);
          if (!d || gen !== generation || disposed) return null;
          decoded.set(i, d);
          evict();
          return d;
        };
        if (hasBitmap) {
          return window.createImageBitmap(blob).then(done, () => { decoding.delete(i); return null; });
        }
        return new Promise<Decoded | null>((resolve) => {
          const url = URL.createObjectURL(blob);
          objectUrls.set(i, url);
          const img = new Image();
          img.onload = () => resolve(done(img));
          img.onerror = () => { decoding.delete(i); resolve(null); };
          img.src = url;
        });
      };

      const nearestDecoded = (i: number): number => {
        let best = -1, bestD = Infinity;
        decoded.forEach((_, k) => {
          const d = Math.abs(k - i);
          if (d < bestD) { bestD = d; best = k; }
        });
        return best;
      };

      const sizeCanvas = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
        const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          drawn = -1; // resizing clears the bitmap
        }
      };

      const paint = (i: number) => {
        const img = touch(i);
        if (!img) return false;
        const iw = img.width, ih = img.height;
        const cw = canvas.width, ch = canvas.height;
        const s = Math.max(cw / iw, ch / ih);
        const dw = iw * s, dh = ih * s;
        ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
        drawn = i;
        canvas.setAttribute("data-frame", String(i)); // cheap hook for tests
        if (!firstDrawn) { firstDrawn = true; setReady(true); updateChip(current); }
        return true;
      };

      const updateChip = (p: number) => {
        if (!firstDrawn) return; // the poster keeps its own beat
        const b = beatAt(p);
        if (b !== beat && chipRef.current) {
          beat = b;
          chipRef.current.textContent = BEATS[b].text;
        }
      };

      const tick = () => {
        rafId = 0;
        if (disposed || failed) return;
        current += (target - current) * LERP;
        if (Math.abs(target - current) < 0.0005) current = target;
        updateChip(current);
        wanted = available(Math.round(current * (FRAME_COUNT - 1)));
        if (wanted !== drawn) {
          if (decoded.has(wanted)) {
            paint(wanted);
          } else {
            const gen = generation;
            const want = wanted;
            decode(want, gen).then((d) => {
              if (d && want === wanted && !disposed && !failed) paint(want);
            });
            const near = nearestDecoded(wanted);
            if (near >= 0 && near !== drawn) paint(near);
          }
        }
        if (current !== target) rafId = window.requestAnimationFrame(tick);
      };
      const kick = () => { if (!rafId && !disposed && !failed) rafId = window.requestAnimationFrame(tick); };

      // Progressive loader: every 8th frame first, then the rest; 4 in flight.
      const load = (gen: number, sh: Shape) => {
        const order: number[] = [];
        for (let i = 0; i < FRAME_COUNT; i += 8) if (i % step === 0) order.push(i);
        for (let i = 0; i < FRAME_COUNT; i += step) if (i % 8 !== 0) order.push(i);
        // Start near where the reader is.
        const start = available(Math.round(target * (FRAME_COUNT - 1)));
        order.sort((a, b) => {
          const ka = a % 8 === 0 ? 0 : 1, kb = b % 8 === 0 ? 0 : 1;
          return ka !== kb ? ka - kb : Math.abs(a - start) - Math.abs(b - start);
        });
        let next = 0;
        const worker = (): Promise<void> => {
          if (disposed || failed || gen !== generation || next >= order.length) return Promise.resolve();
          const i = order[next++];
          return fetch(frameUrl(sh, i), { signal })
            .then((r) => { if (!r.ok) throw new Error(`frame ${i} ${r.status}`); return r.blob(); })
            .then((b) => {
              if (gen !== generation) return;
              blobs.set(i, b);
              if (!firstDrawn || Math.abs(i - wanted) <= 8) {
                return decode(i, gen).then(() => { kick(); });
              }
            })
            .then(worker);
        };
        return Promise.all([worker(), worker(), worker(), worker()]);
      };

      const begin = () => {
        generation++;
        const gen = generation;
        blobs.clear();
        decoded.forEach((d) => { if ("close" in d && typeof d.close === "function") d.close(); });
        decoded.clear();
        objectUrls.forEach((u) => URL.revokeObjectURL(u));
        objectUrls.clear();
        drawn = -1;
        load(gen, shape).catch(() => { if (gen === generation && !disposed && !(signal && signal.aborted)) fail(); });
      };

      const timer = window.setTimeout(() => { if (!firstDrawn) fail(); }, FIRST_FRAME_TIMEOUT_MS);
      cleanups.push(() => window.clearTimeout(timer));

      // Leaving the page: stop network work quietly (no errors on navigation).
      const onHide = () => { if (ac) ac.abort(); };
      window.addEventListener("pagehide", onHide);
      cleanups.push(() => { window.removeEventListener("pagehide", onHide); if (ac) ac.abort(); });

      const onScroll = () => { readTarget(); kick(); };
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", onScroll));

      const onResize = () => {
        measure();
        readTarget();
        sizeCanvas();
        const nextShape: Shape = window.innerWidth / Math.max(1, window.innerHeight) < 1 ? "portrait" : "landscape";
        if (nextShape !== shape) { shape = nextShape; begin(); }
        kick();
      };
      if (typeof ResizeObserver === "function") {
        // Observing the canvas (100lvh) instead of window resize means the iOS
        // toolbar showing/hiding does not resize or redraw anything.
        const ro = new ResizeObserver(onResize);
        ro.observe(canvas);
        const ro2 = new ResizeObserver(() => { measure(); readTarget(); kick(); });
        ro2.observe(document.body);
        cleanups.push(() => { ro.disconnect(); ro2.disconnect(); });
      } else {
        window.addEventListener("resize", onResize);
        cleanups.push(() => window.removeEventListener("resize", onResize));
      }

      measure();
      readTarget();
      current = target;
      sizeCanvas();
      fetch("/story/manifest.json", { signal })
        .then((r) => (r.ok ? r.json() : null))
        .then((m) => { if (m && m.frames > 1 && m.frames < 2000) FRAME_COUNT = m.frames | 0; })
        .catch(() => { /* keep the default */ })
        .then(() => { if (!disposed && !failed) { begin(); kick(); } });

      cleanups.push(() => {
        if (rafId) window.cancelAnimationFrame(rafId);
        decoded.forEach((d) => { if ("close" in d && typeof d.close === "function") d.close(); });
        objectUrls.forEach((u) => URL.revokeObjectURL(u));
      });
    } catch {
      fail();
    }

    return () => {
      disposed = true;
      cleanups.forEach((c) => { try { c(); } catch { /* ignore */ } });
    };
  }, []);

  return (
    <>
      <div className="story-bg" aria-hidden="true">
        <picture>
          <source media="(max-aspect-ratio: 1/1)" type="image/webp" srcSet="/story/poster-portrait.webp" />
          <source media="(max-aspect-ratio: 1/1)" srcSet="/story/poster-portrait.jpg" />
          <source type="image/webp" srcSet="/story/poster-landscape.webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="story-bg__poster" src="/story/poster-landscape.jpg" alt="" decoding="async" />
        </picture>
        <canvas ref={canvasRef} className={ready ? "story-bg__canvas is-ready" : "story-bg__canvas"} />
        <div className="story-bg__scrim" />
      </div>
    </>
  );
}
