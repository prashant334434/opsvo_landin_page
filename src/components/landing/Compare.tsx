"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, Check, Heart } from "lucide-react";
import { useReveal, useTilt } from "./motion";
import { EditorialHead, bg, stagger } from "./ui";

/*
 * Showroom + comparison, copy from content.md. Bracketed placeholders there are
 * filled with plausible illustrative values (prices under the doc's ₹15,000
 * example budget; A is the heaviest, as its "worth knowing" notes say).
 * Only Option A has imagery (a still from the hero film); B and C show an
 * explicit no-image state instead of a generated picture.
 */

type Cell = string | { text: string; tone: "ok" | "missing" };
type Option = {
  name: string; price: string; weight: string; fits: boolean; warranty: string | null; delivery: string; note: string;
  image?: string; whyItFits?: string[]; worthKnowing?: string[]; source?: string;
};

const UNAVAILABLE: Cell = { text: "Unavailable", tone: "missing" };
export const OPTIONS: Option[] = [
  {
    name: "Option A", price: "₹8,999", weight: "3.4 kg", fits: true, warranty: "2 years", delivery: "Est. 16–18 Oct", note: "Heaviest of the three",
    image: "/images/compare-stage.jpg",
    whyItFits: ["Within budget.", "Meets the 55 x 35 x 20 cm cabin limit.", "Four-wheel design."],
    worthKnowing: ["Heavier than Option B.", "Delivery date not yet confirmed by the retailer."],
    source: "Price and size listed by Travelkart, checked 14 Oct 2026.",
  },
  { name: "Option B", price: "₹10,499", weight: "2.6 kg", fits: true, warranty: "3 years", delivery: "Est. 17–20 Oct", note: "No external pocket" },
  { name: "Option C", price: "₹12,999", weight: "3.1 kg", fits: false, warranty: null, delivery: "Est. 20–24 Oct", note: "Size listed without wheels" },
];

const ROWS: { label: string; why: string; get: (o: Option) => Cell }[] = [
  { label: "Price", why: "The listed price in this example. Prices change, so live results show when each was last checked.", get: (o) => o.price },
  { label: "Weight", why: "Empty weight as listed. A lighter case leaves more of your allowance for packing.", get: (o) => o.weight },
  { label: "Fits cabin limit", why: "Whether the listed dimensions fit a 55 x 35 x 20 cm cabin limit.", get: (o) => (o.fits ? { text: "Yes", tone: "ok" } : { text: "Not verified", tone: "missing" }) },
  { label: "Warranty", why: "Warranty length, where the listing states one.", get: (o) => o.warranty ?? UNAVAILABLE },
  { label: "Delivery", why: "The estimated delivery window from the listing.", get: (o) => o.delivery },
  { label: "Worth knowing", why: "The trade-off most likely to change your mind about this option.", get: (o) => o.note },
];

// Visible features only, as % of the stage still (960×1080).
const LABELS = [
  { text: "Telescopic handle", x: 54, y: 17, side: "r" },
  { text: "Ribbed shell", x: 37.5, y: 48, side: "l" },
  { text: "Side carry handle", x: 65, y: 56, side: "r" },
  { text: "Spinner wheels", x: 53.5, y: 81.5, side: "l" },
] as const;

const micro = "text-[11px] tracking-[.18em] uppercase text-charcoal/50";

function Value({ v }: { v: Cell }) {
  if (typeof v === "string") return <>{v}</>;
  return v.tone === "ok" ? (
    <span className="inline-flex items-center gap-1.5 text-forest">
      <Check className="size-3.5" strokeWidth={2.25} /> {v.text}
    </span>
  ) : (
    <span className="text-charcoal/45 italic">{v.text}</span>
  );
}

