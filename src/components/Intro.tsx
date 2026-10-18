"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Load intro: particles rise like embers, assemble into the wordmark, hold,
 * then drift up and dissolve to reveal the page. 2D canvas, no three.js, so it
 * can start before the hero scene has loaded.
 *
 * Server-rendered as a solid canvas-coloured cover so the page never flashes
 * first. CSS in globals.css hides it under reduced motion, and after 8s as a
 * failsafe if JS never runs.
 */

const NAME = "Opsvo";
const ASSEMBLE = 1900; // ms until the last particle lands
const FLIGHT = 1100; // ms each particle spends travelling
const HOLD = 900;
const EXIT = 800;
const EMBERS = 90;

const easeOut = (x: number) => 1 - (1 - x) ** 3;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Target points: every `gap` px inside the rendered word. */
function sampleWord(w: number, h: number, family: string) {
  const size = Math.min(w * 0.22, 220);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.font = `600 ${size}px ${family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(NAME, w / 2, h / 2);
  const data = ctx.getImageData(0, 0, w, h).data;
  const gap = Math.max(2, Math.round(size / 75));
  const pts: number[] = [];
  for (let y = 0; y < h; y += gap)
    for (let x = 0; x < w; x += gap) if (data[(y * w + x) * 4 + 3] > 128)
        // Scatter within the cell so the word reads as grain, not a dot grid.
        pts.push(x + (Math.random() - 0.5) * gap, y + (Math.random() - 0.5) * gap);
  return pts;
}

export function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // globals.css already hides .intro under reduced motion; nothing to run.
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = root.current!;
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const css = getComputedStyle(document.documentElement);
    const accent = css.getPropertyValue("--color-accent").trim();
    const ember = css.getPropertyValue("--color-warning").trim();
    const html = document.documentElement;
    html.style.overflow = "hidden";

    let frame = 0;
    let start = 0;
    let cancelled = false;
    const skip = () => {
      const t = performance.now() - start;
      if (start && t < ASSEMBLE + HOLD) start = performance.now() - (ASSEMBLE + HOLD);
    };

    document.fonts.ready.then(() => {
      if (cancelled) return;
      const w = innerWidth;
      const h = innerHeight;
      const dpr = Math.min(devicePixelRatio, 2);
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const pts = sampleWord(w, h, getComputedStyle(document.body).fontFamily);
      const n = pts.length / 2;
      // Per particle: start x/y, target x/y, launch delay, wobble phase, exit drift.
      const sx = new Float32Array(n), sy = new Float32Array(n);
      const tx = new Float32Array(n), ty = new Float32Array(n);
      const delay = new Float32Array(n), phase = new Float32Array(n), drift = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        tx[i] = pts[i * 2];
        ty[i] = pts[i * 2 + 1];
        sx[i] = tx[i] + (Math.random() - 0.5) * w * 0.5;
        sy[i] = h + Math.random() * h * 0.4; // rise from below, like embers
        // Sweep left to right so the word writes itself in.
        delay[i] = (tx[i] / w) * (ASSEMBLE - FLIGHT) * 0.7 + Math.random() * (ASSEMBLE - FLIGHT) * 0.3;
        phase[i] = Math.random() * Math.PI * 2;
        drift[i] = 40 + Math.random() * 140;
      }
      const ex = Float32Array.from({ length: EMBERS }, () => Math.random() * w);
      const ey = Float32Array.from({ length: EMBERS }, () => Math.random() * h);
      const ev = Float32Array.from({ length: EMBERS }, () => 20 + Math.random() * 50);

      let prev = 0;
      const tick = (now: number) => {
        if (!start) start = prev = now;
        const t = now - start;
        const dt = (now - prev) / 1000;
        prev = now;
        const exit = clamp01((t - ASSEMBLE - HOLD) / EXIT);
        const fade = 1 - exit;

        ctx.clearRect(0, 0, w, h);

        ctx.fillStyle = ember;
        for (let i = 0; i < EMBERS; i++) {
          ey[i] -= ev[i] * dt;
          if (ey[i] < -4) ey[i] = h + 4;
          ctx.globalAlpha = fade * (0.35 + 0.35 * Math.sin(now * 0.004 + i));
          ctx.fillRect(ex[i] + Math.sin(now * 0.001 + i) * 6, ey[i], 1.5, 1.5);
        }

        ctx.fillStyle = accent;
        for (let i = 0; i < n; i++) {
          const p = clamp01((t - delay[i]) / FLIGHT);
          if (p === 0) continue;
          const e = easeOut(p);
          const wob = (1 - e) * 24;
          let x = sx[i] + (tx[i] - sx[i]) * e + Math.sin(phase[i] + t * 0.006) * wob;
          let y = sy[i] + (ty[i] - sy[i]) * e;
          if (p === 1) {
            // Settled: a faint shimmer so the word stays alive while it holds.
            x += Math.sin(phase[i] + t * 0.003) * 0.4;
            y += Math.cos(phase[i] + t * 0.0025) * 0.4;
          }
          if (exit > 0) {
            y -= exit * exit * drift[i];
            x += Math.sin(phase[i]) * exit * 30;
          }
          // Particles flicker while flying, steady once landed.
          ctx.globalAlpha = fade * (p < 1 ? 0.4 + 0.6 * e : 0.75 + 0.25 * Math.sin(phase[i] + t * 0.005));
          ctx.fillRect(x, y, 1.8, 1.8);
        }
        ctx.globalAlpha = 1;

        el.style.opacity = String(fade);
        if (exit < 1) frame = requestAnimationFrame(tick);
        else {
          html.style.overflow = "";
          setDone(true);
        }
      };
      frame = requestAnimationFrame(tick);
    });

    addEventListener("keydown", skip);
    el.addEventListener("pointerdown", skip);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      removeEventListener("keydown", skip);
      el.removeEventListener("pointerdown", skip);
      html.style.overflow = "";
    };
  }, []);

  if (done) return null;

  return (
    <div ref={root} className="intro fixed inset-0 z-[60] bg-canvas">
      <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 h-full w-full" />
      {/* No handler needed: clicks hit the overlay's pointerdown, Enter/Space hit the keydown listener. */}
      <button
        type="button"
        className="absolute right-4 bottom-4 inline-flex min-h-tap items-center rounded-md px-4 text-label text-secondary transition-colors duration-[120ms] hover:text-primary md:right-8"
      >
        Skip intro
      </button>
    </div>
  );
}
