"use client";

import { useState } from "react";
import { ArrowRight, Clock3, Link2, Link2Off, TriangleAlert, X } from "lucide-react";
import { OPTIONS } from "./Compare";
import { useReveal } from "./motion";
import { EditorialHead, bg, stagger } from "./ui";

const C = OPTIONS[2];
const FACTS: { label: string; value: string; status: "shown" | "unverified" | "missing" }[] = [
  { label: "Price", value: C.price, status: "shown" },
  { label: "Weight", value: C.weight, status: "shown" },
  { label: "Cabin size", value: C.fits ? "Fits" : "Not verified", status: C.fits ? "shown" : "unverified" },
  { label: "Warranty", value: C.warranty ?? "Unavailable", status: C.warranty ? "shown" : "missing" },
];

const TIMELINE = ["Listed by the retailer", "Recorded with its source", "Re-checked", "Shown to you with the date"];

const CARDS = [
  { Icon: Link2, title: "Source links", text: "See the retailer or source for each fact.", panel: "Sources" },
  { Icon: Clock3, title: "Last checked dates", text: "Know when information was last updated.", panel: "Last checked" },
  { Icon: TriangleAlert, title: "Unverified or missing", text: "We label information that is not verified or unavailable.", panel: "Missing information" },
];

const micro = "text-[11px] tracking-[.18em] uppercase text-charcoal/50";
const amber = "text-[#8a6a2a]";