export function Compare() {
  const section = useReveal<HTMLElement>();
  const stage = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [sel, setSel] = useState(0);
  const [col, setCol] = useState<number | null>(null);
  const [row, setRow] = useState<number | null>(null);
  const [saved, setSaved] = useState([false, false, false]);
  useTilt(stage, 3.5);

  const o = OPTIONS[sel];
  // Arrow keys move between options, like a segmented control.
  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (i + d + OPTIONS.length) % OPTIONS.length;
    setSel(next);
    buttons.current[next]?.focus();
  };
  const colTint = (i: number) => (sel === i ? "bg-forest/[.06]" : col === i ? "bg-charcoal/[.025]" : "");

  return (
    <section ref={section} id="compare" className="border-t border-charcoal/10 bg-ivory font-editorial text-charcoal">
      <div className="wrap py-20 md:py-28">
        <EditorialHead n="03" label="Compare" title="The differences that matter, side by side">
          Opsvo highlights the attributes that separate your options and quietly drops the ones that don’t. Missing information is labelled as unavailable, never guessed.
        </EditorialHead>

        <div className="mt-14 grid items-start gap-12 md:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-16">
          {/* Showroom stage: tilts as a whole; the image layer parallaxes inside it. */}
          <div className="reveal min-w-0 perspective-[1400px]" style={stagger(3)}>
            <div ref={stage} className="tilt relative rounded-[6px]">
              <div className="relative aspect-[8/9] overflow-hidden rounded-[6px] bg-sand">
                {OPTIONS.map((opt, i) => (
                  <div key={opt.name} aria-hidden={i !== sel} className={`absolute inset-0 transition-opacity duration-500 ease-soft ${i === sel ? "opacity-100" : "opacity-0"}`}>
                    {opt.image ? (
                      <div className="absolute -inset-3" style={{ translate: "calc(var(--px, 0) * -8px) calc(var(--py, 0) * -8px)" }}>
                        <div role="img" aria-label="Forest green ribbed cabin suitcase on a travertine plinth" className="photo absolute inset-0" style={bg(opt.image)} />
                        {LABELS.map((l, k) => (
                          <span key={l.text} aria-hidden="true" className="absolute size-0 max-sm:hidden" style={{ left: `${l.x}%`, top: `${l.y}%` }}>
                            <span className="absolute size-2 -translate-1/2 rounded-full border border-ivory bg-forest" />
                            <span className={`absolute top-0 h-px w-9 bg-ivory/90 ${l.side === "l" ? "right-1.5" : "left-1.5"}`} />
                            <span
                              className={`absolute top-0 -translate-y-1/2 bg-ivory px-2 py-1 text-[10px] tracking-[.14em] whitespace-nowrap text-charcoal uppercase transition-opacity duration-500 ${l.side === "l" ? "right-11" : "left-11"} ${sel === i ? "opacity-100" : "opacity-0"}`}
                              style={{ transitionDelay: sel === i ? `${200 + k * 90}ms` : "0ms" }}
                            >
                              {l.text}
                            </span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="grid h-full place-content-center gap-4 p-8 text-center">
                        <p className={micro}>No image in this example</p>
                        <p className="text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-[-.04em]">{opt.name}</p>
                        <p className="text-charcoal/60 tabular-nums">
                          {opt.price} · {opt.weight}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                {/* Soft top light, consistent with the hero's daylight. */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_0%,rgb(255_255_255/.16),transparent_65%)]" />
              </div>

              {/* Detail plate overlaps only the plinth's front edge and floats above the tilt. */}
              <div aria-live="polite" className="relative mx-3 -mt-10 rounded-[4px] border border-border bg-[#faf9f6] p-5 shadow-[0_18px_40px_-30px_rgb(13_12_11/.35)] translate-z-8 sm:mx-5">
                {/* Sample shortlist card (content.md). Option A carries the full card copy;
                    B and C show what the table says about them. */}
                <div key={sel} className="animate-rise-in">
                  <p className={micro}>Illustrative example</p>
                  <div className="mt-1.5 flex items-start justify-between gap-4">
                    <h3 className="text-2xl tracking-[-.03em]">{`Cabin suitcase, ${o.name}`}</h3>
                    <p className="text-2xl tracking-[-.02em] tabular-nums">{o.price}</p>
                  </div>

                  {o.whyItFits && (
                    <div className="mt-4">
                      <h4 className="text-[13px] text-charcoal/50">Why it fits</h4>
                      <ul className="mt-1.5 space-y-1 text-[15px]">
                        {o.whyItFits.map((t) => (
                          <li key={t} className="flex gap-2">
                            <Check className="mt-1 size-3.5 shrink-0 text-forest" strokeWidth={2.25} /> {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-4">
                    <h4 className="text-[13px] text-charcoal/50">Worth knowing</h4>
                    <ul className="mt-1.5 space-y-1 text-[15px] text-charcoal/70">
                      {(o.worthKnowing ?? [o.note]).map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                  {o.source && <p className="mt-4 text-[13px] text-charcoal/50">{o.source}</p>}

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => buttons.current[sel]?.focus()}
                      className="h-10 rounded-full bg-charcoal px-4 text-sm text-ivory transition-colors hover:bg-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                    >
                      Compare
                    </button>
                    <button
                      type="button"
                      onClick={() => setSaved((s) => s.map((v, i) => (i === sel ? !v : v)))}
                      aria-pressed={saved[sel]}
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm text-forest transition-colors hover:border-charcoal/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                    >
                      <Heart className="size-4" fill={saved[sel] ? "currentColor" : "none"} /> {saved[sel] ? "Saved" : "Save"}
                    </button>
                    {/* No real retailer link exists for illustrative data, so this stays inert and says why. */}
                    <button
                      type="button"
                      aria-disabled="true"
                      aria-describedby="retailer-note"
                      className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-full border border-border px-4 text-sm text-charcoal/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                    >
                      Continue to retailer <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                  <p id="retailer-note" className="mt-2 text-[12px] text-charcoal/45">Retailer link not available in this example.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison: three selectable columns; rows explain themselves on hover/focus.
              min-w-0 keeps the 520px table scrolling inside its region instead of widening the page. */}
          <div id="compare-table" className="reveal min-w-0 scroll-mt-28" style={stagger(4)}>
            <p className={`${micro} mb-4`}>Illustrative example</p>
            <div role="region" aria-label="Comparison of three illustrative options" tabIndex={0} className="overflow-x-auto outline-none focus-visible:outline-2 focus-visible:outline-forest">
              <table className="w-full min-w-[520px] border-collapse text-left text-[15px]" onMouseLeave={() => setCol(null)}>
                <caption className="sr-only">Illustrative comparison of three cabin suitcases. Choose an option to show it on the product stage.</caption>
                <thead>
                  <tr>
                    <th scope="col" className="sticky left-0 z-10 w-[28%] bg-ivory pb-3 align-bottom font-normal">
                      <span className={micro}>Attribute</span>
                    </th>
                    {OPTIONS.map((opt, i) => (
                      <th key={opt.name} scope="col" className={`p-0 align-bottom font-normal transition-colors duration-300 ${colTint(i)}`} onMouseEnter={() => setCol(i)}>
                        <button
                          ref={(n) => { buttons.current[i] = n; }}
                          type="button"
                          aria-pressed={sel === i}
                          onClick={() => setSel(i)}
                          onKeyDown={(e) => onKey(e, i)}
                          className={`w-full px-3 pt-0 pb-3 text-left transition-colors outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-forest ${sel === i ? "text-charcoal" : "text-charcoal/55 hover:text-charcoal"}`}
                        >
                          <span className={`block h-0.5 origin-left bg-forest transition-transform duration-500 ease-soft ${sel === i ? "scale-x-100" : "scale-x-0"}`} />
                          <span className="mt-4 block text-[17px] tracking-[-.02em]">{opt.name}</span>
                          <span className="mt-0.5 block text-xs text-charcoal/50">{sel === i ? "On stage" : "Show on stage"}</span>
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r, ri) => (
                    <tr
                      key={r.label}
                      tabIndex={0}
                      onMouseEnter={() => setRow(ri)}
                      onMouseLeave={() => setRow(null)}
                      onFocus={() => setRow(ri)}
                      onBlur={() => setRow(null)}
                      className="group/row border-t border-border outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-forest"
                    >
                      <th scope="row" className="sticky left-0 bg-ivory py-3.5 pr-3 font-normal text-charcoal/60 transition-colors group-hover/row:bg-[#f7f6f2] group-hover/row:text-charcoal">
                        {r.label}
                        <span className="sr-only">. {r.why}</span>
                      </th>
                      {OPTIONS.map((opt, i) => (
                        <td key={opt.name} onMouseEnter={() => setCol(i)} className={`px-3 py-3.5 tabular-nums transition-colors duration-300 group-hover/row:bg-white/60 ${colTint(i)}`}>
                          <Value v={r.get(opt)} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Visual explanation slot; screen readers get each row's explanation inline. */}
            <p aria-hidden="true" className="mt-6 min-h-[4.5em] border-t border-border pt-4 text-[15px] text-charcoal/60">
              {row === null ? (
                "Hover or focus a row to see why it matters. Choose an option to bring it to the stage."
              ) : (
                <span key={row} className="block animate-rise-in">
                  <span className="text-charcoal">{ROWS[row].label}.</span> {ROWS[row].why}
                </span>
              )}
            </p>
            <p className="mt-4 text-[13px] text-charcoal/45">
              Prices and availability come from the retailer and can change. Opsvo shows when each was last checked.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
