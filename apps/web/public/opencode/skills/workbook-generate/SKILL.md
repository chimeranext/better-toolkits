---
name: workbook-generate
description: >
  Interactive course workbook design system — turns a course's text classes into one
  standalone, accessible, interactive HTML explainer (a navigable document chunked by
  module, Articulate-Rise lesson model; stepped mode for screen-recording).
  Defines the curated component kit, the content-shape -> component mapping rules,
  the accessibility contract, and the consumer-spec (instruction-bundle-spec.yaml)
  consumption + graceful-degrade rules. Consumer plugins own the brand tokens and the
  component vocabulary via their `workbooks` spec section; this skill stays voice-neutral.
triggers:
  - workbook
  - interactive workbook
  - course workbook
  - generate workbook
  - rise
  - interactive explainer
---

# Interactive Workbook Design Knowledge Base

This skill encodes the design system for **interactive course workbooks** — a
single, standalone, self-contained HTML artifact that renders a whole course's
**text classes** (`text-*.md`) as an interactive explainer the learner scrolls
or steps through.

It is the student-facing sibling of `course-visualize` (which produces an
instructor-facing analytics view of the same course). Where `slides-generate`
turns a **video brief** into a deck for live teaching, `workbook-generate`
turns the **reading classes** into a self-study / screen-share artifact.

The philosophy is borrowed from interactive-HTML explainers: a concept should
recover its natural shape. A process becomes a navigable flow, a comparison
becomes a side-by-side, code becomes annotated-and-copyable, and "do you
follow?" becomes a reveal + a check question. Interaction is **felt**, not
described — but it is delivered through a **curated, tested component kit**, not
freeform per-concept JavaScript.

## What this skill is NOT

- It is **not** a slide system (`slides-generate` owns that).
- It is **not** a persistence layer. V1 holds all learner answers **in memory
  only** — refresh resets. No `localStorage`, no `postMessage`, no parent-frame
  communication, no backend. (Those are deliberately deferred.)
- It does **not** ship brand tokens. Palette / typography / voice come from the
  consumer's `instruction-bundle-spec.yaml`. This knowledge base is
  voice-neutral and must stay that way (the "would this help an instructor in
  Argentina shipping a Python course on Moodle?" test).

## The artifact (per-course by default)

One `workbook-{course-slug}.html` covering **all modules** of a course, with:

- a **module-chunked navigable flow** (default, `scroll_behavior: doc`): one
  module ("lesson") shows at a time — the Articulate-Rise model, not one endless
  scroll. A **stepped** flow (one screen at a time, for screen-recording) is the
  alternative. **No scroll-snap** — plain smooth scroll within a lesson.
- a **table of contents** that switches the active module — a **sticky sidebar
  on desktop**, a **collapsible "Contents" menu on mobile** (a slim sticky bar +
  toggle, never a wall of links pushing content down);
- a **progress indicator** (module-based) and, at each module's end, an **arc
  indicator** ("Module N of M") + a **forward-hook** Next control;
- **interactive blocks** chosen to match each piece of content's shape (see the
  mapping rules below).

### Light-touch storytelling (structure here, voice in the overlay)

The base ships the *slots* that give a course narrative momentum, voice-neutral:
the **arc indicator** (where you are), and a **forward-hook** on the Next control
— a primary action line (`Next: {title} →`) plus an **optional teaser line**
that is a **voice slot**. Leave the teaser empty in the base draft (it hides via
`:empty`, so a generic consumer just sees `Next: {title} →`); the consumer's
voice overlay fills it with momentum copy (the L3 "momentum endings" concern).
Richer beats (transition/closure cards, connective lesson intros) are a
deliberate future addition, not in the base today.

An optional `--scope module` narrows generation to a single module
(`workbook-{module-slug}.html` under that module).

## The curated component kit