function Status({ status, value }: { status: (typeof FACTS)[number]["status"]; value: string }) {
  if (status === "shown") return <span className="tabular-nums">{value}</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 italic ${status === "unverified" ? amber : "text-charcoal/45"}`}>
      <span className={`size-1.5 rounded-full ${status === "unverified" ? "bg-[#b08a3e]" : "bg-charcoal/25"}`} /> {value}
    </span>
  );
}

function CardPreview({ i }: { i: number }) {
  if (i === 0)
    return (
      <span className="mini flex translate-y-1 items-center gap-2 rounded-[4px] border border-dashed border-charcoal/20 px-2.5 py-2 text-[12px] text-charcoal/55 opacity-40 lit:translate-y-0 lit:opacity-100">
        <Link2Off className="size-3.5 shrink-0" /> No source linked in this example
      </span>
    );
  if (i === 1)
    return (
      <span className="block">
        <span className="relative flex justify-between">
          <span className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-charcoal/10" />
          <span className="mini absolute inset-x-1 top-1/2 h-px origin-left -translate-y-1/2 scale-x-0 bg-forest transition-[scale] duration-700 lit:scale-x-100" />
          {[0, 1, 2].map((d) => (
            <span key={d} className="mini relative size-2 rounded-full border border-forest bg-[#faf9f6] lit:bg-forest" style={{ transitionDelay: `${d * 160}ms` }} />
          ))}
        </span>
        <span className="mini mt-2 block text-[12px] text-charcoal/55 opacity-0 lit:opacity-100" style={{ transitionDelay: "380ms" }}>
          Date unavailable in this example
        </span>
      </span>
    );
  return (
    <span className="flex flex-wrap gap-1.5 text-[12px]">
      {FACTS.filter((f) => f.status !== "shown").map((f) => (
        <span key={f.label} className="rounded-full border border-border px-2 py-0.5">
          <span className="text-charcoal/55">{f.label} · </span>
          <Status status={f.status} value={f.value} />
        </span>
      ))}
    </span>
  );
}

function EvidencePanel({ view, onClose }: { view: number; onClose: () => void }) {
  return (
    <div className="border-t border-border pt-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={micro}>Evidence trail · {CARDS[view].panel}</p>
          <p className="mt-1 text-[15px]">{C.name}, from the illustrative comparison</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close evidence preview" className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-charcoal/60 transition-colors hover:text-charcoal focus-visible:outline-2 focus-visible:outline-forest">
          <X className="size-3.5" />
        </button>
      </div>

      <div key={view} className="mt-5 animate-rise-in">
        {view === 1 ? (
          <ol className="grid gap-4 sm:grid-cols-4 sm:gap-0">
            {TIMELINE.map((step, i) => (
              <li key={step} className="relative flex gap-3 sm:block sm:pr-4">
                <span className="relative mt-1 flex items-center sm:mt-0">
                  <span className="relative z-10 size-2.5 shrink-0 rounded-full border border-forest bg-forest" />
                  {i < TIMELINE.length - 1 && <span className="absolute top-1/2 left-2.5 hidden h-px w-full -translate-y-1/2 bg-forest/30 sm:block" />}
                </span>
                <span className="block sm:mt-3">
                  <span className="block text-[14px]">{step}</span>
                  <span className="mt-0.5 block text-[12px] text-charcoal/45 italic">Date unavailable</span>
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <dl className="divide-y divide-border text-[14px]">
            {FACTS.map((f) => (
              <div key={f.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-0.5 py-2.5 sm:grid-cols-[9rem_minmax(0,1fr)_auto]">
                <dt className="text-charcoal/60">{f.label}</dt>
                <dd className="text-right sm:text-left">
                  <Status status={f.status} value={f.value} />
                </dd>
                <dd className="col-span-2 flex items-center gap-1.5 text-[12px] text-charcoal/45 sm:col-span-1 sm:justify-end">
                  {view === 0 ? (
                    <>
                      <Link2Off className="size-3" /> Source not linked
                    </>
                  ) : f.status === "shown" ? (
                    "Shown as listed"
                  ) : f.status === "unverified" ? (
                    "Not confirmed by a source"
                  ) : (
                    "Not stated in the listing"
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <p className="mt-4 text-[13px] text-charcoal/45">
        Illustrative example. In live results each fact links to its source and shows the date it was last checked; anything we can’t confirm is labelled, never filled in.
      </p>
    </div>
  );
}

export function Trust() {
  const ref = useReveal<HTMLElement>();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section ref={ref} id="trust" className="relative isolate overflow-hidden border-t border-charcoal/10 bg-ivory font-editorial text-charcoal">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-72 sm:h-96 lg:top-10 lg:right-0 lg:left-auto lg:h-[min(46vw,720px)] lg:w-[46%]">
        <div className="photo absolute inset-0 bg-[62%_60%]" style={bg("/images/trust-detail.jpg")} />
        <div className="absolute inset-0 bg-linear-to-t from-ivory via-ivory/40 via-35% to-transparent lg:bg-linear-to-r lg:from-ivory lg:via-ivory/55 lg:via-30% lg:to-transparent lg:to-70%" />
        <div className="absolute inset-0 hidden bg-linear-to-b from-ivory/70 to-transparent to-25% lg:block" />
        <div className="absolute inset-0 hidden bg-linear-to-t from-ivory/80 to-transparent to-25% lg:block" />
      </div>

      <div className="wrap pt-64 pb-20 sm:pt-80 md:pb-28 lg:py-28">
        <div className="lg:w-[60%]">
          <EditorialHead n="04" label="Trust / Evidence" title="Clear sources. Up to date information.">
            Every product fact shows where it came from and when it was last checked.
          </EditorialHead>

          <div className="mt-12 grid gap-3 sm:grid-cols-3 md:mt-14">
            {CARDS.map(({ Icon, title, text }, i) => (
              <div key={title} className="reveal" style={stagger(i + 3)}>
              <button
                type="button"
                data-card
                data-open={open === i || undefined}
                aria-expanded={open === i}
                aria-controls="evidence-trail"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex h-full w-full flex-col items-start rounded-[6px] border border-border bg-[#faf9f6] p-5 text-left shadow-[0_14px_30px_-26px_rgb(13_12_11/.35)] outline-none transition-[translate,box-shadow,border-color] duration-300 ease-soft hover:-translate-y-1 hover:shadow-[0_22px_36px_-26px_rgb(13_12_11/.4)] focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest aria-expanded:-translate-y-1 aria-expanded:border-forest/35 motion-reduce:translate-y-0"
              >
                <Icon className="size-5 text-forest" strokeWidth={1.6} />
                <span className="mt-5 block text-[17px] tracking-[-.02em]">{title}</span>
                <span className="mt-1.5 block text-[14px] leading-relaxed text-charcoal/60">{text}</span>
                <span className="mt-5 block min-h-12 w-full">
                  <CardPreview i={i} />
                </span>
                <span className="mt-4 text-[12px] text-forest">{open === i ? "Hide example" : "See an example"}</span>
              </button>
              </div>
            ))}
          </div>

          <div
            id="evidence-trail"
            inert={open === null}
            className={`grid transition-[grid-template-rows,opacity] duration-500 ease-soft motion-reduce:transition-none ${open === null ? "grid-rows-[0fr] opacity-0" : "mt-8 grid-rows-[1fr] opacity-100"}`}
          >
            <div className="min-h-0 overflow-hidden">{open !== null && <EvidencePanel view={open} onClose={() => setOpen(null)} />}</div>
          </div>

          <a href="#faq" className="group/link reveal mt-10 inline-flex items-center gap-2 text-[15px] text-forest" style={stagger(6)}>
            Our approach to evidence
            <ArrowRight className="size-4 transition-transform duration-300 ease-soft group-hover/link:translate-x-1 group-focus-visible/link:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}
