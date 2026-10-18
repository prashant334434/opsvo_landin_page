# Design tokens

These are real, from our design doc. Define them as tokens. The doc is explicit: "Define
everything below as tokens, not hard-coded values."

Paste-ready:

```css
:root {
  /* colour */
  --color-canvas: #F7F7F5;          /* page background */
  --color-surface: #FFFFFF;         /* cards and panels */
  --color-surface-subtle: #F0F0ED;  /* secondary surfaces */
  --color-text-primary: #20211F;    /* main text */
  --color-text-secondary: #686A65;  /* supporting text */
  --color-border: #DEDFDA;          /* dividers and outlines */
  --color-accent: #34483D;          /* primary buttons, links, focus */
  --color-accent-hover: #293A31;
  --color-success: #35664A;          /* form success */
  --color-warning: #8A5A19;          /* "Not verified" labels */
  --color-danger: #A43F38;           /* form errors */

  /* type scale */
  --type-display: 2.5rem;    /* hero H1: 40 to 48px desktop, ~32px mobile */
  --type-h2: 1.5rem;         /* 24px */
  --type-h3: 1.125rem;       /* 18 to 20px */
  --type-body: 1rem;         /* 15 to 16px */
  --type-secondary: 0.875rem;/* 13 to 14px */
  --type-label: 0.75rem;     /* 12 to 13px */

  /* spacing scale: 4 8 12 16 24 32 40 48 64 80 96 */
  --space-1: 0.25rem; --space-2: 0.5rem;  --space-3: 0.75rem;
  --space-4: 1rem;    --space-6: 1.5rem;  --space-8: 2rem;
  --space-10: 2.5rem; --space-12: 3rem;   --space-16: 4rem;
  --space-20: 5rem;   --space-24: 6rem;

  /* shape: 4, 8, 12px. No pill buttons. */
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px;

  /* motion: one easing curve throughout */
  --ease: cubic-bezier(0.2, 0, 0.3, 1);
  --duration-hover: 120ms;      /* hover: 100 to 160ms */
  --duration-transition: 180ms; /* small transitions: 140 to 220ms */
}
```

## Type and layout

- **Font:** system sans-serif stack, or a licensed neutral sans. **Tabular numerals for
  prices.**
- **Sentence case everywhere.** Avoid all-caps labels and wide letter spacing.
- Centred content column, max width around 1200px. Body text lines to about 70 characters.
- Between sections: 64 to 96px desktop, 40 to 64px mobile.
- Touch targets at least 44 x 44px.

## The look

Calm and product-led: plenty of space, thin borders, one green accent. **No gradients,
glows or sparkle icons.**

## Accessibility target

WCAG 2.2 AA. Visible focus states, full keyboard use, semantic headings and landmarks.

Two ratios already checked, so you can rely on them: supporting text on canvas is 5.1:1,
and white on the accent button is 9.8:1. Both clear AA.

**Never use colour alone for status.** "Not verified" and "Unavailable" are written labels.

## One known gap

`--color-border` at `#DEDFDA` is only 1.25:1 against the canvas. That is fine for a
decorative divider, but it is below the 3:1 that WCAG 2.2 AA asks for when a border is the
only thing identifying a control. If you need a border on an interactive element, use
`#8A8C84` instead and mention it in your README. Spotting this unprompted is a bonus, not
a requirement.
