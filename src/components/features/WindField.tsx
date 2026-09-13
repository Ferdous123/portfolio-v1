"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Wind-field canvas: streaming particles advect along the field,
 * a drone marker moves along the planned route, a gust appears and
 * the route smoothly replans (original ghosted as dashed line).
 * Pauses when off-screen (IntersectionObserver).
 * Under prefers-reduced-motion: renders one static frame only.
 */
export default function WindField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let visible = true;

    // IntersectionObserver — pause when offscreen
    const io = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting; },
      { threshold: 0.1 }
    );
    io.observe(container);

    // DPR-aware sizing
    function resize() {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      const W = container!.clientWidth;
      const H = container!.clientHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = W + "px";
      canvas!.style.height = H + "px";
      ctx!.scale(dpr, dpr);
      return { W, H };
    }
    let { W, H } = resize();

    // ---- Wind field ----
    const GUST_EMERGE_T = 3.5;   // seconds: gust appears
    const REPLAN_T      = 5.0;   // seconds: replanned route starts drawing
    const CYCLE         = 10.0;  // seconds: total loop

    function gustIntensity(t: number): number {
      const phase = t % CYCLE;
      if (phase < GUST_EMERGE_T) return 0;
      if (phase < REPLAN_T) return Math.min(1, (phase - GUST_EMERGE_T) / 0.8);
      if (phase < CYCLE - 1) return 1;
      return Math.max(0, 1 - (phase - (CYCLE - 1)));
    }

    function windAt(x: number, y: number, t: number): { u: number; v: number } {
      const gustX = W * 0.52;
      const gustY = H * 0.42;
      const dx = x - gustX;
      const dy = y - gustY;
      const dist = Math.sqrt(dx * dx + dy * dy) + 1;
      const gi = gustIntensity(t);
      const pulse = gi * 48 * Math.exp(-dist / (W * 0.18));

      const baseU = 14 + 6 * Math.sin((y / H) * Math.PI);
      const baseV =  4 * Math.cos((x / W) * Math.PI * 1.2);
      return {
        u: baseU + (dx / dist) * pulse,
        v: baseV + (dy / dist) * pulse * 0.5,
      };
    }

    // ---- Particles ----
    const N_PARTICLES = 80;
    interface Particle { x: number; y: number; age: number; life: number }
    const particles: Particle[] = Array.from({ length: N_PARTICLES }, () => ({
      x: Math.random() * (W > 0 ? W : 600),
      y: Math.random() * (H > 0 ? H : 400),
      age: Math.random() * 120,
      life: 80 + Math.random() * 80,
    }));

    // ---- Routes ----
    function makeRoutes(w: number, h: number) {
      return {
        base: [
          { x: w * 0.06, y: h * 0.76 },
          { x: w * 0.22, y: h * 0.55 },
          { x: w * 0.38, y: h * 0.43 },
          { x: w * 0.52, y: h * 0.40 }, // near gust
          { x: w * 0.70, y: h * 0.33 },
          { x: w * 0.90, y: h * 0.24 },
        ],
        alt: [
          { x: w * 0.06, y: h * 0.76 },
          { x: w * 0.22, y: h * 0.55 },
          { x: w * 0.35, y: h * 0.65 },
          { x: w * 0.54, y: h * 0.72 },
          { x: w * 0.72, y: h * 0.48 },
          { x: w * 0.90, y: h * 0.24 },
        ],
      };
    }
    let routes = makeRoutes(W, H);

    // ---- Drone position along a route ----
    function dronePos(waypoints: { x: number; y: number }[], progress: number) {
      const segs = waypoints.length - 1;
      const drawn = Math.min(progress * segs, segs - 0.001);
      const seg = Math.floor(drawn);
      const p = drawn - seg;
      return {
        x: waypoints[seg].x + (waypoints[seg + 1].x - waypoints[seg].x) * p,
        y: waypoints[seg].y + (waypoints[seg + 1].y - waypoints[seg].y) * p,
      };
    }

    // ---- Draw helpers ----
    function drawRoute(
      waypoints: { x: number; y: number }[],
      progress: number,
      color: string,
      alpha: number,
      dashed: boolean
    ) {
      if (!ctx || alpha < 0.01 || progress <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      if (dashed) ctx.setLineDash([7, 5]);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      const segs = waypoints.length - 1;
      const total = progress * segs;
      const full = Math.floor(total);
      const part = total - full;
      ctx.moveTo(waypoints[0].x, waypoints[0].y);
      for (let i = 0; i < Math.min(full, segs); i++) {
        ctx.lineTo(waypoints[i + 1].x, waypoints[i + 1].y);
      }
      if (full < segs) {
        const a = waypoints[full];
        const b = waypoints[full + 1];
        ctx.lineTo(a.x + (b.x - a.x) * part, a.y + (b.y - a.y) * part);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    function drawDrone(x: number, y: number, color: string, alpha: number) {
      if (!ctx || alpha < 0.05) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      // outer glow
      const g = ctx.createRadialGradient(x, y, 0, x, y, 10);
      g.addColorStop(0, color + "88");
      g.addColorStop(1, color + "00");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
      // solid dot
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawGust(t: number, isDark: boolean) {
      if (!ctx) return;
      const gi = gustIntensity(t);
      if (gi < 0.01) return;
      const gustX = W * 0.52;
      const gustY = H * 0.42;
      const r = W * 0.13;
      const grad = ctx.createRadialGradient(gustX, gustY, 0, gustX, gustY, r);
      const c = isDark ? `255,80,60` : `220,38,38`;
      grad.addColorStop(0, `rgba(${c},${0.22 * gi})`);
      grad.addColorStop(1, `rgba(${c},0)`);
      ctx.save();
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(gustX, gustY, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ---- Legend ----
    function drawLegend(isDark: boolean) {
      if (!ctx) return;
      const items: { color: string; label: string; dashed?: boolean }[] = [
        { color: isDark ? "#67e8f9" : "#0891b2", label: "Original route" },
        { color: isDark ? "#86efac" : "#16a34a", label: "Replanned (CVaR)", dashed: false },
        { color: isDark ? "#f87171" : "#dc2626", label: "Wind gust" },
      ];
      const x0 = 12;
      const y0 = H - 14;
      ctx.save();
      ctx.font = "10px ui-monospace, monospace";
      ctx.textBaseline = "middle";
      let cx = x0;
      for (const it of items) {
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = it.color;
        ctx.lineWidth = 2;
        if (it.dashed) ctx.setLineDash([5, 3]);
        else ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(cx, y0);
        ctx.lineTo(cx + 18, y0);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = isDark ? "#d1d5db" : "#374151";
        ctx.fillText(it.label, cx + 22, y0);
        cx += 22 + ctx.measureText(it.label).width + 18;
      }
      ctx.restore();
    }

    // ---- Main render ----
    let t = 0;
    let last = performance.now();

    function render(now: number) {
      if (!ctx) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (visible && !reducedMotion) t += dt;

      const isDark = document.documentElement.classList.contains("dark");

      ctx.clearRect(0, 0, W, H);

      // Particles
      const phase = t % CYCLE;
      for (const p of particles) {
        const { u, v } = windAt(p.x, p.y, t);
        if (!reducedMotion) {
          p.x += u * dt * 0.9;
          p.y += v * dt * 0.9;
          p.age++;
          if (p.age > p.life || p.x < 0 || p.x > W || p.y < 0 || p.y > H) {
            p.x = Math.random() * W;
            p.y = Math.random() * H;
            p.age = 0;
            p.life = 80 + Math.random() * 80;
          }
        }
        const progress = Math.min(p.age / p.life, 1);
        const fade = progress < 0.15 ? progress / 0.15 : progress > 0.8 ? (1 - progress) / 0.2 : 1;
        const speed = Math.sqrt(u * u + v * v);
        const len = Math.min(speed * 0.5, 14);
        const angle = Math.atan2(v, u);
        const tailX = p.x - Math.cos(angle) * len;
        const tailY = p.y - Math.sin(angle) * len;
        const baseAlpha = isDark ? 0.55 : 0.45;
        ctx.save();
        ctx.globalAlpha = baseAlpha * fade;
        const grad = ctx.createLinearGradient(tailX, tailY, p.x, p.y);
        const col = isDark ? "99,102,241" : "67,56,202";
        grad.addColorStop(0, `rgba(${col},0)`);
        grad.addColorStop(1, `rgba(${col},1)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.restore();
      }

      // Gust
      drawGust(t, isDark);

      // Route logic
      const gi = gustIntensity(t);
      const baseColor  = isDark ? "#67e8f9" : "#0891b2";
      const altColor   = isDark ? "#86efac" : "#16a34a";

      // Progress along route: first 3.5s travel original, then when gust appears ghost it
      let baseProgress = 0;
      let altProgress  = 0;
      let baseAlpha    = 0;
      let altAlpha     = 0;
      let droneOnBase  = false;

      if (phase < GUST_EMERGE_T) {
        // Travelling on base route before gust
        baseProgress = phase / GUST_EMERGE_T;
        baseAlpha = 0.85;
        droneOnBase = true;
      } else if (phase < REPLAN_T) {
        // Gust emerged — base route ghosted, alt starts drawing from current position
        const fadeAmt = Math.min(1, (phase - GUST_EMERGE_T) / 0.8);
        baseProgress = 1;
        baseAlpha = 0.85 * (1 - fadeAmt * 0.6); // ghost (still visible, dashed)
        altProgress = Math.min(1, (phase - REPLAN_T + 0.01) / 0.01); // tiny
        altAlpha = 0;
        droneOnBase = true;
      } else if (phase < CYCLE - 1) {
        // Replanned route animating
        const replanElapsed = phase - REPLAN_T;
        const replanDuration = CYCLE - 1 - REPLAN_T;
        baseProgress = 1;
        baseAlpha = 0.3; // ghost
        altProgress = replanElapsed / replanDuration;
        altAlpha = 0.9;
        droneOnBase = false;
      } else {
        // Fade out and reset
        const fadeOut = phase - (CYCLE - 1);
        baseProgress = 1;
        baseAlpha = 0.3 * (1 - fadeOut);
        altProgress = 1;
        altAlpha = 0.9 * (1 - fadeOut);
        droneOnBase = false;
      }

      // Draw original route (dashed when ghosted)
      drawRoute(routes.base, baseProgress, baseColor, baseAlpha, baseAlpha < 0.6);
      // Draw replanned route (solid)
      drawRoute(routes.alt, altProgress, altColor, altAlpha, false);

      // Drone
      const droneWaypoints = droneOnBase ? routes.base : routes.alt;
      const droneProgress  = droneOnBase ? baseProgress : altProgress;
      const droneAlpha     = Math.max(baseAlpha, altAlpha);
      if (droneProgress > 0) {
        const { x: dx, y: dy } = dronePos(droneWaypoints, droneProgress);
        const dc = droneOnBase ? baseColor : altColor;
        drawDrone(dx, dy, dc, droneAlpha);
      }

      drawLegend(isDark);

      if (!reducedMotion) {
        animId = requestAnimationFrame(render);
      }
    }

    if (reducedMotion) {
      // Static snapshot: gust present, both routes visible
      t = REPLAN_T + 1;
      render(performance.now());
    } else {
      animId = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(animId);
      io.disconnect();
    };
  }, [reducedMotion]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative w-full aspect-[4/3] rounded-2xl border border-border overflow-hidden bg-surface"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </motion.div>
  );
}
