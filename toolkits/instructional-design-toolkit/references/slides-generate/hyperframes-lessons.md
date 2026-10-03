# HyperFrames deck lessons (field notes, 2026-10-02)

Verified while shipping a 9-slide 1920×1080 webinar deck
(HyperFrames slideshow `0.8.111`, player + slideshow globals via jsDelivr,
GitHub Pages hosting). Each item below was observed in the browser, not assumed.

## 1. No native deep-linking — add `?slide=N` yourself

`hyperframes-player@0.8.111` never reads `location.search` or `location.hash`
(only `location.origin` for URL resolution). There is no `?slide=` param.

Working pattern (wrapper `index.html`, same-origin iframe):
`?slide=N` (1-based) or `?t=` seconds. Prefer the slideshow controller
(`show.controller.goToSlide(idx)` keeps the nav counter in sync), fall back to
the composition iframe (`contentWindow.__hfSetTime(time)`).

## 2. One-shot seeks lose to player init — loop until visible

The composition posts its timeline ~300ms after iframe load; the player then
initializes onto slide 1. A seek fired before that gets overwritten. Observed
symptom: slide 1 → flash of target → back to slide 1.

Fix: re-seek until the target scene is actually visible
(`getComputedStyle` → `visibility === "visible"` + `opacity > 0.5`) or an 8s
deadline passes. Poll every ~250ms. This survives fast and slow loads alike.

## 3. Full-bleed support photos: exact geometry

For a text-left / photo-right-half slide at 1920×1080:

```css
.support-half {
  position: absolute;
  top: 0;
  right: 0;
  width: 960px;
  height: 1080px;
  object-fit: cover; /* no radius, edge to edge */
}
.split-left .headline,
.split-left .bigidea,
.split-left .kicker,
.split-left .blist { max-width: 760px; } /* 160px pad + 960px photo */
```

Placeholder blanks are theme-colored solids (dark `#2a4289`, light `#b8d4ea`),
JPG < 500KB, named 1:1 with their slot (`support-NN-<slug>.jpg`) so authors
swap files without touching HTML. Backgrounds stay a separate `bg-NN-*.jpg`
series (12% opacity `watermark`); never mix the two series.

## 4. Alignment triage: flex tops cannot drift from content

In a flex row, item tops are geometrically aligned regardless of content
length. A uniformly down-shifted block is therefore NEVER a content problem:
it is a stuck or mid-flight GSAP transform (entrance `y` or fragment `x`).

Harden every entrance/reveal with transform cleanup on complete:

```js
gsap.from(els, { opacity: 0, y: 28, ..., onComplete: () => gsap.set(els, { clearProps: "transform" }) });
```

Never clear `opacity` on fragment-staged elements: revealed items carry inline
`opacity: 1` over a stylesheet `opacity: 0`, and clearing it re-hides them.

## 5. Fragment stops read as broken at rest

A slide parked between fragment stops (e.g. 2 of 3 blocks visible with no
motion) looks like a rendering bug to presenters and audiences. Default to
full-entrance reveals; keep fragment staging only when the narration truly
needs progressive disclosure, and then make the pending state obvious.

## 6. Measure display type with the real font, not by eye

Poppins Bold 88px: 35 characters ≈ 1636px — 36px over a 1600px content
column, so it wraps. Slim-fit rule: measure with the actual font file
(PIL `ImageFont.truetype(...).getlength(text)` on the shipped woff2) and pick
the largest size fitting ~1560px (here: 80px). One-line headlines stay one
line on every machine, independent of font-substitution luck.

## 7. Contrast numbers that decided the palette

Against the CIHUBS tokens, measured during design (large text needs 3:1):
gold `#fec503` on navy ≈ 8:1 (ship) but on white ≈ 1.6:1 (kill);
tertiary `#4a6fa5` on navy ≈ 2.3:1 (kill) — use light-blue `#7ba3d6` for
accents/labels on dark instead. Always re-run the HyperFrames contrast
suite after any color change; it samples what eyes actually get.

## 8. Type hygiene that prevents widows and orphans

Semantic `<br>` at clause boundaries on all multi-line headlines (never
delegate wrapping to the browser); `text-wrap: balance` on headings,
`text-wrap: pretty` on prose and bullets. One idea per slide, max 4 bullets
per content slide, 1–2 accent words per slide.

## 9. Repo plumbing that held up

- Lint MUST run inside `composition/`; the wrapper root `index.html`
  intentionally fails lint (expected, not a defect).
- Player bundles via pinned CDN (`hyperframes@0.8.111`), never vendored.
- Placeholder protocol: per-slide files, `<500KB`, min 1920px wide for
  backgrounds, README mapping table in `media/`, originals recoverable from
  git history — never delete a shipped asset without a recovery path.
- `hyperframes check` gate before every push: 0 errors + full WCAG AA pass.
