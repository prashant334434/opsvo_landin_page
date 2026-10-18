"use client";

import { useRef, useState } from "react";
import { ArrowRight, ChartColumn, Check, Scale, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { ModalButton } from "./Modal";
import { useReveal, useTilt } from "./motion";
import { EditorialHead, bg, stagger } from "./ui";

/*
 * Two-column composition: copy and benefits left; a stable product scene right
 * with a tilting retailer-preview card overlapping its plinth. The chart is
 * illustrative only (no axes, no figures) and grows once on first view.
 */

const BENEFITS = [
  { Icon: Users, title: "Quality traffic", text: "Relevant shoppers, not just browsers." },
  { Icon: ChartColumn, title: "Transparent comparison", text: "Your product details shown fairly." },
  { Icon: ShieldCheck, title: "Build customer trust", text: "Clear sources and accurate information." },
  { Icon: TrendingUp, title: "Measurable impact", text: "Understand performance with simple insights." },
];

const ROWS = [
  { Icon: Users, label: "High-intent shoppers" },
  { Icon: Check, label: "Clear product details" },
  { Icon: Scale, label: "Fair comparisons" },
  { Icon: TrendingUp, label: "More qualified traffic" },
];

const BARS = [28, 40, 34, 52, 64, 86]; // relative heights only; not data

export function Retailers() {
  const section = useReveal<HTMLElement>();
  const chartArea = useReveal<HTMLDivElement>();
  const card = useRef<HTMLDivElement>(null);
  const [lifted, setLifted] = useState(false);
  useTilt(card, 4);

  return (
    <section ref={section} id="retailers" className="overflow-hidden border-t border-charcoal/10 bg-ivory font-editorial text-charcoal">
      <div className="wrap grid items-center gap-14 py-20 md:py-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
        <div>
          <EditorialHead n="05" label="For retailers" title="Reach shoppers with clear intent.">
            Opsvo helps people discover products that fit, with transparency and trust. Partner with us to showcase your products to high-intent buyers.
          </EditorialHead>
          <div className="reveal mt-8" style={stagger(3)}>
            <ModalButton
              className="group/cta inline-flex h-12 items-center gap-2.5 rounded-full bg-forest px-6 text-[15px] text-ivory transition-colors hover:bg-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
            >
              Partner with us <ArrowRight className="size-4 transition-transform duration-300 ease-soft group-hover/cta:translate-x-1" />
            </ModalButton>
          </div>

          <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-border pt-8 xl:grid-cols-4 xl:gap-x-5">
            {BENEFITS.map(({ Icon, title, text }, i) => (
              <li key={title} className="reveal" style={stagger(i + 4)}>
                <Icon className="size-[18px] text-forest" strokeWidth={1.6} />
                <h3 className="mt-3 text-[15px] leading-snug tracking-[-.01em]">{title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-charcoal/60">{text}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Product scene stays flat and undistorted; only the preview card tilts. */}
        <div className="reveal relative lg:pl-[10%]" style={stagger(3)}>
          <div role="img" aria-label="Forest green cabin suitcase on a travertine plinth beneath stone arches" className="photo aspect-[4/3] rounded-[6px] bg-[center_40%]" style={bg("/images/retailers-scene.jpg")} />

          {/* Overlaps only plinth and floor: the suitcase sits at ~36–63% across, wheels at ~85% down. */}
          <div ref={chartArea} className="relative z-10 mx-4 -mt-6 perspective-[1100px] sm:mx-auto sm:w-[min(340px,80%)] lg:absolute lg:bottom-[-6%] lg:left-[-6%] lg:mx-0 lg:mt-0 lg:w-[min(300px,42%)]">
            <div
              ref={card}
              tabIndex={0}
              aria-label="Illustrative retailer preview"
              data-open={lifted || undefined}
              onPointerUp={(e) => e.pointerType !== "mouse" && setLifted((v) => !v)}
              // Keyboard focus and a tap get a fixed, gentle tilt in place of the pointer.
              className="tilt rounded-[6px] border border-border bg-[#faf9f6] p-4 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest motion-safe:focus-visible:[--rx:3] motion-safe:focus-visible:[--ry:-4] motion-safe:data-open:[--rx:3] motion-safe:data-open:[--ry:-4]"
            >
              <div className="translate-z-3">
                <p className="text-[10px] tracking-[.16em] text-charcoal/45 uppercase">Illustrative preview</p>
                <p className="mt-1 text-[14px] tracking-[-.01em]">Retailer preview</p>
              </div>

              <div className="mt-3 grid grid-cols-[72px_minmax(0,1fr)] gap-3 transform-3d">
                <div className="photo aspect-square rounded-[4px] bg-[center_35%] translate-z-6" style={bg("/images/compare-stage.jpg")} />
                <div aria-hidden="true" className="flex h-[72px] items-end justify-between gap-1.5 rounded-[4px] bg-sand/60 px-2.5 pt-3 pb-2 translate-z-10">
                  {BARS.map((h, i) => (
                    <span
                      key={i}
                      className={`w-full origin-bottom rounded-t-[2px] transition-[scale] duration-700 ease-soft in-data-[reveal=pending]:scale-y-0 ${i === BARS.length - 1 ? "bg-forest" : "bg-forest/35"}`}
                      style={{ height: `${h}%`, transitionDelay: `${300 + i * 70}ms` }}
                    />
                  ))}
                </div>
              </div>

              <ul className="mt-3 divide-y divide-border border-t border-border translate-z-3">
                {ROWS.map(({ Icon, label }) => (
                  <li key={label} className="flex items-center gap-2.5 py-2 text-[13px] text-charcoal/75">
                    <Icon className="size-3.5 text-forest" strokeWidth={1.8} /> {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
