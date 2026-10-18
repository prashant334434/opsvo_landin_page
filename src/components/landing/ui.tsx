// Image placeholders: drop files into /public/images with these names.
export const bg = (src: string) => ({ backgroundImage: `url(${src})` });

/** Entrance order for `.reveal` elements. */
export const stagger = (i: number) => ({ "--i": i }) as React.CSSProperties;

type HeadProps = { n: string; label: string; title: string; aside?: React.ReactNode; children: React.ReactNode };

/** Section heading in the hero's editorial voice (Inter Tight, ivory/forest). */
export function EditorialHead({ n, label, title, aside, children }: HeadProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
      <div className="max-w-2xl">
        <p className="reveal text-[11px] font-medium tracking-[.2em] text-forest uppercase">
          {n} — {label}
        </p>
        <h2 className="reveal mt-5 text-[clamp(2.25rem,4.6vw,4rem)] leading-none font-normal tracking-[-.04em] text-balance" style={stagger(1)}>
          {title}
        </h2>
        <p className="reveal mt-5 max-w-[46ch] text-base text-charcoal/65 md:text-lg" style={stagger(2)}>
          {children}
        </p>
      </div>
      {aside}
    </header>
  );
}
