# Opsvo frontend take-home

Next.js 16 (App Router), TypeScript, Tailwind CSS v4.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

Optional: set `NEXT_PUBLIC_SITE_URL` (for example `https://opsvo.example`) so the Open Graph
image resolves to an absolute URL. It falls back to `http://localhost:3000`.

The brief I worked from is in [`brief/`](brief/).

## Where to look

| Part | Files |
|---|---|
| 1. Compare | [`src/components/landing/Compare.tsx`](src/components/landing/Compare.tsx) |
| 2. FAQ | [`src/components/landing/Faq.tsx`](src/components/landing/Faq.tsx) |
| 3. Nav, skip link | [`src/components/SiteHeader.tsx`](src/components/SiteHeader.tsx), [`src/content.ts`](src/content.ts) |
| 3. SEO | [`src/app/layout.tsx`](src/app/layout.tsx) |
| Tokens | [`src/app/globals.css`](src/app/globals.css) |

## A note on scope

The brief asks for two sections and placeholders for the rest. This repo builds all of them:
hero, how it works, trust, retailers and footer included. That is outside the brief, and I
don't expect it to earn credit. Please judge Parts 1 to 3 on the files above. Where the extra
work conflicts with the tokens (see "Where this departs from the tokens"), the tokens are
right and the extra work is wrong.

## Placeholder values

Every `[bracket]` in `content.md` is replaced; none reach the page.

| Field | A | B | C |
|---|---|---|---|
| Price | ₹8,999 | ₹10,499 | ₹12,999 |
| Weight | 3.4 kg | 2.6 kg | 3.1 kg |
| Warranty | 2 years | 3 years | Unavailable |
| Delivery | Est. 16–18 Oct | Est. 17–20 Oct | Est. 20–24 Oct |

- Prices sit under the ₹15,000 budget from the hero's example prompt.
- Weights make Option A the heaviest, so the table's "Heaviest of the three" and the card's
  "Heavier than Option B" are both true.
- Source line: "Price and size listed by Travelkart, checked 14 Oct 2026." Travelkart is
  fictional.
- The last three FAQ answers are short stand-ins, marked as placeholders in the code.

## Part 1: the table on narrow screens

**What it does now:** below the desktop layout, the table scrolls sideways inside its own
labelled, focusable region, with the attribute column pinned. That **does not meet** the
brief's requirement to stack each option as a card, so this is the first thing I'd change.

**What I considered first:**

1. Keep one `<table>` and restyle it as cards with CSS (`display: block` on rows and cells
   below a breakpoint). It is one source of truth, but changing table display values strips
   table semantics in some screen readers, so it needs testing with VoiceOver and NVDA.
2. Render the data twice from the same array: a real `<table>` from the breakpoint up, and
   below it a list of option cards, each a `<dl>` of attribute and value. The markup is
   duplicated, but each version is semantically correct for its layout, and only one is
   visible (and in the accessibility tree) at a time.

I'd take option 2. It is the most predictable for assistive tech, the duplication is one
`map` over the same `OPTIONS` data, and the cards keep "Not verified" and "Unavailable" as
written text.

What already meets Part 1:

- Status is text, not colour: "Yes" with an icon, and "Not verified" and "Unavailable" as
  written words. The icon is decorative.
- Prices use tabular numerals.
- "Illustrative example" appears on both the card and the table.

## Part 2: the accordion

- Each question is a `<button>` inside an `<h3>`, with `aria-expanded` and `aria-controls`
  pointing at its answer.
- Each answer is a `role="region"` labelled by its question. Closed answers are `inert`, so
  they are hidden from assistive tech and out of the tab order while the height animation
  runs.
- Closed by default. One answer is open at a time.
- Enter and Space work natively, because these are real buttons. Arrow Up and Down move
  between questions (wrapping at the ends), and Home and End jump to the first and last.
  This follows the WAI-ARIA accordion pattern.
- Focus is visible: a 2px accent outline with an offset.
- Under `prefers-reduced-motion`, the open and close transitions are turned off.

I also added two extras that the brief didn't ask for: a live search that filters the
questions (with an empty state and a clear button), and deep links such as `#faq-cost` that
open the matching answer.

**How it was tested:** with scripted keyboard input in headless Chrome, driven over the
DevTools protocol. Each run checked that:

- `aria-expanded` is false on every button at load;
- Arrow, Home and End move focus as expected;
- Enter opens an answer and Space closes it, with only one open at a time;
- each answer region is `inert` exactly when its button is collapsed.

To check by hand: Tab to the first question, press Enter, then use the arrow keys, Home and
End, and confirm the focus ring is always visible.

## Part 3: nav and SEO

- **Nav:** the five anchors come from `content.ts`, with Sign in and the primary button. The
  wordmark is set as text.
- **Skip link:** "Skip to main content" is the first link in the header and targets
  `<main id="main">`. While the load intro is on screen, its "Skip intro" button comes first
  in the tab order.
- **Metadata:** title, meta description, and Open Graph title, description and image
  (1200 x 630) use the exact copy from `content.md`. They are rendered in the server HTML, so
  crawlers and link previews see them without JavaScript. `/og/hero.png` is referenced but
  deliberately missing, as the brief says.

## Part 4: review of `review-me.tsx`

Ranked by impact on a real visitor.

