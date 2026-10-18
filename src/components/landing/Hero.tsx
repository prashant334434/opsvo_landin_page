"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

/*
 * Fixed, scroll-scrubbed film. A 540vh invisible track supplies scroll distance;
 * a sticky frame holds video, veils, panels, footer and meter, so nothing on
 * screen moves while the track is in view. One rAF loop (only while the track
 * is visible) reads progress from the track rect and drives everything:
 *   targetTime = progress × DURATION, eased toward, then seeked.
 * Panels use the same eased time, so text never drifts from its frames.
 *
 * Media (cut from public/videos/Timeline 1.mov, which stays untouched):
 * 8.2s of film, ending before the clip's built-in comparison UI, plus a 1.4s
 * hold on the final frame so the last panel gets dwell time. H.264, keyframe
 * every 6 frames, no B-frames, no audio. Loaded whole into a blob when the
 * server reports progress; falls back to a plain range-request src.
 */

const DURATION = 9.625; // seconds, incl. the 1.4s end hold
const SRC = { lg: "/videos/hero-scrub.mp4", sm: "/videos/hero-scrub-sm.mp4" };
const POSTER = "/images/hero-poster.jpg";

const s = (sec: number) => sec / DURATION; // footage seconds → normalized progress
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smoothstep = (a: number, b: number, x: number) => {
  if (b <= a) return x >= a ? 1 : 0;
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// Cues: [fade-in start, fade-in end, fade-out start, fade-out end] in progress.
// Windows sit on shots where the product clears the text column; the gaps
// between them are deliberate video-only intervals (the close-ups, the turn).
type Panel = { cue: [number, number, number, number]; side: "left" | "right"; eyebrow: string; title: string; copy: string; cta?: [string, string] };
const PANELS: Panel[] = [
  { cue: [0, 0, s(3.15), s(3.55)], side: "left", eyebrow: "A better way to choose", title: "Travel, considered.", copy: "Find the right carry for the way you move.", cta: ["Explore the collection", "#compare"] },
  { cue: [s(6.3), s(6.6), s(7.3), s(7.6)], side: "left", eyebrow: "Design, in detail", title: "Every detail has a purpose.", copy: "Look closer at the shape, finish and details that define your next carry." },
  // Final frame puts the suitcase left of centre, so this one sits right.
  { cue: [s(7.95), s(8.35), 2, 2], side: "right", eyebrow: "Choose with clarity", title: "The right choice starts here.", copy: "Compare the details that matter before you decide.", cta: ["Compare products", "#compare-table"] },
];

const CHAPTERS: [from: number, label: string][] = [
  [0, "The reveal"],
  [2.9, "Shell & finish"],
  [4.88, "Wheels & hardware"],
  [6.2, "The silhouette"],
  [7.75, "The decision"],
];

// Product centre (x % of frame) over time; portrait screens crop the 16:9
// film hard, so object-position follows the suitcase. Measured from the footage.
const FOCUS: [t: number, x: number][] = [[0, 66], [1.5, 63], [2.5, 59], [3, 56], [3.5, 51], [4.9, 52], [5.4, 58], [5.7, 60], [6, 52], [7, 50], [7.9, 47], [8.2, 44]];
const focusAt = (t: number) => {
  let i = 1;
  while (i < FOCUS.length - 1 && FOCUS[i][0] < t) i++;
  const [t0, x0] = FOCUS[i - 1];
  const [t1, x1] = FOCUS[i];
  return x0 + (x1 - x0) * clamp01((t - t0) / (t1 - t0));
};

const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

type Phase = "loading" | "ready" | "poster";

export function Hero() {
  const track = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const veils = useRef<(HTMLDivElement | null)[]>([]); // left, right, bottom (portrait)
  const meter = useRef<HTMLSpanElement>(null);
  const chapterNo = useRef<HTMLSpanElement>(null);
  const chapterLabel = useRef<HTMLSpanElement>(null);
  const loaderFill = useRef<HTMLSpanElement>(null);
  const loaderText = useRef<HTMLSpanElement>(null);
  const seekable = useRef(false);
  const [phase, setPhase] = useState<Phase>("loading");
  const [loaderGone, setLoaderGone] = useState(false);

  useEffect(() => {
    seekable.current = phase === "ready";
  }, [phase]);

  // Load: stream into a blob with real progress, else fall back to a range-request
  // src. Every path ends in "ready" or "poster", so the loader can't trap anyone.
  useEffect(() => {
    const v = video.current!;
    const lite = matchMedia("(prefers-reduced-motion: reduce)").matches || (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (lite) {
      const id = requestAnimationFrame(() => setPhase("poster"));
      return () => cancelAnimationFrame(id);
    }

    const src = matchMedia("(max-width: 767px)").matches ? SRC.sm : SRC.lg;
    const ctrl = new AbortController();
    let url = "";
    let stalled = false;
    let watchdog = 0;
    const report = (f: number | null) => {
      const fill = loaderFill.current;
      const text = loaderText.current;
      if (!fill || !text) return;
      fill.classList.toggle("animate-indeterminate", f === null);
      fill.style.width = f === null ? "30%" : "100%";
      fill.style.transform = f === null ? "" : `scaleX(${f})`;
      text.textContent = f === null ? "Loading" : `${Math.round(f * 100)}%`;
    };
    // Give up to the poster after 20s or on error; a late download still upgrades to the film.
    const giveUp = () => setPhase((p) => (p === "loading" ? "poster" : p));
    const cap = setTimeout(giveUp, 20_000);
    const onError = giveUp;
    const onData = () => {
      clearTimeout(cap);
      setPhase("ready");
    };
    v.addEventListener("error", onError);
    v.addEventListener("loadeddata", onData);

    (async () => {
      try {
        const res = await fetch(src, { signal: ctrl.signal });
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
        const total = Number(res.headers.get("content-length")) || 0;
        const reader = res.body.getReader();
        const chunks: Uint8Array<ArrayBuffer>[] = [];
        let got = 0;
        const arm = () => {
          clearTimeout(watchdog);
          watchdog = window.setTimeout(() => ((stalled = true), ctrl.abort()), 8000);
        };
        arm();
        report(total ? 0 : null);
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          got += value.length;
          arm();
          if (total) report(Math.min(1, got / total));
        }
        clearTimeout(watchdog);
        url = URL.createObjectURL(new Blob(chunks, { type: "video/mp4" }));
        v.src = url;
      } catch {
        clearTimeout(watchdog);
        if (ctrl.signal.aborted && !stalled) return; // unmounted
        report(null);
        v.src = src; // stalled, CORS or HTTP error: let the browser stream it
      }
    })();

    return () => {
      ctrl.abort();
      clearTimeout(watchdog);
      clearTimeout(cap);
      v.removeEventListener("error", onError);
      v.removeEventListener("loadeddata", onData);
      v.removeAttribute("src");
      v.load();
      if (url) URL.revokeObjectURL(url);
    };
  }, []);

  // The single rAF loop. Runs only while the track is on screen.
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = track.current!;
    const v = video.current!;
    let raf = 0;
    let last = 0;
    let t = 0;
    let seekAt = 0;
    let ema = 0;
    let samples = 0;
    let slow = false;
    let chapter = -1;
    let focus = "";
    const prev = PANELS.map(() => "");

    // Never let the film run on its own (media keys, the iOS unlock below).
    const onPlay = () => v.pause();
    // Seek cost: if this device can't keep up, hold the frame and let text carry on.
    const onSeeked = () => {
      if (!seekAt) return;
      const ms = performance.now() - seekAt;
      seekAt = 0;
      ema = samples++ ? ema * 0.8 + ms * 0.2 : ms;
      if (samples > 12 && ema > 160) slow = true;
    };
    // iOS won't decode a never-played video; a muted play() on first touch
    // unlocks it, and onPlay pauses it immediately.
    const unlock = () => v.play().catch(() => {});
    v.addEventListener("play", onPlay);
    v.addEventListener("seeked", onSeeked);
    addEventListener("touchstart", unlock, { once: true, passive: true });

    const frame = (now: number) => {
      const dt = Math.min(0.1, (now - (last || now)) / 1000);
      last = now;
      const r = el.getBoundingClientRect();
      const progress = clamp01(-r.top / (r.height - innerHeight));
      const target = progress * DURATION;
      t = Math.abs(target - t) < 0.002 ? target : t + (target - t) * (1 - Math.exp(-dt * 9));

      if (seekable.current && !slow && v.readyState >= 1 && !v.seeking) {
        const want = Math.min(t, v.duration - 0.02);
        if (Math.abs(v.currentTime - want) > 1 / 96) {
          seekAt = now;
          v.currentTime = want;
        }
      }

      const q = t / DURATION;
      const veil = [0, 0, 0];
      PANELS.forEach((p, i) => {
        const a = smoothstep(p.cue[0], p.cue[1], q);
        const b = smoothstep(p.cue[2], p.cue[3], q);
        const o = a * (1 - b);
        veil[p.side === "left" ? 0 : 1] = Math.max(veil[p.side === "left" ? 0 : 1], o);
        veil[2] = Math.max(veil[2], o);
        const key = `${o.toFixed(3)}|${((1 - a) * 22 - b * 22).toFixed(1)}`;
        const node = panels.current[i];
        if (!node || key === prev[i]) return;
        prev[i] = key;
        node.style.opacity = o.toFixed(3);
        node.style.transform = `translate3d(0,${((1 - a) * 22 - b * 22).toFixed(1)}px,0)`;
        node.style.visibility = o < 0.01 ? "hidden" : "visible";
      });
      veils.current.forEach((n, i) => n && (n.style.opacity = veil[i].toFixed(3)));
      meter.current!.style.transform = `scaleX(${progress.toFixed(4)})`;

      let c = CHAPTERS.length - 1;
      while (t < CHAPTERS[c][0]) c--;
      if (c !== chapter) {
        chapter = c;
        chapterNo.current!.textContent = `0${c + 1}`;
        chapterLabel.current!.textContent = CHAPTERS[c][1];
      }

      // Portrait: keep the suitcase centred in the hard 16:9 crop.
      const { clientWidth: w, clientHeight: h } = v;
      const img = h * (16 / 9);
      const pos = w < h && img > w ? `${(clamp01((w / 2 - (focusAt(t) / 100) * img) / (w - img)) * 100).toFixed(1)}% 50%` : "50% 50%";
      if (pos !== focus) v.style.objectPosition = focus = pos;

      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      last = 0;
      if (e.isIntersecting) raf = requestAnimationFrame(frame);
    });
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("seeked", onSeeked);
      removeEventListener("touchstart", unlock);
    };
  }, []);

  return (
    <section ref={track} data-hero-track aria-label="The Opsvo cabin collection" className="relative h-[540vh] bg-ivory font-editorial text-charcoal motion-reduce:h-svh">
      <div className="sticky top-0 h-svh overflow-hidden">
        <video
          ref={video}
          muted
          playsInline
          preload="auto"
          poster={POSTER}
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
          disableRemotePlayback
          className="absolute inset-0 size-full object-cover"
        />

        {/* Veils: a faint wash everywhere, a side wash under whichever panel is up
            (bottom wash on portrait), then fine grain. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-ivory/[.07]" />
        <div ref={(n) => { veils.current[0] = n; }} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-r from-ivory/75 to-transparent to-45% portrait:hidden" style={{ opacity: 1 }} />
        <div ref={(n) => { veils.current[1] = n; }} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-l from-ivory/75 to-transparent to-45% portrait:hidden" style={{ opacity: 0 }} />
        <div ref={(n) => { veils.current[2] = n; }} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-t from-ivory/95 via-ivory/75 via-35% to-transparent to-65% landscape:hidden" style={{ opacity: 1 }} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[.07] mix-blend-multiply" style={{ backgroundImage: GRAIN }} />

        {PANELS.map((p, i) => {
          const H = i === 0 ? "h1" : "h2";
          return (
            <div
              key={p.title}
              ref={(n) => { panels.current[i] = n; }}
              className={`absolute portrait:inset-x-5 portrait:bottom-[calc(4.25rem+env(safe-area-inset-bottom))] md:portrait:inset-x-10 landscape:top-1/2 landscape:w-[min(30vw,460px)] landscape:-translate-y-1/2 ${
                p.side === "left" ? "landscape:left-[clamp(24px,6vw,96px)]" : "landscape:right-[clamp(24px,6vw,96px)]"
              } ${i > 0 ? "motion-reduce:hidden" : ""}`}
              style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? "visible" : "hidden" }}
            >
              <p className="text-[11px] font-medium tracking-[.2em] text-forest uppercase">{p.eyebrow}</p>
              <H className="mt-4 text-[clamp(2.25rem,10vw,3.25rem)] leading-[.95] font-normal tracking-[-.045em] text-balance landscape:text-[clamp(2rem,min(5vw,9.5vh),5.5rem)]">
                {p.title}
              </H>
              <p className="mt-4 max-w-[34ch] text-base text-charcoal/65 landscape:mt-5 landscape:text-[clamp(15px,1.25vw,18px)]">{p.copy}</p>
              {p.cta && (
                <a
                  href={p.cta[1]}
                  className="mt-6 inline-flex h-11 items-center gap-2.5 rounded-full bg-charcoal px-5 text-sm font-medium text-ivory transition-colors hover:bg-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest landscape:mt-8"
                >
                  {p.cta[0]} <ArrowRight className="size-4" />
                </a>
              )}
            </div>
          );
        })}

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 border-t border-charcoal/10 bg-ivory/85 px-5 pt-3 pb-[max(.75rem,env(safe-area-inset-bottom))] text-[11px] tracking-[.16em] text-charcoal/65 uppercase md:px-[clamp(24px,6vw,96px)]">
          <p aria-live="polite">
            <span ref={chapterNo} className="tabular-nums">01</span> — <span ref={chapterLabel}>The reveal</span>
          </p>
          <p className="hidden sm:block">Opsvo — Cabin collection</p>
        </div>

        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-charcoal/10 motion-reduce:hidden">
          <span ref={meter} className="block h-full origin-left bg-forest" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>

      {!loaderGone && (
        <div
          role="status"
          onTransitionEnd={() => phase !== "loading" && setLoaderGone(true)}
          className={`fixed inset-0 z-50 grid place-items-center bg-ivory transition-opacity duration-500 motion-reduce:hidden ${phase === "loading" ? "" : "pointer-events-none opacity-0"}`}
        >
          <div className="grid w-44 justify-items-center gap-4">
            <span className="text-2xl font-medium tracking-[-.04em]">Opsvo</span>
            <span className="block h-0.5 w-full overflow-hidden bg-charcoal/10">
              <span ref={loaderFill} className="block h-full w-full origin-left bg-forest" style={{ transform: "scaleX(0)" }} />
            </span>
            <span ref={loaderText} className="text-[11px] tracking-[.16em] text-charcoal/65 uppercase tabular-nums">0%</span>
          </div>
        </div>
      )}
    </section>
  );
}
