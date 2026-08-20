# /workbook-generate — protocol SSOT

Harness-agnostic body. Thin entry: `commands/workbook-generate.md`.

---

# Workbook Generate

You are generating a **standalone interactive workbook** — a single,
self-contained HTML file that renders a course's **text classes** (`text-*.md`)
as an interactive explainer. The default flow is a **navigable document chunked
by module** ("lesson"): one module shows at a time, switched from a table of
contents (a sticky sidebar on desktop, a collapsible "Contents" menu on mobile)
— the Articulate-Rise lesson model, not one endless scroll. A **stepped**
(one-screen-at-a-time) flow is also available for screen-recording.

This is the student-facing sibling of `course-visualize` (instructor analytics
view). It is distinct from `slides-generate`, which turns a **video brief** into
a deck. Workbooks consume the **reading classes**, not video briefs.

Read the design system first:
`${CLAUDE_PLUGIN_ROOT}/skills/workbook-generate/SKILL.md` — it defines the
component kit, the content-shape -> component mapping rules, the accessibility
contract, and the spec-consumption + graceful-degrade rules.

**Arguments format**: `{course-slug} [--scope course|module] [--module {module-slug}]`
- `course-slug`: the course to render. Resolved against the consumer's content
  layout (e.g. `content/courses/{course-slug}/` in a chimera-academy-shaped repo).
- `--scope`: `course` (default) emits one workbook over all modules; `module`
  emits one workbook for a single module (requires `--module`).
- `--module`: the module slug, when `--scope module`.

## Phase 1 — Resolve the consumer spec (brand + structural vocabulary)

The workbook's palette, typography, voice, scroll behaviour, step patterns, and
component catalog come from the consumer's `instruction-bundle-spec.yaml`.
Resolve it in this order:

1. **Sibling-repo path first**: `../{consumer}/instruction-bundle-spec.yaml`
   (e.g. `../chimera-academy/instruction-bundle-spec.yaml`).
2. **Remote raw fallback** (5s timeout): the consumer's documented raw URL
   (e.g. `https://raw.githubusercontent.com/chimeranext/chimera-academy/main/instruction-bundle-spec.yaml`).
3. **Graceful degrade**: if neither resolves, continue with **neutral defaults**
   (system-ui typography, a single monochrome accent, a generic stepped layout)
   and emit a **visible WARNING** — both to the user and as an HTML comment at
   the top of the generated file. Never crash, and never silently behave as if
   the spec had requested neutral defaults.

