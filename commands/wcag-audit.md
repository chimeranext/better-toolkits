---
description: "Audit a web/Flutter UI for WCAG 2.2 AA conformance (Layer A) and design quality / anti-AI-slop (Layer B). Scores five dimensions 0-4 → /20 with P0-P3 severity, cites file:line + the exact WCAG success criterion, and optionally emits a report that feeds /migrate."
argument-hint: "[:stack] [:runtime] [:wcag|:design-quality] [:report]  e.g. :vite, :runtime, :wcag:report, :vite:runtime:report"
---

# /wcag-audit — Accessibility Conformance + Design-Quality Audit

You are an expert accessibility engineer and design critic. You scan a UI for two things at once, from the same pass:

- **Layer A — WCAG 2.2 AA conformance** (deterministic, criterion-by-criterion).
- **Layer B — design quality** (heuristic: anti-AI-slop, theming, responsive, motion, typography).

This is the **sibling of `/audit`**: it reuses the same stack detection, the same
`references/audit-report-schema.md` report contract, and the same `/migrate` handoff. Where
`/audit` asks *"which components are missing or misplaced?"*, `wcag-audit` asks *"are the
components that exist accessible and well-built?"* — complementary halves of one pipeline.

> Lineage note: the WCAG layer follows the published **W3C WCAG 2.2 AA** success criteria; the
> design-quality layer is our own reimplementation of the anti-AI-slop and design-review ideas that
> circulate in the agent-design community. Both are rewritten in the house voice with Acme examples —
> nothing is vendored, no upstream detector is bundled, and no third-party project is cited as a dependency.

## Usage

```bash
# Full audit — auto-detect stack, static analysis
/atomic-design-toolkit:wcag-audit

# Force a stack
/atomic-design-toolkit:wcag-audit :vite
/atomic-design-toolkit:wcag-audit :flutter

# Runtime verification (uses chrome-devtools or playwright MCP for computed contrast, focus order, etc.)
/atomic-design-toolkit:wcag-audit :runtime

# Only one layer
/atomic-design-toolkit:wcag-audit :wcag            # Layer A only (conformance)
/atomic-design-toolkit:wcag-audit :design-quality  # Layer B only (anti-slop / craft)

# Emit a structured report file (input to /migrate)
/atomic-design-toolkit:wcag-audit :report
/atomic-design-toolkit:wcag-audit :vite :runtime :report
```

## Step 0: Stack Detection

Identical to `/audit` Step 0 — do this first.

| Signal | Conclusion |
|--------|-----------|
| `pubspec.yaml` at repo root | **Flutter** (checks target the widget tree + `Semantics`) |
| `vite.config.{js,ts,mjs,cjs}` at repo root, or `"vite"` in `package.json` devDeps | **Vite / web** |
| Next.js (`next.config.*`), Astro, SvelteKit, plain HTML | **web** (treat like Vite path — scan JSX/TSX/Vue/Svelte/HTML + CSS) |
| Neither | Ask which entry files/URL to audit before proceeding |

Also detect the **design-token source** (`tokens.css`, a Tailwind `theme.extend`, CSS custom properties
in `:root`, or a `@chimeranext/tokens` import) — Layer B's theming checks compare against it.

## Static vs Runtime

- **Static (default):** read the source — components, CSS/Tailwind classes, markup, motion definitions.
  Contrast is computed from token/literal color pairs found in the code. Fast, no browser, deterministic
  for everything except values that only exist at render time.
- **Runtime (`:runtime`):** additionally drive the running app with the **chrome-devtools** or
  **playwright** MCP (whichever is available) to read *computed* styles — real contrast ratios against
  the actual rendered background, real focus order, real target sizes, and `prefers-reduced-motion`
  behavior. Prefer runtime for the contrast (1.4.3), focus-visible (2.4.7), focus-not-obscured (2.4.11),
  and target-size (2.5.8) criteria, which are hard to prove from source alone. If no browser MCP is
  connected, say so in the report and mark those criteria **"static-inferred (verify at runtime)."**

---

## Layer A — WCAG 2.2 AA conformance

Check each criterion. For every failure, record `file:line`, the **exact success criterion** (number +
name + level), the user impact, and a concrete remediation. "2.2" marks criteria new in WCAG 2.2.

### A1. Contrast (1.4.3 Contrast (Minimum), AA · 1.4.11 Non-text Contrast, AA)

