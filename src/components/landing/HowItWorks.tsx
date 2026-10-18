"use client";

import { useRef, useState, type ReactNode } from "react";
import { ArrowUp, ShieldCheck } from "lucide-react";
import { useReveal, useTilt } from "./motion";
import { EditorialHead, bg, stagger } from "./ui";

const MATCHES = [
  { name: "Option A", price: "₹8,999", photo: true },
  { name: "Option B", price: "₹10,499", photo: false },
  { name: "Option C", price: "₹12,999", photo: false },
];

const PRICES = { a: "₹8,999", b: "₹10,499" };
const DIFFS: [label: string, a: string, b: string][] = [
  ["Weight", "3.4 kg", "2.6 kg"],
  ["Warranty", "2 yr", "3 yr"],
];

const tile = "rounded-[4px] border border-border bg-white shadow-[0_10px_24px_-18px_rgb(13_12_11/.45)]";
const micro = "text-[10px] tracking-[.16em] uppercase text-charcoal/50";

function Describe() {
  return (
    <>
      <div className={`${tile} mini absolute inset-x-4 top-4 translate-z-4 p-3 lit:translate-z-8`}>
        <p className={micro}>Ask Opsvo</p>
        <div className="relative mt-2 min-h-[2.6em] text-[12px] leading-snug">
          <span className="mini absolute inset-0 text-charcoal/35 lit:opacity-0">What do you need?</span>
          <span className="mini block [clip-path:inset(0_100%_0_0)] duration-[900ms] lit:[clip-path:inset(0)] motion-reduce:duration-0">
            A carry-on suitcase under ₹15,000 that fits budget-airline cabin limits
          </span>
        </div>
        <div className="mt-1.5 flex justify-end">
          <span data-magnet className="mini grid size-7 place-items-center rounded-full bg-charcoal/15 text-ivory transition-[translate,background-color] lit:bg-forest">
            <ArrowUp className="size-3.5" />
          </span>
        </div>
      </div>
      <div className="absolute inset-x-4 bottom-4 flex gap-1.5 translate-z-10">
        {["Under ₹15,000", "Cabin limits"].map((chip, i) => (
          <span
            key={chip}
            className="mini translate-y-1.5 rounded-full border border-forest/25 bg-ivory px-2 py-0.5 text-[10px] text-forest opacity-0 lit:translate-y-0 lit:opacity-100"
            style={{ transitionDelay: `${560 + i * 90}ms` }}
          >
            {chip}
          </span>
        ))}
      </div>
    </>
  );
}

const STACK = [
  "-translate-y-1/2 translate-z-6 lit:-translate-y-[calc(50%+6px)] lit:translate-z-20",
  "-translate-y-[calc(50%+7px)] translate-z-3 lit:-translate-y-[calc(50%+30px)] lit:translate-z-10",
  "-translate-y-[calc(50%+14px)] translate-z-0 lit:-translate-y-[calc(50%+54px)] lit:translate-z-0",
];

function Matches() {
  return (
    <>
      {MATCHES.map((m, i) => (
        <div
          key={m.name}
          className={`${tile} mini absolute top-[54%] left-1/2 w-[64%] -translate-x-1/2 p-2.5 ${STACK[i]}`}
          style={{ zIndex: 3 - i, transitionDelay: `${i * 60}ms` }}
        >
          <div className="flex items-center gap-2.5">
            {m.photo ? (
              <span className="photo size-8 shrink-0 rounded-[3px]" style={bg("/images/compare-stage.jpg")} />
            ) : (
              <span className="grid size-8 shrink-0 place-items-center rounded-[3px] bg-sand text-[10px] text-charcoal/45">{m.name.slice(-1)}</span>
            )}
            <div className="min-w-0">
              <p className="text-[11px] font-medium">{m.name}</p>
              <p className="text-[10px] text-charcoal/55 tabular-nums">{m.price}</p>
            </div>
          </div>
          <div className="mt-2 h-1 w-3/4 rounded-full bg-sand" />
        </div>
      ))}
      <p className={`${micro} mini absolute inset-x-0 bottom-3 translate-y-1 text-center opacity-0 lit:translate-y-0 lit:opacity-100`} style={{ transitionDelay: "260ms" }}>
        3 matches, each with reasons
      </p>
    </>
  );
}

