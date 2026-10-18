"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { ModalButton } from "./Modal";
import { useReveal, useTilt } from "./motion";
import { EditorialHead, bg, stagger } from "./ui";

/*
 * Questions and answers from content.md. The last three are placeholders there
 * ("unresolved on our side"); the answers below are short stand-ins marked
 * "Placeholder" and must be confirmed before launch.
 */
const FAQS = [
  { id: "what-is-opsvo", q: "What is Opsvo?", a: "An AI shopping companion. You describe what you need, and it returns a short list of suitable products with reasons, comparisons and sources." },
  { id: "does-opsvo-buy", q: "Does Opsvo buy things for me?", a: "No, not without your approval. Opsvo hands you to the retailer to complete your purchase. Any action that spends money or shares your details needs your explicit confirmation first." },
  { id: "product-sources", q: "Where do prices and product details come from?", a: "From retailers and other sources Opsvo can access. Each fact shows its source and when it was last checked. Prices and stock can change, so the retailer’s checkout is final." },
  { id: "product-ranking", q: "How are products ranked?", a: "By how well they match the requirements you gave." },
  // Placeholder: data use, retention and deletion; link the privacy policy once it exists.
  { id: "data-use", q: "What happens to what I tell it?", a: "Opsvo uses what you type to find and explain matches. It isn’t sold, and you can ask for it to be deleted. The privacy policy will set out exactly what is kept and for how long." },
  // Placeholder: launch retailers, categories and countries.
  { id: "coverage", q: "Which stores and categories are covered?", a: "At launch, Opsvo covers travel gear from a small set of retailers in India. More categories and stores will follow." },
  // Placeholder: pricing.
  { id: "cost", q: "How much does it cost?", a: "Free during early access." },
];

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
const pill = "inline-flex h-11 items-center gap-2 rounded-full px-5 text-[15px] transition-[translate,background-color,border-color,color] duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest motion-reduce:hover:translate-y-0";