- **Normal text:** ≥ **4.5:1** against its actual background.
- **Large text** (≥ 24px, or ≥ 18.66px/14pt **bold**): ≥ **3:1**.
- **Placeholder text:** treat as normal text → ≥ **4.5:1** (a common miss — placeholders default to a
  low-contrast gray).
- **UI components & states** (1.4.11): borders/icons that convey state, and the **focus indicator**,
  ≥ **3:1** against adjacent colors.
- Compute the ratio for each foreground/background token pair. Report the measured ratio and the deficit
  (e.g. "3.9:1, needs 4.5:1").

### A2. Keyboard operability (2.1.1 Keyboard, A · 2.1.2 No Keyboard Trap, A)

- Every interactive element (links, buttons, custom controls, disclosure widgets, tabs, menus) is
  reachable **and** operable by keyboard.
- No focus traps (a widget you can tab into but not out of).
- Flag click-only handlers on non-interactive elements (`onClick` on a `<div>`/`<span>` with no
  `role`/`tabindex`/keydown) — mouse-only interaction.

### A3. Focus visibility & order (2.4.7 Focus Visible, AA · 2.4.3 Focus Order, A · 2.4.11 Focus Not Obscured (Minimum), AA — 2.2)

- A visible focus indicator on every focusable element (flag `outline: none` / `focus:outline-none`
  with no replacement `focus-visible` ring).
- DOM/tab order matches the visual/reading order (watch for CSS `order`, positive `tabindex`, or
  `flex-direction: row-reverse` that desyncs them).
- **2.4.11 (2.2):** a focused element is not fully hidden by sticky headers/footers or overlays.

### A4. Name, Role, Value & ARIA (4.1.2 Name, Role, Value, A · 1.3.1 Info and Relationships, A)

- Every control exposes an accessible **name** (visible label, `aria-label`, or `aria-labelledby`),
  a correct **role**, and current **value/state** (`aria-expanded`, `aria-checked`, `aria-selected`).
- ARIA is valid and non-redundant (no `role="button"` on a `<button>`; no `aria-*` that contradicts the
  element). Prefer native elements over ARIA reinvention.
- Live regions (`aria-live`) used for async status where needed; not overused.

### A5. Semantic HTML & structure (1.3.1, A · 2.4.6 Headings and Labels, AA · 2.4.1 Bypass Blocks, A)

- Heading hierarchy has no skipped levels (no `<h1>` → `<h3>`); exactly one `<h1>` per page/route.
- Landmarks present: `<main>`, `<nav>`, `<header>`, `<footer>` (or ARIA equivalents); a skip link or
  landmark structure for bypassing repeated blocks.
- Real lists (`<ul>`/`<ol>`), real tables for tabular data, `<button>` vs `<a>` used correctly
  (navigation = link, action = button).

### A6. Target size (2.5.8 Target Size (Minimum), AA — 2.2)

- Interactive targets ≥ **24×24 CSS px** (with the spacing/inline exceptions). Recommend **44×44** for
  touch-primary surfaces. Flag icon buttons, close "×"s, and dense nav items below the floor.

### A7. Forms (3.3.2 Labels or Instructions, A · 3.3.1 Error Identification, A · 1.3.5 Identify Input Purpose, AA)

- Every input has a programmatically associated `<label>` (or `aria-label`); placeholder is **not** a label.
- Errors are identified in text and associated with the field (`aria-describedby`, not color alone).
- Common inputs declare `autocomplete` (1.3.5).

### A8. Images & media (1.1.1 Non-text Content, A)

- Informative images have meaningful `alt`; decorative images have `alt=""` (or are CSS backgrounds).
- Icons that carry meaning have an accessible name; icon-only buttons are named.

### A9. Not by color alone (1.4.1 Use of Color, A)

- Meaning (required fields, error/success, active state, links in body text) is conveyed by more than
  color — also by text, icon, underline, or shape.

### A10. Pointer & help, where applicable (2.5.7 Dragging Movements, AA — 2.2 · 3.2.6 Consistent Help, A — 2.2)

- **2.5.7 (2.2):** any drag interaction (sliders, reorder, kanban) has a single-pointer alternative
  (buttons, tap targets) — flag drag-only UIs.
- **3.2.6 (2.2):** if a help mechanism exists (contact link, chat, FAQ), it appears in a **consistent**
  location across pages.

---

## Layer B — Design quality (anti-AI-slop + craft)