Each component is a documented, theme-variable-driven, accessible-by-construction
block. **This catalog is owned by IDT base** — the canonical, voice-neutral
vocabulary of what an interactive workbook can contain. The base template ships
the HTML/CSS/JS for all of them; the command composes a workbook by selecting
and filling them. A consumer MAY narrow, extend, or set options on this catalog
via an **optional** `workbooks.components` override in their spec; absent that
override, the full catalog is available with sensible defaults. The library
itself never lives in the consumer spec — only brand theming and thin
preferences do.

> **What interactivity is FOR here.** The artifact's job is to **display rich
> information**. Per the source thesis, interactivity earns its place in exactly
> two ways: (a) **felt understanding** — drag/click and *see* the effect
> (knobs, diagrams, simulations); or (b) **closing the loop** — hand the learner
> something to take back to Claude or a mentor (**export / copy-as-prompt**).
> It does NOT capture answers. Because V1 persists nothing, a widget that
> records a learner's input and does nothing with it (an ungraded quiz to
> nowhere, a reflection box that evaporates on refresh) is an anti-pattern.
> Self-check belongs in **predict-and-reveal** (immediate, no capture); taking
> work forward belongs in **export**.

### Baseline (always available)

| Component | Purpose |
|---|---|
| **step / section** | A unit of the flow. Each `H2` of a reading is typically one step. |
| **lede** | A one-line lead paragraph (`.wb-lede`) that frames a step before the body. Bigger, muted; sets up what the step is about. |
| **statement / callout** | A bordered emphasis block for a load-bearing sentence; key words in `<strong>` render in the accent. |
| **quote** | A pull-quote (`.wb-quote` `<blockquote>` + optional `<cite>`) for a memorable/authoritative line. |
| **progress bar** | Course-level and per-module completion %. Updates as the learner advances. |
| **completion event** | Fired (not persisted) when the learner reaches the end. A hook point for V2. |

### Progressive disclosure

| Component | Purpose |
|---|---|
| **accordion** | Collapsible detail blocks. Scaffolds complexity — TL;DR open, depth on demand. |
| **tabs** | Parallel variants on one surface (e.g. "Python / JS / Go", "before / after"). |
| **reveal** | Hide content until the learner asks for it. |
| **predict-and-reveal** | A "think about this first" prompt + a hidden **model answer / expert take**. The self-check pattern — pedagogy via retrieval + immediate feedback, with **no capture and no grading**. Replaces ungraded quizzes/input boxes. |

### Loop-closer (the "stay in the loop" move)

