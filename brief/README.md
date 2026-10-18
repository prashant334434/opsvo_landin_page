# Opsvo frontend take-home

Thanks for making time for this. It's built to be done in **4 hours**, and we mean the
number: if you hit four hours, stop and write down what you'd do next. Knowing where to
stop is part of what we're looking at.

Nothing in here is a trick, and there's no hidden step.

This take-home is unpaid. That's precisely why it's capped at four hours: we won't ask
for more than that, and we won't ask you to build a whole site.

## About Opsvo

Opsvo is an AI shopping companion. You describe what you need in plain language, and it
returns a short list of products that fit, each with a reason it made the list, a
comparison of what actually matters, and a link back to where every fact came from.

It does not buy anything for you. Anything that spends money or shares your details needs
your explicit approval first.

That last part shapes the whole product, and the site has to carry it. Our design doc puts
it like this:

> Voice: clear, calm, direct, evidence-led. No hype, no fake urgency, no "AI magic"
> language.

It's one landing page, nine sections. You're building two of them.

## What we're giving you

- [`content.md`](content.md) has the copy for both sections, plus the nav and SEO fields.
- [`brand/tokens.md`](brand/tokens.md) has our real design tokens: colours, type scale,
  spacing, radii and motion. Paste-ready.
- [`review-me.tsx`](review-me.tsx) is for Part 4.
- You scaffold the project yourself.

Read `brand/tokens.md` before you start. It's short, and it contains most of the
constraints you'll be judged against.

---

## Part 0: Scaffold (~20 min)

A fresh Next.js App Router project with TypeScript and Tailwind. Commit the scaffold on its
own, before you build anything, so we can see your starting configuration.

## Part 1: The compare section (~1 h 15)

Build `#compare`: the sample shortlist card and the sample comparison table, with copy from
[`content.md`](content.md).

Two requirements, both quoted from our design doc:

> On narrow screens, stack each option as a card instead of forcing a sideways scroll.

> Never use colour alone for status; "Not verified" and "Unavailable" are written labels.

Plus:

- The "Illustrative example" label is **required** on the mock data. The doc's reason: "so
  no one reads them as real listings or prices."
- Tabular numerals for prices, so columns of digits line up.
- Substitute plausible values for anything in `[square brackets]`. Never render the
  brackets.

## Part 2: The FAQ accordion (~45 min)

Build `#faq` with the seven questions in [`content.md`](content.md). From the doc:

> The FAQ accordion uses buttons with `aria-expanded`.

Closed by default. One open at a time is fine. It must be fully operable from the keyboard,
and the focus state must be visible.

## Part 3: Nav and SEO (~30 min)

- The five anchor links from [`content.md`](content.md). The three sections you aren't
  building should exist as empty placeholders so the anchors resolve.
- A "Skip to main content" link that works.
- The page title, meta description and Open Graph tags, using the exact copy in
  [`content.md`](content.md). We'll check what a crawler and a link preview see.

## Part 4: Code review (~30 min)

[`review-me.tsx`](review-me.tsx) is a compare-and-FAQ block somebody wrote in a hurry. It
runs.

**Don't fix it.** Send us a written list of what's wrong, **ranked by impact on a real
visitor**, with a sentence each on why it matters and how you'd address it.

We care more about how you rank the problems than about how many you find.

## Part 5: README (~15 min)

- How you handled the table's narrow-screen behaviour, and what you considered first.
- How you built the accordion, and how you tested it with the keyboard.
- Anything in our tokens or design doc you'd push back on.
- What you'd do with another day.

---

## Out of scope

Don't build these. They're listed so you don't wonder:

- The hero, the "how it works" steps, the trust panel, the retailers section, the footer.
- The early access email form. Its states are interesting and we cut them for time. If you
  build it anyway it won't count against you, but it won't earn you anything either.
- A logo. Set the wordmark as text.
- Any hero imagery. Leave a marked placeholder box.

## Submitting

Reply to the message this task came in on, with a link to a public repo. If you'd
rather not make it public, send a zip or add us as a collaborator on a private one and
say so in your reply.

Include your commit history. We'd rather see honest commits than a single squashed "done".

## How we evaluate

Judgment over volume, and reading over guessing. Most of what we check is written down in
`brand/tokens.md` or quoted above, so the question is whether the submission honours its
own spec: tokens instead of hardcoded values, the table that stacks, status as text rather
than colour, an accordion a keyboard can open.

A smaller, well-reasoned submission beats a larger unconsidered one. We have passed on
submissions that did everything and explained nothing.

Afterwards there's a 45-minute call where we walk through your Part 4 ranking and extend
Part 1 together.
