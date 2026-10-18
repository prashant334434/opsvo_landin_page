import { useEffect, useRef, type RefObject } from "react";

/**
 * Pointer-driven spring tilt for `.tilt` surfaces. Writes CSS vars on the element
 * (--rx/--ry in degrees, --px/--py in -1…1 for parallax) from a rAF spring that
 * only runs while moving, so React never re-renders. `[data-magnet]` children
 * drift up to 4px toward the pointer. Fine pointers only; off for reduced motion.
 */
export function useTilt(ref: RefObject<HTMLElement | null>, max = 5) {
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    const vel = { x: 0, y: 0 };
    let rect = el.getBoundingClientRect();
    let raf = 0;
    let last = 0;
    const magnets = [...el.querySelectorAll<HTMLElement>("[data-magnet]")];

    const step = (now: number) => {
      const dt = Math.min(0.032, (now - (last || now)) / 1000 || 0.016);
      last = now;
      for (const k of ["x", "y"] as const) {
        vel[k] += (170 * (target[k] - pos[k]) - 24 * vel[k]) * dt; // stiffness 170, damping 24: settles without bounce
        pos[k] += vel[k] * dt;
      }
      el.style.setProperty("--px", pos.x.toFixed(4));
      el.style.setProperty("--py", pos.y.toFixed(4));
      el.style.setProperty("--rx", (-pos.y * max).toFixed(3));
      el.style.setProperty("--ry", (pos.x * max).toFixed(3));
      const settled = Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) + Math.abs(vel.x) + Math.abs(vel.y) < 0.002;
      // Back at rest: drop the inline vars so CSS (focus/tap presets) can set them.
      if (settled && !target.x && !target.y) for (const v of ["--px", "--py", "--rx", "--ry"]) el.style.removeProperty(v);
      raf = settled ? 0 : requestAnimationFrame(step);
    };
    const kick = () => {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(step);
    };

    const enter = () => (rect = el.getBoundingClientRect()); // rest-state rect, so the tilt can't feed back into itself
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1));
      target.y = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height) * 2 - 1));
      for (const m of magnets) {
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const pull = Math.max(0, 1 - Math.hypot(dx, dy) / 90) * 0.12;
        m.style.translate = `${Math.max(-4, Math.min(4, dx * pull)).toFixed(2)}px ${Math.max(-4, Math.min(4, dy * pull)).toFixed(2)}px`;
      }
      kick();
    };
    const leave = () => {
      target.x = target.y = 0;
      for (const m of magnets) m.style.translate = "";
      kick();
    };

    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [ref, max]);
}

/**
 * Arms `.reveal` children: sets data-reveal="pending" on the element until it first
 * enters view, then "in" for good, so small scrolls never replay it. Skipped when
 * already on screen at mount or under reduced motion, so content is never hidden.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches || el.getBoundingClientRect().top < innerHeight * 0.85) return;
    el.dataset.reveal = "pending";
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.dataset.reveal = "in";
        io.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