| Component | Purpose |
|---|---|
| **export / copy-as-prompt** | A button that copies a ready-made prompt (or the learner's notes) to the clipboard so they can paste it into Claude or send it to a mentor. The only way interaction leaves a no-persistence artifact — turns passive display into two-way. Clipboard has a `file://` fallback. |

### Inline SVG (restores the spatial dimension)

| Component | Purpose |
|---|---|
| **flow diagram** | A process / pipeline as clickable, ordered steps. |
| **comparison diagram** | Two or more options laid out spatially for contrast. |
| **chart** | A small bar / line chart. Hand-rendered SVG with **precomputed coordinates** (no runtime scale fn) and the **single salient datum recolored** to the accent (`.is-peak`) while the rest stay neutral — the highlight is itself a teaching move. No library. |
| **annotated figure** | An SVG figure with callout labels. |

### Annotated code

| Component | Purpose |
|---|---|
| **code block** | Syntax-styled code with a copy button (with a `file://` clipboard fallback) and optional margin annotations / line callouts. High value for a coding curriculum. **Syntax highlighting** is dependency-free: wrap tokens by role in `<span>`s — `kw` (keyword), `str` (string), `num` (number), `fn` (function/type), `cmt` (comment). Fixed legible hues on the dark code surface (not brand tokens). |
| **code diff** | A before -> after variant of the code block: removed lines (`.diff-del`, struck through) and added lines (`.diff-add`) banded inline. Teaches *the change*, not just the result — the core move of teaching code. |

### Parametric knob (the reliable "felt" interaction)

| Component | Purpose |
|---|---|
| **knob** | A slider whose value writes a CSS custom property (`--knob`) that a preview element consumes and a readout mirrors. Lets a learner *drag and watch the effect* — the felt interactivity of the reference site's simulations, delivered through a fixed, tested component rather than bespoke per-concept JS. In-memory only. |
| **knob (split-bar)** | The `is-split` preview variant: a full-width **A-vs-B bar** where the value portion is the accent and the remainder is `--wb-accent-2`, with a 2-item legend. Use when the value is one side of a split (e.g. P(1) vs P(0)) so the bar matches a caption that names both outcomes. Same `--knob` wiring — no extra JS. |

### Course navigation

| Component | Purpose |
|---|---|
| **module chapter** | A titled chapter grouping a module's reading steps. |
| **table of contents** | Jump-to navigation across modules; reflects progress. |

### Stretch tier (only when a concept truly needs it — add deliberately, test it)

| Component | Purpose |
|---|---|
| **live simulation** | A measured simulation — state array -> recompute -> diff-vs-previous -> re-render, with a readout that prints the lesson's key metric live (e.g. "25% of keys moved"). The most powerful pattern in the reference, but the most expensive to generate/QA — reach for the **knob** first. |
| **state visualizer** | A small interactive state machine / structure (e.g. add/remove nodes) for a concept best understood by manipulation. |

These are the most fragile to generate and the most expensive to QA. Prefer a
baseline or disclosure component unless manipulation is the point of the lesson.

## Semantic color language

Color carries consistent meaning across every component (and is always paired
with text or an icon — never color alone, per the accessibility contract):

- **accent** (`--wb-accent`) = the *current / focal / interactive* thing — the
  active step, a selected tab, the salient datum on a chart, an interactive
  control, a key term.
- **good** (`--wb-good`) = *success / done / favourable* — a completed step, the
  favourable side of a comparison, added lines in a diff.
- **bad** (`--wb-bad`) = *removed / unfavourable* — the weak side of a
  comparison, removed lines in a diff.

This mirrors the reference site's clay / olive / rust roles. Consumers retheme
the hexes via the spec's `design.palette`; the *roles* stay fixed so the visual
grammar is stable across a course (stable grammar = lower cognitive load).

## Content-shape -> component mapping (the pedagogical core)

Read the reading's prose and promote it into the component whose shape fits.
**These are heuristics — starting points, not a lookup table.** Don't map
mechanically (every table → the same chart). Pick the representation that best
illuminates *this* concept, and **deliberately vary across a course**: if three
sections each hold a comparison, they should not become three identical
diagrams — find the angle each one needs. Monotony (every workbook the same
shell with swapped text) is a failure mode, not a success criterion. With that
framing, the heuristics:

- **Course** -> module **chapters** (ordered by module directory), with a
  **table of contents** and course-level **progress**.
- **Each `text-*.md`** -> a run of steps inside its module chapter.
- **Each `H2`** -> a **step / section**.
- **A table** -> a **comparison diagram**, **tabs**, or a **chart** (pick by
  whether the table contrasts options, shows variants, or holds numbers).
- **An ordered "step 1 / 2 / 3" list or a described process** -> a **flow
  diagram** or a stepper.
- **A fenced code block** -> an **annotated code block**; if it shows an edit
  (old vs new), use the **code diff** variant.
- **A small dataset with a standout value** -> a **chart**, recoloring the peak.
- **A tunable relationship** ("as X grows, Y...") -> a **knob** so the learner
  drags X and watches Y; reach for a **live simulation** only if measuring the
  outcome is the lesson.
- **A quotable / load-bearing sentence** -> a **statement / callout**.
- **A digression or optional depth** -> an **accordion**.
- **Parallel alternatives** (languages, approaches) -> **tabs**.
- **End of each major section** -> an optional **predict-and-reveal** self-check
  (a "think about it first" question + a revealed model answer) — not a graded
  quiz. Sibling `quiz-*.md` files become predict-and-reveal checks.
- **Something the learner would want to take further** (a parameter they tuned,
  a reflection, a topic to go deeper on) -> an **export / copy-as-prompt** so it
  leaves the page as a prompt for Claude or a mentor.
- **Course intro** -> a **hero** step; **course end** -> a **recap** + the
  **completion event**.

Density guidance: not every paragraph needs a widget. Interactivity should
earn its place — one well-chosen interactive block per concept beats five
decorative ones. Long readings get chaptered and made collapsible so the
single-file artifact stays navigable.

## Invariant frame vs. creative payload (where the latitude is)

The base constrains the **frame**, not the **ideas**. Keep one set of things
identical across every workbook; let the other set differ freely per concept and
course:

- **Invariant (always the same):** brand tokens (palette/typography), the
  accessibility contract, the navigation/flow shell (TOC, progress, module
  chunking), and the standalone / no-CDN technical rules. Consistency here is the
  point — don't reinvent it.
- **Creative (should differ — make it differ):** the prose and explanations, the
  analogies and examples, **what each diagram actually depicts**, *which*
  components appear and how they're composed, chart data, comparison axes, knob
  parameters, simulation design. Two different courses should produce visibly
  different workbooks — not the same skeleton with the text swapped.

### The kit is a floor, not a ceiling

The component kit is the reliable, tested baseline — **not the limit of what you
may build.** The biggest creative surface is **inline SVG**: the kit gives you
the styling shell (`.wb-figure`, brand colors, arrow markers), but *what the
figure depicts* — a hashing ring, a token-bucket, a state machine, a spatial
layout unique to the concept — is yours to author. When a concept needs a
visualization the kit doesn't have, **author it directly** with inline SVG/CSS,
honoring the design tokens + accessibility contract. Bespoke **static / SVG / CSS**
visualization is encouraged. The only thing to avoid is fragile, untested
**stateful JS** widgets — those should be added to the kit deliberately (and
tested), not improvised per page.

## Generation at scale: per-module fan-out (orchestration)

A per-course workbook can span many modules × text classes — more than one
context window composes well in a single pass. So generation is **size-gated**:

- **Small course** (≈ 2 modules or fewer) → compose **linearly** in one pass.
- **Larger course** → **map → reduce**: dispatch one `workbook-module-composer`
  subagent **per module** (in parallel, via the standard Task/Agent tool — never
  a session-specific orchestration tool; the command must stay portable), then
  the orchestrator **assembles** the returned fragments into the single
  self-contained workbook.

This is also a quiet win for variety: independent per-module composition resists
the "I already used a chart, reuse it" monotony a single pass can fall into.

### The fragment contract (what binds it together)

Each composer returns a **MANIFEST** (`{ moduleId, title, steps[], components_used }`)
plus a **FRAGMENT**: one `<div class="wb-module" id="mod-{N}">` of namespaced
`.wb-step`s and kit components — **not** a full document. Rules:

- **ID & attribute namespacing:** every `id` / `aria-controls` /
  `aria-labelledby` / label `for` / form-control `name` is prefixed `m{N}-`
  (module index) so fragments concatenate without id collisions, broken label
  associations, or cross-module radio-group bleed.
- **Fragment only:** no `<html>/<head>/<style>/<script>`, no `.wb-progress`, no
  `.wb-nav`, **no `.wb-module__nav` footer**. Those are global and the
  orchestrator owns them — the footer is added at assembly so the "Module N of M"
  arc is correct.
- **No hardcoded brand:** consume design tokens (`var(--wb-accent)`, …), never
  literal hex/fonts. Voice-neutral; the forward-hook teaser stays an overlay
  slot.

### Why it stays consistent (no stitched-together feel)

The shared `instruction-bundle-spec.yaml` (brand / a11y / kit) is the binding
contract handed to every composer, so fragments are visually uniform by
construction. The **assembler** then runs a normalization pass — verify each
fragment uses only allowed components, IDs are namespaced + globally unique,
a11y roles are present — and runs the variety/fit self-check on the assembled
whole. Drift is bounded by the frame, not left to chance.

## Consuming the consumer spec (`instruction-bundle-spec.yaml`)

The workbook's brand + structural vocabulary comes from the consumer's
`instruction-bundle-spec.yaml` (see the command for resolution order). This
skill reads:

- **`design`** (top level) -> `palette`, `typography`, `voice`, `spacing`,
  `components`. Inlined into the generated HTML as CSS custom properties.
- **`workbooks.scroll_behavior`** -> `doc` (navigable, module-chunked; **default**)
  or `stepped` (one screen at a time, for recording). No scroll-snap.
- **`workbooks.navigation`** -> TOC layout (sidebar desktop / collapsible mobile),
  arc indicator, and the forward-hook on the Next control (teaser = voice slot).
- **`workbooks.animation`** -> `on_enter` transition + `reduced_motion` policy.
- **`workbooks.step_patterns`** -> the available step layouts (hero, content,
  quiz, branch, progress, ...).
- **`workbooks.components`** (OPTIONAL) -> a consumer **override layer** on top
  of IDT's built-in catalog (the vocabulary above, owned by IDT base). When
  present, it may enable/disable components, set options, or opt into the
  stretch tier. **When absent, the full IDT catalog is available with sensible
  defaults** — the workbook is fully rich, not plainer. The consumer spec never
  *defines* the library; it only themes and tunes it.

### Validate before generating

Fail fast (with a clear, path-pointing error) when required keys are missing:
`design.palette.accent`, `design.typography.family.body`,
`workbooks.step_patterns`. Do not emit a half-themed artifact.

### Graceful degrade (never crash)

If `instruction-bundle-spec.yaml` cannot be resolved from any source, emit the
workbook anyway with **neutral defaults** (system-ui typography, a single
monochrome accent, a generic stepped layout) and a **visible WARNING** — both
to the user (stderr / chat) and as an HTML comment at the top of the generated
file. Never silently produce a neutral artifact as if the spec said so, and
never crash.

## Standalone HTML contract

- **No CDN runtime dependencies.** Corporate / school networks block them.
  Fonts are the one allowed exception — a Google Fonts `<link>` with a
  `system-ui` fallback in the font stack.
- **No build step, no framework.** Inline `<style>` and inline vanilla
  `<script>`. The file opens in any browser by double-clicking it.
- **Design CSS inlined at generation time** from the `design` palette/type.
- **Self-contained assets.** Any image is inlined (e.g. base64) or referenced
  relative to the file; nothing fetched at runtime.

## Accessibility contract (not optional)

- Full keyboard operation: Tab order follows reading order; **Enter / arrow
  keys advance** steps; all interactive controls are focusable.
- Landmark roles: each step is a `role="region"` with an `aria-label`; the
  nav layer is a `<nav>`; progress uses `role="progressbar"` with
  `aria-valuenow`.
- `prefers-reduced-motion: reduce` disables enter animations and smooth-scroll.
- Color contrast meets WCAG AA for text on the chosen background (verify the
  consumer's palette; the neutral defaults already pass).
- State conveyed by text + icon, not color alone (e.g. diff add/del, comparison).

## Anti-patterns

- Hardcoding any brand token, copy, or "Chimera"-ism in this skill or the base
  template. Brand lives in the consumer spec.
- Hardcoding the component catalog or step patterns here instead of reading
  them from the spec.
- Fragile, untested **stateful JS** widgets improvised per page. Compose
  stateful interactivity from the tested kit, and extend the kit deliberately
  (with tests) when a concept truly needs a new interaction. (This is *not* a
  ban on creative static / SVG / CSS visualization — author those freely; see
  "The kit is a floor, not a ceiling.")
- **Monotony.** Mapping every content type to the same component so every
  workbook is one shell with swapped text. Vary the representation to fit each
  concept; two different courses should look visibly different.
- Decorative interactivity. Every widget must teach something the prose alone
  could not convey as well.
- **Capture-to-nowhere widgets.** Do not add inputs that record a learner's
  answer and do nothing with it (ungraded quiz, reflection box). With no
  persistence they are dead ends. Use **predict-and-reveal** for self-check and
  **export** to take work forward.
- Persisting state in V1. The completion event is a fire-only hook; nothing
  else is stored.