function CompareMini() {
  return (
    <>
      {(["a", "b"] as const).map((side) => (
        <div
          key={side}
          className={`${tile} mini absolute top-4 bottom-4 left-1/2 w-[44%] p-2.5 ${
            side === "a"
              ? "z-10 -translate-x-1/2 translate-z-6 lit:-translate-x-[104%] lit:translate-z-6"
              : "-translate-x-[42%] translate-y-1.5 translate-z-0 lit:translate-x-[4%] lit:translate-y-0 lit:translate-z-6"
          }`}
        >
          <p className="text-[11px] font-medium">Option {side.toUpperCase()}</p>
          <p className="text-[10px] text-charcoal/55 tabular-nums">{PRICES[side]}</p>
          <div className="relative mt-2.5">
            <div aria-hidden="true" className="mini space-y-2 pt-1.5 lit:opacity-0">
              <div className="h-1 w-4/5 rounded-full bg-sand" />
              <div className="h-1 w-3/5 rounded-full bg-sand" />
            </div>
            <dl className="absolute inset-x-0 top-0 space-y-1.5">
              {DIFFS.map(([label, a, b], i) => (
                <div
                  key={label}
                  className="mini flex justify-between gap-1 border-t border-border pt-1.5 text-[10px] opacity-0 lit:opacity-100"
                  style={{ transitionDelay: `${300 + i * 80}ms` }}
                >
                  <dt className="text-charcoal/50">{label}</dt>
                  <dd className="font-medium text-forest tabular-nums">{side === "a" ? a : b}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ))}
    </>
  );
}

function Control() {
  return (
    <>
      <div className={`${tile} absolute inset-x-4 top-4 translate-z-2 bg-white/80 p-3`}>
        <p className={micro}>Before anything happens</p>
        <ul className="mt-2 space-y-1.5 text-[11px]">
          <li className="flex justify-between gap-2">
            <span>Purchase · Option A</span>
            <span className="tabular-nums">₹8,999</span>
          </li>
          <li className="flex justify-between gap-2">
            <span>Share delivery address</span>
            <span className="text-charcoal/50">Off</span>
          </li>
        </ul>
      </div>
      <div className={`${tile} mini absolute inset-x-7 bottom-3 translate-y-5 translate-z-6 p-2.5 lit:translate-y-0 lit:translate-z-16 lit:shadow-[0_18px_30px_-18px_rgb(13_12_11/.45)]`}>
        <p className="flex items-center gap-1.5 text-[11px] font-medium">
          <ShieldCheck className="size-3.5 text-forest" /> Waiting for your approval
        </p>
        <p className="mini mt-0.5 text-[10px] text-charcoal/60 opacity-0 lit:opacity-100" style={{ transitionDelay: "200ms" }}>
          Nothing is bought or shared until you say so.
        </p>
        <div className="mt-2 flex gap-1.5 text-[10px]">
          <span data-magnet className="mini rounded-full bg-forest px-2.5 py-1 text-ivory transition-[translate]">Approve</span>
          <span className="rounded-full border border-border px-2.5 py-1 text-charcoal/65">Not now</span>
        </div>
      </div>
    </>
  );
}

const STEPS: { title: string; text: string; example: string; scene: ReactNode }[] = [
  { title: "Describe", text: "Tell Opsvo what you need in plain words.", example: "Example request: a carry-on suitcase under ₹15,000 that fits budget-airline cabin limits.", scene: <Describe /> },
  { title: "Get matches", text: "See a short list with reasons and sources.", example: "Example: three matches, Option A at ₹8,999, Option B at ₹10,499 and Option C at ₹12,999.", scene: <Matches /> },
  { title: "Compare", text: "Focus on the differences that matter.", example: "Example: Option A weighs 3.4 kg with a 2 year warranty; Option B weighs 2.6 kg with a 3 year warranty.", scene: <CompareMini /> },
  { title: "Stay in control", text: "You approve any action that spends money or shares your details.", example: "Example: a purchase and an address share both wait for your approval.", scene: <Control /> },
];

function StepCard({ n, step }: { n: number; step: (typeof STEPS)[number] }) {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  useTilt(ref, 5);

  return (
    <article
      ref={ref}
      data-card
      data-open={open || undefined}
      tabIndex={0}
      aria-labelledby={`step-${n}`}
      onPointerUp={(e) => e.pointerType !== "mouse" && setOpen((o) => !o)}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
      className="tilt flex h-full cursor-default flex-col rounded-[6px] border border-border bg-[#faf9f6] outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest"
    >
      <div aria-hidden="true" className="relative m-3 h-48 rounded-[4px] bg-sand/60 transform-3d">
        {step.scene}
      </div>
      <div className="flex flex-1 flex-col px-5 pt-3 pb-6 translate-z-3">
        <span className="text-[11px] tracking-[.2em] text-charcoal/45 tabular-nums">0{n}</span>
        <h3 id={`step-${n}`} className="mt-2 text-[22px] leading-tight tracking-[-.03em]">
          {step.title}
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-charcoal/65">{step.text}</p>
        <p className="sr-only">{step.example}</p>
      </div>
    </article>
  );
}

export function HowItWorks() {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} id="how-it-works" className="bg-ivory font-editorial text-charcoal">
      <div className="wrap py-20 md:py-28">
        <EditorialHead
          n="02"
          label="How it works"
          title="Less searching. More certainty."
          aside={
            <p className="reveal hidden text-[13px] text-charcoal/50 md:block" style={stagger(3)}>
              Hover, focus or tap a step to see it in action.
            </p>
          }
        >
          From a simple request to a shortlist you can understand, compare and trust.
        </EditorialHead>

        <ol className="mt-14 grid gap-5 sm:grid-cols-2 md:mt-16 xl:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="reveal perspective-[1000px]" style={stagger(i + 3)}>
              <StepCard n={i + 1} step={step} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