export function Faq() {
  const section = useReveal<HTMLElement>();
  const stage = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null); // closed by default; one open at a time
  useTilt(stage, 0); // parallax vars only; no rotation (fine pointers, motion allowed)

  // Links such as #faq-cost open their answer.
  useEffect(() => {
    const sync = () => {
      const id = location.hash.replace("#faq-", "");
      if (!FAQS.some((f) => f.id === id)) return;
      setQuery("");
      setOpen(id);
    };
    const raf = requestAnimationFrame(sync);
    addEventListener("hashchange", sync);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("hashchange", sync);
    };
  }, []);

  const q = norm(query.trim());
  const shown = FAQS.filter((f) => norm(`${f.q} ${f.a}`).includes(q));
  const clear = () => {
    setQuery("");
    input.current?.focus();
  };
  // Arrow keys, Home and End move between questions (WAI-ARIA accordion pattern).
  const move = (e: KeyboardEvent<HTMLButtonElement>) => {
    const all = [...document.querySelectorAll<HTMLButtonElement>("[data-faq-trigger]")];
    const i = all.indexOf(e.currentTarget);
    const to = ({ ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: all.length - 1 } as Record<string, number>)[e.key];
    if (to === undefined) return;
    e.preventDefault();
    all[(to + all.length) % all.length]?.focus();
  };

  return (
    <section ref={section} id="faq" className="border-t border-charcoal/10 bg-ivory font-editorial text-charcoal">
      <div className="wrap grid gap-14 py-20 md:py-28 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div>
          <EditorialHead n="06" label="FAQ" title="Questions? We’ve got answers.">
            The most common questions about how Opsvo works. Can’t find yours? We’re happy to help.
          </EditorialHead>

          {/* Image layer drifts a few px under the pointer; the card counter-drifts for depth. */}
          <div ref={stage} className="reveal relative mt-12" style={stagger(3)}>
            {/* Crops keep the whole suitcase (~20–76% down the still) in frame at every width. */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-sand md:aspect-[3/2] lg:aspect-[4/5]">
              <div
                role="img"
                aria-label="Forest green cabin suitcase on a travertine plinth beneath stone arches"
                className="photo absolute -inset-3 bg-[center_50%]"
                style={{ ...bg("/images/faq-tall.jpg"), translate: "calc(var(--px, 0) * -8px) calc(var(--py, 0) * -6px)" }}
              />
            </div>
            <div
              // Floats over the plinth only on desktop's tall crop; below the image elsewhere so it never covers the suitcase.
              className="relative mt-3 flex flex-col gap-4 rounded-[8px] border border-border bg-[#faf9f6]/95 p-5 shadow-[0_18px_40px_-28px_rgb(13_12_11/.4)] sm:flex-row sm:items-center sm:justify-between lg:absolute lg:inset-x-5 lg:bottom-5 lg:mt-0"
              style={{ translate: "calc(var(--px, 0) * 4px) calc(var(--py, 0) * 3px)" }}
            >
              <div>
                <p className="text-[17px] tracking-[-.01em]">Still have questions?</p>
                <p className="mt-1 text-[14px] text-charcoal/60">We’re here to help you make smarter choices.</p>
              </div>
              <ModalButton className={`${pill} shrink-0 self-start bg-forest text-ivory hover:bg-charcoal sm:self-auto`}>
                Contact us <ArrowRight className="size-4" />
              </ModalButton>
            </div>
          </div>
        </div>

        <div className="reveal min-w-0 lg:pt-2" style={stagger(4)}>
          <div role="search" className="relative">
            <label htmlFor="faq-search" className="sr-only">Search questions</label>
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-charcoal/45" />
            <input
              ref={input}
              id="faq-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setQuery("")}
              placeholder="Search questions"
              autoComplete="off"
              aria-describedby="faq-count"
              className="h-13 w-full rounded-full border border-border bg-[#faf9f6] pr-14 pl-12 text-[16px] outline-none transition-colors placeholder:text-charcoal/40 focus:border-forest/60 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button type="button" onClick={clear} aria-label="Clear search" className="absolute top-1/2 right-2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-charcoal/55 transition-colors hover:bg-charcoal/5 hover:text-charcoal focus-visible:outline-2 focus-visible:outline-forest">
                <X className="size-4" />
              </button>
            )}
          </div>
          <p id="faq-count" aria-live="polite" className="mt-3 pl-5 text-[13px] text-charcoal/50">
            {q ? `${shown.length} of ${FAQS.length} questions match` : `${FAQS.length} questions`}
          </p>

          {shown.length ? (
            <div className="mt-6 border-t border-border">
              {shown.map((f) => {
                const isOpen = open === f.id;
                return (
                  <div key={f.id} id={`faq-${f.id}`} className="scroll-mt-28 border-b border-border">
                    <h3>
                      <button
                        type="button"
                        data-faq-trigger
                        id={`faq-q-${f.id}`}
                        aria-expanded={isOpen}
                        aria-controls={`faq-a-${f.id}`}
                        onClick={() => setOpen(isOpen ? null : f.id)}
                        onKeyDown={move}
                        className={`group/q flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left text-[17px] tracking-[-.015em] outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest md:text-lg ${isOpen ? "text-forest" : "hover:text-forest"}`}
                      >
                        {f.q}
                        {/* Plus: the vertical stroke rotates flat into a minus. */}
                        <span
                          aria-hidden="true"
                          className={`relative grid size-9 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${isOpen ? "border-forest bg-forest text-ivory" : "border-border text-charcoal group-hover/q:border-charcoal/30"}`}
                        >
                          <span className="absolute h-px w-3.5 bg-current" />
                          <span className={`absolute h-3.5 w-px bg-current transition-transform duration-300 ease-soft motion-reduce:transition-none ${isOpen ? "rotate-90" : ""}`} />
                        </span>
                      </button>
                    </h3>
                    <div
                      id={`faq-a-${f.id}`}
                      role="region"
                      aria-labelledby={`faq-q-${f.id}`}
                      inert={!isOpen}
                      className={`grid transition-[grid-template-rows,opacity] duration-[420ms] ease-soft motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <p className="max-w-[60ch] pr-14 pb-6 text-[15px] leading-relaxed text-charcoal/65">{f.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 border-y border-border py-12 text-center">
              <p className="text-lg tracking-[-.01em]">No questions match “{query.trim()}”.</p>
              <p className="mt-2 text-[15px] text-charcoal/60">Try a different word, or ask us directly.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={clear} className={`${pill} border border-border hover:border-charcoal/30`}>
                  Clear search
                </button>
                <ModalButton className={`${pill} bg-forest text-ivory hover:bg-charcoal`}>
                  Contact us <ArrowRight className="size-4" />
                </ModalButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