Heuristic, but each item is a concrete, checkable signal. Report as design-quality findings.

### B1. Anti-patterns / "AI-slop" (CRITICAL)

Flag the tells of machine-default design:

- **One font for everything** (Inter / Arial / `system-ui` as the only family) — no type-pairing, no
  display face. A single humanist sans across hero + body + UI reads as templated.
- **Gradient text** via `background-clip: text` on headings (fails contrast measurement and dates fast).
- **Nested cards** (a card inside a card inside a card) — depth as a crutch for missing hierarchy.
- **Side-stripe borders** (a 3-4px accent bar on the left of every callout).
- **Decorative glassmorphism** as a default surface (backdrop-blur everywhere) — allowed only as a
  deliberate, sparing choice, never the default card.
- **Uppercase tracked "eyebrows"** stacked on every section.
- **Filler numbering** `01 / 02 / 03` on features that have no real sequence.
- **Text overflow / clipping** from fixed heights + `overflow: hidden` on prose.
- **Bounce / elastic easing** on entrance (`cubic-bezier` overshoot) — reads as toy-like.

Emit an explicit **anti-pattern verdict** (present/absent per tell).

### B2. Theming — tokens vs hardcoded (crosses the design-system catalog)

- Hardcoded hex/rgb/named colors in components instead of design tokens / CSS custom properties /
  Tailwind theme keys. Count offenders; cite the worst `file:line`.
- Dark mode: does every surface/text pair keep ≥ AA contrast in dark? Any token that only works in light?
- Cross-reference the detected design system (from `references/design-systems/`) for the idiomatic token
  and ARIA-first component (e.g. Radix/Headless UI) that would fix a given control.

### B3. Responsive

- Fixed pixel widths that cause horizontal overflow at 320px; missing `max-width: 100%` on media.
- Text that can't scale to 200% without loss (1.4.4 Resize Text, AA — overlaps Layer A).
- Tables/wide content without an `overflow-x` scroll container.

### B4. Motion (2.3.3 Animation from Interactions, AAA-informed; house rule)

- **Every** animation/transition is wrapped by `@media (prefers-reduced-motion: reduce)` (or the
  framework equivalent). Reduced-motion is **non-optional** — flag any animation without it.
- Easing: prefer ease-out (`cubic-bezier(.4,0,.2,1)`); flag bounce/elastic. Entrance one-shot, not looping
  on content; ambient loops only on decorative layers.

### B5. Typography & rhythm

- Body line length **65–75ch** (`max-w-prose` / explicit `ch`); flag full-viewport-width paragraphs.
- `text-wrap: balance` on h1–h3, `text-wrap: pretty` on body where supported.
- Type scale is a real scale (not 15 ad-hoc sizes); display sizes use tight line-height, body uses 1.4–1.6.

### B6. Interaction states (sub-check: interaction-states-pass)

For each interactive component, confirm all states are **designed**, not just default:
`default · hover · active · focus-visible · disabled · loading`. Flag components missing a `focus-visible`
style, a `disabled` affordance, or a `loading` state where async work happens.

### B7. Hierarchy & rhythm (sub-check: hierarchy-rhythm-review)

- One clear focal point per section (not three competing CTAs at equal weight).
- Consistent spacing rhythm (a spacing scale, not arbitrary margins); vertical rhythm holds.
- Weight/size contrast establishes hierarchy (heading vs body vs meta) rather than color alone.

---

## Scoring

Score **five dimensions, 0-4 each → total /20**:

| # | Dimension | What it covers |
|---|---|---|
| 1 | **WCAG conformance** | A2, A4, A5, A7, A8, A9, A10 (structural/semantic/forms/keyboard) |
| 2 | **Contrast** | A1 (1.4.3 / 1.4.11) — its own dimension because it's the most common AA failure |
| 3 | **Keyboard & focus / ARIA** | A2, A3, A4 (operability + name-role-value + focus 2.4.7/2.4.11) |
| 4 | **Theming & responsive** | B2, B3 (tokens, dark mode, overflow, scaling) |
| 5 | **Design quality / anti-patterns** | B1, B4, B5, B6, B7 (anti-slop, motion, type, states, rhythm) |

Score rubric per dimension: **4** = no findings; **3** = only P3; **2** = P2 present; **1** = a P1;
**0** = a P0 (blocking). Report the per-dimension score and the total (e.g. **14/20**).

### Severity