**Validate before generating** (fail fast with a path-pointing error) that the
resolved spec has: `design.palette.accent`, `design.typography.family.body`,
and `workbooks.step_patterns`. Read:
- `design` -> palette / typography / voice / spacing / components.
- `workbooks.scroll_behavior`, `workbooks.animation`, `workbooks.step_patterns`.
- `workbooks.components` (OPTIONAL) -> **consumer overrides on top of IDT's
  built-in component library**. The canonical catalog ships in IDT base (this
  command's skill + the base template) and is voice-neutral — the consumer spec
  is NOT the source of the library. When present, this key lets a consumer
  enable/disable components, set options, or opt into stretch-tier components.
  **When absent, use IDT's full built-in catalog with sensible defaults** — the
  workbook is fully rich, not plainer. The library lives in IDT; only brand
  theming and thin preferences live in the consumer spec.

## Phase 2 — Discover & order the course content

1. Locate the course root (e.g. `content/courses/{course-slug}/`).
2. Enumerate modules (e.g. `module-NN-*/`) and order them by their numeric
   prefix.
3. Within each module's `classes/` directory, collect every **`text-*.md`**
   reading. Order them by the `order` frontmatter field (fall back to the
   filename's numeric prefix).
4. For `--scope module`, restrict to the named module only.
5. Note sibling artifacts for cross-reference (do NOT embed them):
   - `quiz-*.md` -> fold in as module **checkpoints** (see Phase 3).
   - `video-*.md`, `slides-*.html`, `challenge-*.md` -> may be **referenced**
     with a symbolic ref / link, never embedded (video embedding is out of
     scope).
6. Read each reading's frontmatter (`title`, `order`, `duration_min`, `module`,
   `course`, `tags`) and body (H1 -> H2 -> H3, lists, tables, code, prose).

## Phase 2.5 — Execution strategy (linear vs. per-module fan-out)

Choose how to compose the workbook based on course size:

- **Small course** (≈ 2 modules or fewer, or little total reading) — compose
  **linearly** in this session (Phases 3–4 inline). Simplest; no drift risk.
- **Larger course** — **fan out**: dispatch one
  `${CLAUDE_PLUGIN_ROOT}/agents/workbook-module-composer.md` subagent **per
  module, in parallel** (via the standard Task/Agent tool). This keeps each
  agent's context focused on one module, handles big courses without exhausting
  the window, and tends to vary visualizations across modules. This uses
  ordinary subagents — **NOT** any session-specific orchestration tool — so the
  command stays portable across consumer installs.

When fanning out, pass each composer: `module_index` (its 1-based position, used
as the `m{N}-` ID namespace), `module_path`, the ordered `text_classes` list,
`module_title`, the resolved `design` tokens + enabled `components`, and any
`sibling_artifacts`. Each returns a **MANIFEST + a namespaced `.wb-module`
FRAGMENT** per that agent's output contract — not a full HTML. Collect all
fragments + manifests for Phase 4 assembly.

Both paths produce the same thing — composed module chunks. Phase 3 is the
composition ruleset (applied inline when linear, or by each composer when fanned
out); Phase 4 assembles.

## Phase 3 — Map content to components

These rules govern composing **each module's chunk** — applied inline (linear)
or by each `workbook-module-composer` subagent (fan-out). Apply the
**content-shape -> component mapping** from the skill. Summary:

- Course -> module **chapters** + a **table of contents** + course **progress**.
- Each reading -> a run of steps in its module chapter; each `H2` -> a **step**;
  open a step with a one-line **lede** when it helps frame the section.
- Tables -> **comparison diagram** / **tabs** / **chart** (by intent).
- Ordered process lists -> **flow diagram** / stepper.
- Fenced code -> **annotated code block** (highlight tokens by role: `kw`/`str`/`num`/`fn`/`cmt`).
- Load-bearing sentence -> **statement / callout**; a memorable/authoritative line -> **quote**.
- A value that's one side of a split (e.g. a probability, P(1) vs P(0)) -> a
  **knob** with the `is-split` two-color bar so the viz matches the caption.
- Optional depth -> **accordion**; parallel alternatives -> **tabs**.
- End of each major section -> an optional **predict-and-reveal** self-check
  (think first, then reveal the answer — not a graded quiz); `quiz-*.md` ->
  predict-and-reveal checks.
- A tuned parameter / reflection / topic to go deeper -> an **export /
  copy-as-prompt** so it leaves the page for Claude or a mentor.
- Course intro -> **hero**; course end -> **recap** + **completion event**.

Interactivity must either teach by being *felt* (knobs, diagrams, reveals) or
*close the loop* (export). Never add a widget that captures an answer and does
nothing with it — V1 persists nothing.

These mappings are **heuristics, not a lookup table** — pick the representation
that best illuminates each concept and **vary across the course** (don't render
the same component for every section). Honour the consumer spec's
`workbooks.components` toggles, but the kit is a **floor, not a ceiling**: when a
concept needs a visualization the kit lacks, **author it directly** (inline
SVG/CSS within the design tokens + a11y contract). Reserve the "compose from the
tested kit" discipline for fragile *stateful JS* — static/SVG/CSS creativity is
encouraged. Interactivity must earn its place; prefer one well-chosen block per
concept over decorative ones. See the skill's "Invariant frame vs. creative
payload" and "The kit is a floor, not a ceiling".

## Phase 4 — Generate the standalone HTML

1. Start from the base template:
   `${CLAUDE_PLUGIN_ROOT}/assets/templates/workbook/workbook-base.html`. It
   ships the full CSS runtime, the vanilla-JS flow / progress / disclosure /
   knob / export engine, and example markup for every component.
2. Inline the resolved `design` palette/typography as the template's CSS custom
   properties (`:root` variables). Under graceful-degrade, keep the neutral
   defaults already in the template.
3. Replace the content region between the WORKBOOK CONTENT markers with the
   composed module chunks, in module order. **If you fanned out (Phase 2.5):**
   drop in each composer's `FRAGMENT` verbatim, ordered by `module_index`;
   verify every `id` is `m{N}-`-namespaced and **globally unique** across
   fragments (fix or re-request any collision); the composers deliberately omit
   the TOC, progress bar, and module footers — **you own those** and build them
   here (the omitted module footer is why the "Module N of M" arc stays correct
   at assembly). Build the `.wb-nav` table of contents from the `MANIFEST`s
   (module links `#mod-{N}` + step links `#m{N}-step-{k}`).
4. Honour `workbooks.scroll_behavior` — `doc` (navigable, module-chunked;
   **default**) or `stepped` (one screen at a time) — and `workbooks.animation`
   (enter transition + `prefers-reduced-motion`). In `doc` mode the TOC is a
   sticky sidebar on desktop and a collapsible "Contents" menu on mobile; each
   module ends with an **arc indicator** ("Module N of M") + a **forward-hook**
   Next control. The hook's teaser line is a **voice slot** — leave it empty in
   the base draft; the consumer overlay fills it with momentum copy.
5. Enforce the **standalone contract**: no external `<script>`, no CDN runtime
   deps; fonts via a Google Fonts `<link>` with `system-ui` fallback; design CSS
   inlined; any image inlined or relative.
6. Enforce the **accessibility contract**: `role="region"` + `aria-label` per
   step, `<nav>` for the TOC, `role="progressbar"` with `aria-valuenow`,
   keyboard advance (Enter / arrows), reduced-motion support, AA contrast,
   state conveyed by text + icon (not color alone).
7. **State is in-memory only** — wire the completion event as a fire-only hook;
   do NOT add `localStorage`, `postMessage`, or any persistence.

## Phase 4.5 — Variety / fit self-check (before saving)

Before writing the file, review the draft against monotony — the goal is a
workbook tailored to *this* course, not a template fill:

- Would **two different courses** produce visibly different workbooks, or the
  same shell with the text swapped? If the latter, rework the weakest sections.
- Did you **default to the same component** for every section of a given type
  (e.g. every comparison rendered identically)? Vary the representation.
- Is each visualization the **best for its concept**, or just the easy mapping?
  If a concept would be clearer as a bespoke inline-SVG figure the kit doesn't
  have, author it (within the design tokens + a11y contract).
- Did interactivity **earn its place**, or is it decorative?

This is a quality pass on the *creative payload* only — the invariant frame
(brand, accessibility, navigation, standalone rules) stays exactly as generated.

## Phase 5 — Save & report

1. **Save**:
   - `--scope course` (default): `content/courses/{course-slug}/workbook-{course-slug}.html`
   - `--scope module`: `workbook-{module-slug}.html` under the module directory
   (other consumers may use their own content layout — follow theirs.)
2. **Report** to the user:
   - Course + module count + total readings rendered
   - Step count and a breakdown by component type
   - Whether the consumer spec resolved (and from where) or graceful-degrade
     neutral defaults were used (state the WARNING prominently if so)
   - The output file path
3. **Suggest**: "Open in a browser to review; traverse the modules and complete
   a few checks. Answers reset on refresh (expected — persistence is deferred)."

## Phase 6 — Validate the generated file

Run the output validator on the file you just wrote:

```
python3 ${CLAUDE_PLUGIN_ROOT}/scripts/validate_workbook.py <output-path>
```

It checks the invariants the artifact must hold: **standalone** (no external
`<script src>` / CDN), **in-memory only** (no `localStorage` / `sessionStorage`
/ `indexedDB` / `postMessage`), **globally-unique element ids** (critical after
a fan-out assembly), and warns on missing a11y landmarks or a missing
`system-ui` font fallback. **Errors exit non-zero — fix them before reporting
the workbook as done.** (If `${CLAUDE_PLUGIN_ROOT}` is unavailable, run it by its
repo-relative path `scripts/validate_workbook.py`.)

## Overlay invocation (post-base-draft)

After producing the base draft for this command (the generated workbook HTML
plus its step/component manifest), follow
`${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` to discover and apply
consumer overlays. The runtime walks `<cwd>/.claude-plugin/plugin.json`, finds
skills declaring `overlay_target: ["workbook-generate"]` in their frontmatter,
sorts them by `overlay_priority`, and applies them in order.

For this command, expect (when a consumer like `chimera-academy` is installed):
- Structural overlays (priority ~50) — enforce the consumer's workbook step
  patterns, component selection, and module-chapter conventions on top of the
  base draft.
- Voice / editorial overlays (priority ~100) — apply the consumer's brand
  palette/typography, voice transforms, and any momentum/recap copy on the
  hero/recap steps.

Layer 1 invariants (`au_id`, `activity_type`, and the stable cmi5/xAPI
identifiers — applied to the underlying text-class AUs, not the workbook
wrapper) remain immutable; overlay outputs that mutate them abort the run with a
clear error pointing at the offending `SKILL.md` path. Layer 2 contradictions
(e.g. decorative-only interactivity, missing accessibility roles) log a visible
warning but do not abort. Discovery returns zero overlays in a consumer without
`.claude-plugin/plugin.json` — the base workbook is generated directly with
neutral defaults, with no warning.

## `${CLAUDE_PLUGIN_ROOT}` defensive note

This command resolves sibling files via the plugin substitution token
`${CLAUDE_PLUGIN_ROOT}` (the skill, the base template, the overlay protocol).
In normal in-plugin execution the token expands to the IDT install path and the
reads succeed. If you are running from a direct checkout of this repo (or any
context where the plugin substitution layer is not active), the token will not
expand and the reads fail with "no such file or directory". When that happens:
detect the failed resolution, emit a **visible warning** naming the token and
the path it should have expanded to, fall back to reading the sibling files by
their repo-relative paths (`skills/workbook-generate/SKILL.md`,
`assets/templates/workbook/workbook-base.html`,
`assets/runtime/overlay-protocol.md`), and continue. Never crash; never silently
skip the design system.
