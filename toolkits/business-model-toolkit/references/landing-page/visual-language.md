# Visual Language — Landing Page Design Tokens

A concrete, reusable visual system for high-conversion landing pages. Where `cro-methodology.md`
governs *what* goes on the page and in what emotional order, this reference governs *how it looks and
moves*: type scale, motion, layout geometry, and surface tokens — with real values, not adjectives.

The values below were **field-measured (computed styles) from a production LATAM startup landing** that
ships a distinctive, non-templated aesthetic. They are transcribed here as a **brand-neutral system**
(placeholder `Acme` brand, generic token names). Swap the accent colors and font families for the
project's own; keep the scales, ratios, and motion rules — those are the transferable craft.

## Contents

1. [Fluid typographic scale](#1-fluid-typographic-scale)
2. [Animation system — three layers](#2-animation-system--three-layers)
3. [Bento / masonry layout spec](#3-bento--masonry-layout-spec)
4. [Surface tokens](#4-surface-tokens)
5. [How to apply during the design phase](#5-how-to-apply-during-the-design-phase)

---

## 1. Fluid typographic scale

Two rules carry most of the character:

- **Display sizes track a tight negative letter-spacing** (roughly `-0.03em` to `-0.045em`) and a
  **line-height near 1.0**. This is what makes large headings read as intentional and editorial rather
  than as a default `<h1>`.
- **Eyebrows / labels (≤12px, uppercase) invert that** — they use **positive** tracking (`+0.08em`).
- **Body copy** stays neutral: no tracking, line-height `1.4–1.55`.

Pair a **humanist sans** (body + headings, weights 400–800) with a **condensed display face** used
sparingly for oversized numerals or hero accents — pair on a contrast axis, never two neutral sans.

| Role | font-size | line-height | weight | letter-spacing |
|------|-----------|-------------|--------|----------------|
| Hero (H1) | 56px | 1.0 (56px) | 700 | −0.043em (≈ −2.4px) |
| Display accent (H3 oversized) | 48px | 1.0 | 800 | −0.025em |
| Section (H2) | 36px | 1.11 (40px) | 700 | −0.025em |
| Section, tighter (H2) | 30px | 1.13 (34px) | 700 | −0.047em |
| Card title (H3) | 22px | 1.18 (26px) | 800 | −0.04em |
| Lead paragraph | 20px | 1.4 (28px) | 600–800 | normal |
| Body | 18px | 1.55 (28px) | 400 | normal |
| Body small | 16px | 1.5 (24px) | 400–600 | normal |
| Meta / label | 14px | 1.43 (20px) | 500–800 | −0.02em |
| Eyebrow (UPPERCASE) | 10–12px | 1.3 | 700 | **+0.08em** |

**Token scale** (base 16px, roughly a major-second/third progression):

```css
:root {
  --text-xs:   0.75rem;   /* 12 */
  --text-sm:   0.875rem;  /* 14 */
  --text-base: 1rem;      /* 16 */
  --text-lg:   1.125rem;  /* 18 */
  --text-xl:   1.25rem;   /* 20 */
  --text-2xl:  1.5rem;    /* 24 */
  --text-3xl:  1.875rem;  /* 30 */
  --text-4xl:  2.25rem;   /* 36 */
  --text-5xl:  3rem;      /* 48 */
  --text-6xl:  3.75rem;   /* 60 */
}
```

Make the hero fluid so it shrinks gracefully on mobile without a media query:

```css
.hero-title {
  font-size: clamp(2.25rem, 6vw + 1rem, 3.5rem); /* 36 → 56 */
  line-height: 1.0;
  letter-spacing: -0.043em;
  font-weight: 700;
  text-wrap: balance; /* h1–h3 only */
}
```

Use `text-wrap: balance` on `h1–h3` and `text-wrap: pretty` on long prose.

---

## 2. Animation system — three layers

Motion is CSS keyframes + IntersectionObserver — **no heavy animation library required** and it maps
directly onto a Tailwind + `tailwindcss-animate` stack. Keep the three layers strictly separate;
mixing them is what produces "busy" pages.

**Duration + easing tokens:**

```css
:root {
  --duration-instant: 0.15s;
  --duration-fast:    0.3s;
  --duration-normal:  0.5s;
  --duration-slow:    0.8s;
  --ease-standard:    cubic-bezier(0.4, 0, 0.2, 1);
  --state-hover-scale:  1.02;
  --state-active-scale: 0.98;
}
```

### Layer 1 — Entrance (one-shot, on-load and on-scroll)

Content reveals **once** as it enters the viewport. Short (`--duration-fast`/`--duration-normal`),
ease-out, a small `translateY` of ~20px. The reveal enhances an already-visible default — never a
blank screen waiting for JS.

```css
@keyframes fadeIn {
  0%   { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes slideUp {
  0%   { transform: translateY(100%); }
  100% { transform: translateY(0); }
}
```

Scroll-reveal pattern — an IntersectionObserver flips a class; the element goes from its offset resting
state to `none`, with `will-change` hinting the compositor:

```css
.reveal { opacity: 0; transform: translateY(20px); will-change: transform, opacity;
          transition: opacity var(--duration-normal) var(--ease-standard),
                      transform var(--duration-normal) var(--ease-standard); }
.reveal.is-visible { opacity: 1; transform: none; }
```

```js
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) {
    e.target.classList.add('is-visible');
    io.unobserve(e.target); // one-shot
  }
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
```

### Layer 2 — Ambient (decorative loops, never on content)

Slow, infinite motion applied **only to decorative layers** — background orbs, glows, gradient
washes. Never on text or interactive elements.

```css
@keyframes float   { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes breathe { 0%,100% { transform: scale(1); }      50% { transform: scale(1.05); } }
@keyframes shimmer { 0% { background-position: -200% 0; }  100% { background-position: 200% 0; } }
```

Typical timings: `float` 3–12s ease-in-out (vary per depth layer for parallax), `breathe` 4s,
`shimmer` 1.8s.

### Layer 3 — Micro-interaction (hover / active)

```css
.interactive { transition: transform var(--duration-instant) var(--ease-standard); }
.interactive:hover  { transform: scale(var(--state-hover-scale)); }
.interactive:active { transform: scale(var(--state-active-scale)); }
```

### Reduced motion is mandatory

Every animation ships with a `prefers-reduced-motion` escape hatch. This is non-negotiable and an
accessibility requirement.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 3. Bento / masonry layout spec

For **features** and **social-proof** sections, avoid an endless grid of identical cards. The
transferable trick is to **mix three aspect ratios in one grid** on equal-height rows.

**Grid tokens + responsive columns:**

```css
:root {
  --bento-gap: 1rem;          /* 16px */
  --bento-card-radius: 1rem;  /* 16px; showcase cards go up to 24px */
}
```

```css
.bento {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: var(--bento-gap);
}
@media (min-width: 640px)  { .bento { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: 1fr; } }
@media (min-width: 1024px) { .bento { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
```

`grid-auto-rows: 1fr` (Tailwind `auto-rows-fr`) gives every cell an equal base height so mixed content
still aligns.

**Gap scale observed in production:** 8 · 10 · 16 · 20 · 24 · 40px — map to the spacing scale below
(`--space-sm` … `--space-3xl`). Feature grids commonly run `gap-x` 24px with a smaller `gap-y`.

**Card proportions by role** — deliberately mixed within the same bento:

| Card role | Aspect ratio | Radius | Use |
|-----------|--------------|--------|-----|
| Square tile (small bento) | ~1:1 | 20–33px | icon / stat tiles |
| Vertical feature card | ~10:11 (0.9) | 20px | feature with body copy |
| Wide showcase / media | ~2:1 (2.0) | 24px | video, product shot (spans 2 cols) |
| Medium banner | ~1.6–1.9 | 20–24px | CTA / image band |
| Tall mockup (phone) | ~3:5 (0.6) | 12px | app screenshots |

The 2:1 showcase spans two columns while 1:1 tiles and 3:5 mockups fill the remainder — this
asymmetry is what breaks the "templated card wall" and is the whole point of the pattern.

---

## 4. Surface tokens

**Spacing** (4/8pt scale):

```css
:root {
  --space-xs: 0.25rem; --space-sm: 0.5rem; --space-md: 1rem;
  --space-lg: 1.5rem;  --space-xl: 2rem;   --space-2xl: 3rem; --space-3xl: 4rem;
}
```

**Radii** (xs → 3xl):

```css
:root {
  --radius-xs: 0.25rem; --radius-sm: 0.375rem; --radius-md: 0.5rem; --radius: 0.75rem;
  --radius-xl: 1rem; --radius-2xl: 1.5rem; --radius-3xl: 2rem;
}
```

**Elevation** — layered shadows read richer than a single blur:

```css
:root {
  --shadow-elegant:  0 10px 30px -10px hsl(var(--accent) / 0.3);
  --shadow-floating: 0 20px 40px hsl(0 0% 0% / 0.4), 0 8px 16px hsl(0 0% 0% / 0.2);
  --shadow-glow:     0 0 40px hsl(var(--accent) / 0.4);
}
```

**Touch target** — never below 44px for interactive controls (also a WCAG target-size safeguard):

```css
:root { --touch-target: 44px; }
```

### Glass surfaces — an option, with a warning

Semi-transparent "glass" panels (`background: hsl(0 0% 100% / 0.08–0.25)` + `backdrop-filter: blur(12px)`)
can look premium on product cards over a busy/gradient background. **Use them deliberately and
sparingly.** Glassmorphism as a *default* decoration — applied to every card regardless of what's
behind it — is a recognized AI-slop tell and hurts contrast/legibility. If a glass panel carries text,
verify the text still meets contrast against the *effective* (blurred) background, not the token.

```css
.glass {
  background: hsl(0 0% 100% / 0.10);
  backdrop-filter: blur(12px);
  border: 1px solid hsl(0 0% 100% / 0.12);
  border-radius: var(--radius-2xl);
}
```

---

## 5. How to apply during the design phase

When defining the landing's design tokens (Fase 7 spec), seed them from this system instead of
inventing values ad hoc:

1. **Type** — adopt the `--text-*` scale; apply the display tracking/line-height rules to hero and
   section headings; give eyebrows positive tracking.
2. **Motion** — wire the three layers with the duration/easing tokens; put every reveal behind an
   IntersectionObserver and every animation behind `prefers-reduced-motion`.
3. **Layout** — build feature and social-proof sections as a bento with `auto-rows-fr` and the three
   mixed aspect ratios; use the gap scale.
4. **Surface** — take spacing, radii, shadow, and touch-target tokens as-is; treat glass as an opt-in.

Keep the brand's own colors and typefaces — everything here is the **structure** the brand layer
plugs into. When the project already ships a consolidated token package, this reference is the human
documentation of what that package encodes; import the package rather than re-typing these values.