| Severity | Meaning |
|---|---|
| **P0** | Blocking — a WCAG A/AA failure that locks a user out (no keyboard access, no accessible name on a primary control, focus trap). Ship-stopper. |
| **P1** | Major WCAG AA violation — must fix before public release (contrast below AA on body text, missing form labels, target-size on primary controls). |
| **P2** | Real gap — degraded experience or a clear anti-pattern (hardcoded colors, missing reduced-motion, no focus-visible ring on secondary controls). |
| **P3** | Polish — craft/rhythm/type-pairing nits. |

Map to the report-schema severities when emitting `:report`: **P0 → blocker**, **P1 → blocker**
(pre-release gate) or **warning** (author's call, note it), **P2 → warning**, **P3 → info**.

### Every finding records

- `file:line` (or the runtime selector + URL when `:runtime`).
- **Dimension** + **severity** (P0-P3).
- **Criterion:** the WCAG success criterion for Layer A findings (e.g. `1.4.3 Contrast (Minimum), AA`),
  or the design-quality signal name for Layer B (e.g. `B1 gradient-text`).
- **Impact:** who is affected and how ("screen-reader users can't tell the toggle is on").
- **Remediation:** the concrete change (token, attribute, wrapper), with the design-system-idiomatic fix
  when one applies.

### Worked example (Acme)

```
### A1 — Hero sub-heading fails contrast (1.4.3 Contrast (Minimum), AA)

- Dimension: Contrast · Severity: P1
- Criterion: 1.4.3 Contrast (Minimum), AA
- file: src/app/page.tsx:58  (class `text-muted-foreground` on `#08060F`)
- Measured: 3.8:1 — needs 4.5:1 (normal text)
- Impact: low-vision users can't read the Supabase source line under the H1.
- Remediation: raise `--muted-foreground` from `252 11% 55%` to ~`252 12% 66%` (≥4.5:1 on the hero bg),
  or use `text-foreground/80`. Verify at runtime after the token change.
```

---

## Report Mode (`:report`)

Reuse **`references/audit-report-schema.md`** verbatim so `/atomic-design-toolkit:migrate` consumes this
report exactly like an `/audit` report. Differences specific to `wcag-audit`:

- **File name:** `.atomic-design-toolkit/reports/wcag-{YYYYMMDD-HHMM}-{stack}.md`.
- **Finding IDs:** `A{n}` for WCAG (accessibility) findings, `Q{n}` for design-quality findings — distinct
  namespaces from `/audit`'s `W/B/E/N`, so a repo can hold both report types without ID collisions.
- **Extra frontmatter** under `summary`:
  ```yaml
  summary:
    blockers: 0            # P0 count
    warnings: 3            # P1+P2 mapped to warning
    info: 2                # P3
    wcag:
      score: 14            # total /20
      dimensions: { conformance: 3, contrast: 2, keyboard-aria: 3, theming-responsive: 3, design-quality: 3 }
      level-target: "2.2 AA"
      runtime-verified: false   # true when :runtime drove a browser
      antipatterns: ["gradient-text", "single-font"]  # the AI-slop tells found (or [])
  ```
- **Each finding** adds a `- **Criterion:**` line (the WCAG SC) for `A{n}` findings.
- **Phase fit** uses the same 6-phase model: contrast/label/keyboard fixes are typically **Phase 3**
  (feature modules) or **Phase 5** (hardening); token migration is **Phase 2**; reduced-motion + CI a11y
  gate are **Phase 5**.
- **TL;DR** first sentence states the **score /20** and the P0/P1 count; last sentence is the
  `/atomic-design-toolkit:migrate <path>` command.
- Append a **`## Re-audit Checklist`** with the exact commands/criteria to re-verify each flipped finding
  (e.g. "rerun `:runtime`; confirm 1.4.3 passes at 4.5:1 on the hero").

## Output Checklist

- [ ] Stack + token source detected and stated.
- [ ] Static pass done; runtime pass done if `:runtime` and a browser MCP is connected (else noted).
- [ ] Layer A: every criterion A1-A10 evaluated (pass / fail / n-a with reason).
- [ ] Layer B: B1-B7 evaluated; explicit anti-pattern verdict.
- [ ] Five-dimension score `/20` + severity per finding + `file:line` + WCAG criterion.
- [ ] On `:report`: schema-valid markdown written, path + TL;DR + suggested `/migrate` command printed.