1. **The FAQ can't be used with a keyboard or a screen reader.** Each question is a `<div>`
   with `onClick`: it can't be focused, has no role, and announces nothing about being open
   or closed. For those visitors the answers don't exist. Fix: put a `<button>` with
   `aria-expanded` and `aria-controls` inside a heading, and give the answer an `id` (and
   `role="region"` labelled by the button).

2. **"Fits cabin limit" is colour only, and Option C's colour is wrong.** Green and red dots
   with no text say nothing to colour-blind visitors or screen readers. Red also turns
   "Not verified" into "doesn't fit", which is a false claim, and this is the one row the
   doc singles out. Fix: write "Yes" and "Not verified"; any icon is decorative
   (`aria-hidden`).

3. **Bracket placeholders ship to the page.** `[price]`, `[kg]`, `[years]` and
   `[date range]` render literally, so the comparison looks broken and untrustworthy at
   exactly the point where trust matters. Fix: plausible example values, with
   `tabular-nums` on prices.

4. **There is no "Illustrative example" label.** Mock prices with no label can be read as
   real listings, which the doc explicitly calls out. Fix: label the table (and the card,
   when it's built).

5. **Phones get a 720px table and a sideways scroll.** `minWidth: 720` inside an
   `overflowX: auto` wrapper means most mobile visitors can see one or two columns at a
   time, against the design doc's instruction. Fix: stack each option as a card below a
   breakpoint, as described in Part 1.

6. **Focus outlines are removed.** `.cmp-btn:focus { outline: none }` hides where keyboard
   users are. It only bites once fix 1 makes the questions focusable, but the two fixes have
   to land together. Fix: delete the rule and add a visible `:focus-visible` style in the
   accent colour.

7. **The table's structure is invisible to screen readers.** Row labels are `<td>`, not
   `<th scope="row">`, and the column headers lack `scope`. A screen reader moving through
   cells hears "₹8,999" with no idea which option or attribute it belongs to. Fix: use
   `scope="col"` on the column headers and `<th scope="row">` for the attribute cells, and
   add a `<caption>`.

8. **Trust copy is missing.**
   - "Does Opsvo buy things for me?" drops the sentence that any action that spends money
     or shares details needs explicit confirmation, which is the product's core promise.
   - Three of the seven FAQ questions are missing.
   - The compare body loses "Missing information is labelled as unavailable, never guessed."
   - The caption loses "Opsvo shows when each was last checked."

   Fix: use `content.md` as written.

9. **The question rows are fixed at 32px high.** Long questions overflow on narrow screens
   or with enlarged text, and the targets are below the 44px minimum. Fix: use a minimum
   height of 44px with padding instead of a fixed height.

10. **It ignores the design system.**
    - Hard-coded colours and pixel sizes are used instead of tokens.
    - The eyebrow is "COMPARE" in capitals with wide letter spacing.
    - Transitions run 600ms with a `linear` curve, an off-spec ease and `transition: all`,
      against the single 120–180ms easing curve in the tokens.
    - The height transition never runs, because the panel is conditionally rendered.
    - Nothing respects reduced motion.

    This matters less to a visitor than items 1 to 9, but it is why the block will drift
    from the rest of the page. Fix: replace inline styles with token utilities and use the
    `--ease` and `--duration-*` tokens.

## Where this departs from the tokens

These are mostly in the out-of-scope sections, and I'd bring them into line:

- **Colours:** the canvas, primary text and accent values differ from `tokens.md`, and the
  out-of-scope sections add their own ivory, charcoal and forest palette.
- **Shape:** pill buttons appear despite "No pill buttons", and radii other than 4, 8 and
  12px are used.
- **Type:** there are all-caps, wide-tracked labels despite "Sentence case everywhere", and
  font sizes are set in one-off pixel values rather than the type scale.
- **Motion:** a second easing curve, and durations above 180ms.
- **Decoration:** gradients on image fades.
- **Layout:** section spacing goes above 96px, and the content column is wider than about
  1200px.
- **Borders:** some interactive borders still use `--color-border` (1.25:1) rather than
  `#8A8C84` (3:1).

## What I'd push back on

- **`--color-border` on controls.** At 1.25:1 against the canvas it's below the 3:1 that WCAG
  2.2 asks for when a border is the only thing identifying a control. I'd add a named token
  (`--color-border-strong: #8A8C84`) so nobody has to remember the exception.
- **The card and the table disagree about delivery.** The card says "Delivery date not yet
  confirmed by the retailer", but the table asks for a date range for Option A. I marked
  every range "Est." to soften it. The content doc should pick one.
- **"Yes" for "Fits cabin limit" on illustrative data.** Even labelled as an example, a flat
  "Yes" reads as verified. Pairing it with what it was checked against (for example
  "Yes · listed 55 x 35 x 20 cm") would match the product's evidence-led voice.
- **The placeholder FAQ answers.** Data use, coverage and pricing are policy statements.
  Shipping stand-ins, even plausible ones, risks making promises the business hasn't made.
  I'd rather the section launch without those three questions than with guessed answers.

## With another day

1. Stack the comparison as option cards on narrow screens (Part 1, option 2 above).
2. Bring every value back to `tokens.md`: colours, radii, sentence case, the single easing
   curve and duration, and section spacing. Then remove the out-of-scope sections or reduce
   them to placeholders, as the brief asked.
3. Test the accordion and table with VoiceOver and NVDA, not just scripted keyboard input.
4. Make the early access dialog honest: it currently shows "You're on the list" without
   sending anything. Until there's a backend, it should say sign-ups aren't connected.
