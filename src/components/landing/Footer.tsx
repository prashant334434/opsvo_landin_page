"use client";

import { useReveal } from "./motion";
import { stagger } from "./ui";

export function Footer() {
  const ref = useReveal<HTMLElement>();

  return (
    <footer ref={ref} className="border-t border-charcoal/10 bg-ivory font-editorial text-charcoal">
      <div className="wrap pt-20 pb-10 md:pt-28 md:pb-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
          <div className="reveal">
            <a
              href="#main"
              className="inline-flex min-h-11 items-center rounded-sm text-[clamp(2.75rem,6vw,4.5rem)] leading-none font-medium tracking-[-.05em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest"
            >
              Opsvo
            </a>
            <p className="mt-4 text-[17px] tracking-[-.01em] text-charcoal/70">Say what you need. See why it fits.</p>
          </div>
          <p className="reveal text-[15px] text-charcoal/55 md:pb-1" style={stagger(1)}>
            Made for smarter shopping.
          </p>
        </div>

        <div className="reveal mt-14 border-t border-border pt-6 md:mt-20" style={stagger(2)}>
          <p className="text-[13px] text-charcoal/45">© 2026 Opsvo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
