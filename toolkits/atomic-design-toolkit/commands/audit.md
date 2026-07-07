---
description: "Scan a Flutter or Vite codebase for decomposable components, run design system gap analysis, and optionally emit a structured report that feeds /migrate"
argument-hint: "[:stack] [:design-system] [:report]  e.g. :vite, :flutter, :material3, :bootstrap5, :audit:vite:bootstrap5:report"
---

# /audit — Component Audit + Design System Gap Analysis

You are an expert UI architect scanning codebases for missing, monolithic, or misplaced components. Works for **Flutter** and **Vite** projects (React / Vue / Svelte / Solid / vanilla JS+TS). Optionally cross-references against 16+ design systems. When run with `:report`, emits a structured markdown file that `/atomic-design-toolkit:migrate` consumes to generate a phased remediation plan.

## Usage

```bash
# Pure audit — auto-detect stack
/atomic-design-toolkit:audit

# Force a stack
/atomic-design-toolkit:audit :flutter
/atomic-design-toolkit:audit :vite

# Design system gap analysis
/atomic-design-toolkit:audit :material3
/atomic-design-toolkit:audit :bootstrap5
/atomic-design-toolkit:audit :tailwind-shadcn
/atomic-design-toolkit:audit :carbon

# Combined: audit + design system lens
/atomic-design-toolkit:audit :audit:material3
/atomic-design-toolkit:audit :audit:vite:bootstrap5

# Emit a structured report file (input to /migrate)
/atomic-design-toolkit:audit :report
/atomic-design-toolkit:audit :vite :report
/atomic-design-toolkit:audit :audit:vite:bootstrap5:report
```

## Step 0: Stack Detection

Before anything, decide which codebase type we are auditing.

### Detection Rules

| Signal | Conclusion |
|--------|-----------|
| `pubspec.yaml` present at repo root | **Flutter** |
| `vite.config.{js,ts,mjs,cjs}` present at repo root | **Vite** |
| `package.json` with `"vite"` in `devDependencies` | **Vite** |
| Both present | Prefer explicit `:flutter` / `:vite` flag; otherwise ask |
| Neither present | Abort — this audit does not support the stack |

Run this single pass:

```bash
ls pubspec.yaml vite.config.js vite.config.ts vite.config.mjs vite.config.cjs 2>/dev/null
# and, if no vite.config.* surfaced, probe package.json
grep -l '"vite"' package.json 2>/dev/null
```

If the argument starts with `:flutter` or `:vite`, honor it and skip auto-detection.

### Sub-Framework Detection (Vite only)

Scan `package.json` dependencies to classify the Vite variant:

| Dep signal | Framework | File extensions |
|-----------|-----------|-----------------|
| `react` + `react-dom` | React | `.tsx` / `.jsx` |
| `vue` | Vue | `.vue` |
| `svelte` | Svelte | `.svelte` |
| `solid-js` | Solid | `.tsx` / `.jsx` |
| None of the above | **Vanilla** (server-rendered + Vite assets) | `.ts` / `.js` modules + template partials |

Note: the **vanilla** variant is very common (Laravel / Django / Rails / plain HTML projects that adopted Vite only for asset bundling). The Seacrets.Online modernization pattern lives here.

---

## Flutter Path

> Applies when stack is Flutter.

### Step F1: Inventory Existing Widgets

```bash
find . -name "*.dart" -type f \
  | xargs grep -l "extends StatelessWidget\|extends StatefulWidget\|extends ConsumerWidget\|extends HookWidget" 2>/dev/null
```

Classify by atomic level based on directory structure and widget complexity.

### Step F2: Classify Existing Widgets

| Classification | Criteria | Action |
|---------------|----------|--------|
| **Well-decomposed** | Correct granularity for its level | Skip |
| **Monolithic** | >150 lines, mixing layout + logic + state | Flag for decomposition |
| **Misplaced** | In atoms/ but has state management | Flag for reclassification |
| **Duplicated** | Similar widgets across features | Flag for extraction to core/ |
| **Inline** | Widget built inline without its own file | Flag for extraction |

### Step F3: Identify Missing Components

Cross-reference with component.gallery (https://component.gallery/components/):

**Essential Components Checklist:**
- [ ] AppBar variants (standard, search, contextual)
- [ ] Bottom sheets (modal, persistent)
- [ ] Cards (info, action, selection)
- [ ] Chips (filter, input, suggestion)
- [ ] Dialogs (alert, confirmation, full-screen)
- [ ] Empty states (no data, error, offline)
- [ ] Form fields (text, dropdown, date, checkbox, radio, switch, slider)
- [ ] Loading indicators (skeleton, shimmer, circular, linear)
- [ ] Navigation (bottom bar, rail, drawer, tabs)
- [ ] Progress indicators (determinate, indeterminate, step)
- [ ] Search (bar, full-screen, with suggestions)
- [ ] Snackbars / Toasts
- [ ] Tags / Labels / Badges

### Step F4: Generate Flutter Audit Report

```markdown
## Widget Audit Report (Flutter)

### Current Inventory
| Level | Count | Files |
|-------|-------|-------|
| Atoms | N | ... |
| Molecules | N | ... |
| Organisms | N | ... |
| Feature Pages | N | ... |
| Loose Widgets | N | ... |

### Widgets to Decompose
| Widget | File | Lines | Issue | Recommendation |
|--------|------|-------|-------|----------------|

### Missing Components
| Component | Priority | Design System | Needed For |
|-----------|----------|--------------|-----------|

### Duplicated Widgets
| Widget A | Widget B | Similarity | Extract As |
|----------|----------|-----------|-----------|
```

---

## Vite Path

> Applies when stack is Vite. Read `${CLAUDE_PLUGIN_ROOT}/references/vite-audit-checklist.md` for the full set of bundle-health + enforcement checks. This path covers **four axes**: components (V1-V3, V5), bundle health (V4), atomic-design enforcement (V7), and report generation (V6). Note that V7 runs after V5 but before V6 — its findings must be included in the report — so the step numbers read V1 → V2 → V3 → V4 → V5 → V7 → V6 in execution order.

### Step V1: Map Vite Entry Points

Parse `vite.config.{js,ts,mjs,cjs}` to discover:
- `build.rollupOptions.input` — every entry bundle (may be an object keyed by feature)
- `resolve.alias` — path aliases that rewrite imports
- `publicDir` — the un-hashed passthrough folder (default `public/`)
- `base` — deployment base URL
- Plugin list — React, Vue, Svelte, Solid, Tailwind, Vitest, Storybook, Playwright

Every entry listed in `build.rollupOptions.input` is a boundary for de-duplication and code-splitting analysis later.

### Step V2: Inventory Components

Scan by the framework detected in Step 0:

```bash
# React / Solid
rg -l "export default (function|const) \w+" --type-add 'jsxlike:*.{tsx,jsx}' -tjsxlike

# Vue
rg -l "<script" --type vue

# Svelte
rg -l "<script" --type svelte

# Vanilla (Seacrets pattern) — ESM modules are the unit
rg -l "^export " --type ts --type js src/ resources/js/
# Template partials live alongside — discover them by include/extends directives
rg -l "@extends\|@include\|{% extends\|{% include\|<%- include" templates/ views/ resources/views/ 2>/dev/null
```

For the **vanilla** variant, a "component" is typically a triple: partial HTML + ESM module + SCSS/CSS. Flag any module that exists without a corresponding partial (or vice versa) as a decomposition smell.

### Step V3: Classify Existing Components

| Classification | Criteria | Action |
|---------------|----------|--------|
| **Well-decomposed** | Correct granularity + co-located styles + story/test | Skip |
| **Monolithic** | >250 lines (JSX/SFC) or >400 lines (vanilla partial) mixing layout + data + state | Flag for decomposition |
| **Misplaced** | Under `atoms/` but imports a store/context/fetch | Flag for reclassification |
| **Duplicated** | Similar JSX/templates across features | Flag for extraction to `src/components/` |
| **Inline** | Built inline in a page file without its own module | Flag for extraction |
| **Undocumented** | No Storybook/Histoire story and not a page | Flag as story-missing |

Atomic-level file conventions (adopt whatever the project already uses; these are defaults):

| Level | React / Vue / Svelte / Solid | Vanilla + Vite |
|-------|------------------------------|----------------|
| Atom | `src/components/atoms/` | `resources/views/atoms/` + `resources/js/atoms/` |
| Molecule | `src/components/molecules/` | `resources/views/molecules/` + `resources/js/molecules/` |
| Organism | `src/components/organisms/` | `resources/views/organisms/` + `resources/js/modules/` |
| Template | `src/layouts/` or `src/templates/` | `resources/views/layouts/` |
| Page | `src/pages/` or `src/routes/` | `resources/views/pages/` (or controller-rendered) |

### Step V4: Bundle Health Audit (Vite-Specific)

This is the axis Flutter audits do not cover. Read the full checklist at `${CLAUDE_PLUGIN_ROOT}/references/vite-audit-checklist.md`. Run at least these ten signals:

| # | Check | How to detect |
|---|-------|--------------|
| 1 | **Duplicate dependencies** | `npm ls <lib> --all` — more than one version resolved for the same package (jQuery, lodash, Bootstrap, etc.) |
| 2 | **Legacy `public/` assets** | Files under `publicDir` that are `.js` / `.css` and not referenced by any Vite entry — they bypass hashing and bundling |
| 3 | **Mixed major versions of UI libs** | e.g. `bootstrap@4` and `bootstrap@5` co-existing, `@mui/material@4` and `@mui/material@5` |
| 4 | **Vendorized libraries** | A `vendor/`, `public/lib/`, `public/vendor/`, or `resources/lib/` folder holding libs that already exist on npm — unpatched and invisible to `npm audit`. Do NOT scan `src/` (application code). |
| 5 | **Hashless assets in production HTML** | `<script src="/js/app.js">` without a content hash — breaks cache invalidation across deploys. The Vite dev entry `<script type="module" src="/src/main.tsx">` is expected and gets hashed at build time. |
| 6 | **Abandoned / outdated dependencies** | `npm outdated` (or `bun outdated`) showing majors behind, or packages last published >3 years ago |
| 7 | **No dependency audit in CI** | No `npm audit` / `pnpm audit` / `yarn audit` / `bun audit` step in any workflow under `.github/workflows/` |
| 8 | **No HMR in dev** | `vite.config.*` sets `server.hmr: false`, or dev entry does a full reload |
| 9 | **No visual regression** | No Playwright / Chromatic / Percy / Loki config — regressions only caught by manual QA |
| 10 | **Dual / competing lockfiles** | Two lockfiles coexist (e.g. `bun.lock` + `package-lock.json`), or the surviving lockfile does not match the `packageManager` field in `package.json` |

For each finding, record: severity (blocker / warning / info), evidence (file path or command output), and remediation (one-line action).

### Step V5: Identify Missing Components

Cross-reference with component.gallery (https://component.gallery/components/) and the detected design system.

**Essential Components Checklist (Vite projects):**
- [ ] App shell (header + nav + main + footer layout)
- [ ] Navigation (top bar, sidebar, mobile drawer, breadcrumbs)
- [ ] Cards (info, action, selection, media)
- [ ] Form controls (text, textarea, select, multi-select, date, time, file, checkbox, radio, switch, slider)
- [ ] Form layout (fieldset, form group, inline validation, error summary)
- [ ] Modals / Dialogs (alert, confirm, full-screen sheet)
- [ ] Toasts / Snackbars / Inline notifications
- [ ] Tables (sortable, filterable, paginated, virtual-scroll)
- [ ] Lists (flat, grouped, virtualized)
- [ ] Empty / Error / Loading states (skeletons, spinners, retry)
- [ ] Tabs / Accordion / Disclosure
- [ ] Tooltip / Popover / HoverCard
- [ ] Badges / Tags / Chips / Pills
- [ ] Avatars / User identity primitives
- [ ] Progress (determinate, indeterminate, stepper)
- [ ] Search (inline, command-palette, with suggestions)
- [ ] Pagination

### Step V7: Atomic-Design Enforcement Audit (Hook Presence)

Bundle-health and component-inventory checks (V1-V5) tell you *what is broken today*. They do not tell you whether the project will **drift again tomorrow**. V7 measures the four-cure defense-in-depth pattern (premortem reference: legacy-ticket component-layer Conway's Law, example-platform 2026-05-14, $394K already spent + $324K forward extrapolation if unaddressed). Read the full setup walkthrough at `${CLAUDE_PLUGIN_ROOT}/references/atomic-design-hooks-setup.md`.

The four cures are:

1. **Ownership** — pillar list + atomic taxonomy documented (`.atomic-design-rules.json` + CLAUDE.md / AGENTS.md section).
2. **Harness CI** — workflow runs atomic-design / structural guard on every PR.
3. **Agent rule** — CLAUDE.md or AGENTS.md names the rule so agents inherit it via context.
4. **Hooks** — PreToolUse + PostToolUse hooks block the mistake at write-time (the load-bearing cure — CI is too late, agent rules are advisory, ownership docs are passive).

Run these seven checks. Each takes <300ms; the whole V7 step should complete in <2s on a typical repo.

| # | Check | How to detect |
|---|-------|--------------|
| 1 | **Repo-level PreToolUse hook for component placement** | `ls .claude/hooks/ 2>/dev/null \| grep -E 'pre-write.*component\|pre-tool-use.*component'`; then `jq '.hooks.PreToolUse' .claude/settings.json` to confirm registration. |
| 2 | **Repo-level PostToolUse hook for drift signals** | `ls .claude/hooks/ 2>/dev/null \| grep -E 'post-write.*component\|post-tool-use'`; then `jq '.hooks.PostToolUse' .claude/settings.json`. |
| 3 | **Toolkit-level hooks installed** | Probe `package.json` / `bun.lock` / `pnpm-lock.yaml` for a toolkit dependency that ships hooks (e.g. `make-no-mistakes-toolkit@>=1.14`). Confirm with `find node_modules/make-no-mistakes-toolkit/.claude/hooks -type f 2>/dev/null` or the toolkit's documented hook path. |
| 4 | **`.atomic-design-rules.json` at repo root** | `test -f .atomic-design-rules.json && jq -e '.pillars\|length > 0' .atomic-design-rules.json`. Without this file, hooks have nothing to enforce — see `atomic-design-hooks-setup.md` for the canonical shape. |
| 5 | **CLAUDE.md / AGENTS.md atomic-design rule** | `rg -i 'atomic.?design\|pillar.{0,20}taxonomy\|atoms/molecules/organisms' CLAUDE.md AGENTS.md 2>/dev/null \| head -3`. Should name the pillar list + atomic taxonomy + exception marker convention. |
| 6 | **CI workflow with atomic-design lint** | `rg -l 'components-guard\|atomic-design-guard\|structural-guard\|atomic-design-rules' .github/workflows/ .gitlab-ci.yml 2>/dev/null`. Bonus: also check `package.json` `scripts` for an `atomic:lint` or `lint:components` target. |
| 7 | **Pre-commit hook with atomic-design guard** | `cat lefthook.yml .lefthook.yml 2>/dev/null \| rg 'atomic\|component-guard'`; or `ls .husky/ 2>/dev/null` + `rg 'atomic\|component-guard' .husky/`; or `rg 'atomic\|component-guard' .pre-commit-config.yaml 2>/dev/null`. |

#### Severity classification

For each missing check, severity depends on what V1-V5 already found:

| State | Severity |
|-------|----------|
| All 4 cures present | `info` — do not emit E-findings; record under "Passing checks" |
| 1-3 cures missing, V1-V5 showed no drift | `warning` per missing cure |
| 1-3 cures missing, V1-V5 showed drift (monoliths, phantom hierarchies, dead duplicates, etc.) | `blocker` per missing cure (drift will recur) |
| 0 cures present, V1-V5 showed no drift | `warning` per missing cure |
| 0 cures present, V1-V5 showed drift | **top E-finding escalated to `blocker`**; compounded risk per premortem §5.2 ($324K forward extrapolation) overrides per-finding severity |

The compounding-risk override exists because a repo with active drift AND no enforcement is the exact failure mode the premortem describes. Do not soften it.

#### What to record per finding

Each E-finding takes a stable ID `E{n}` (numbering starts at 1, within tier, stable across re-audits — same convention as `B`/`W`/`I`):

- **Cure Layer** — one of: `Repo PreToolUse hook`, `Repo PostToolUse hook`, `Toolkit hooks`, `.atomic-design-rules.json`, `Agent rule (CLAUDE.md/AGENTS.md)`, `CI workflow`, `Pre-commit hook`.
- **Severity** — per the matrix above.
- **Evidence** — file path that was probed and the result (e.g. `ls .claude/hooks/ → no matches for pre-write*component*`).
- **Remediation** — "Install from make-no-mistakes-toolkit v1.14+ per `references/atomic-design-hooks-setup.md`" (link to the relevant section).

#### Execution sketch

```bash
# Probes run from repo root
test -f .atomic-design-rules.json && echo "E4 pass" || echo "E4 missing"
rg -l 'atomic.?design\|atoms/molecules' CLAUDE.md AGENTS.md 2>/dev/null | head -1 || echo "E5 missing"
ls .claude/hooks/ 2>/dev/null | grep -E 'pre-write.*component' || echo "E1 missing"
ls .claude/hooks/ 2>/dev/null | grep -E 'post-write.*component' || echo "E2 missing"
rg -l 'components-guard\|atomic-design-guard\|structural-guard' .github/workflows/ 2>/dev/null || echo "E6 missing"
cat lefthook.yml .lefthook.yml 2>/dev/null | rg -q 'atomic\|component-guard' || \
  ls .husky/ 2>/dev/null && rg -l 'atomic\|component-guard' .husky/ 2>/dev/null || \
  echo "E7 missing"
grep -q 'make-no-mistakes-toolkit' package.json 2>/dev/null && \
  find node_modules/make-no-mistakes-toolkit/.claude/hooks -type f 2>/dev/null | head -1 || \
  echo "E3 missing"
```

#### Why this step matters

The premortem's claim, in one line: removing any of the four cures leaves a hole the chain of causation will find. V7 is the audit's way of telling consumers which holes are open. A project can have perfect inventory, zero monoliths, and clean atomic levels — and still be one quarter away from re-introducing all of them if no hooks are installed.

---

### Step V6: Generate Vite Audit Report

```markdown
## Component Audit Report (Vite)

### Stack Detected
- Framework: {React | Vue | Svelte | Solid | Vanilla}
- Design system: {Bootstrap 5 | Tailwind + shadcn | MUI | Chakra | ...}
- Package manager: {npm | pnpm | yarn}
- Build entries: {N entries from vite.config}

### Current Inventory
| Level | Count | Files |
|-------|-------|-------|
| Atoms | N | ... |
| Molecules | N | ... |
| Organisms | N | ... |
| Templates | N | ... |
| Pages | N | ... |
| Loose / unclassified | N | ... |

### Components to Decompose
| Component | File | Lines | Issue | Recommendation |
|-----------|------|-------|-------|----------------|

### Bundle Health Findings
| # | Signal | Severity | Evidence | Remediation |
|---|--------|----------|----------|-------------|
| 1 | ... | blocker | ... | ... |

### Atomic-Design Enforcement Findings
| ID | Cure Layer | Severity | Evidence | Remediation |
|----|-----------|----------|----------|-------------|
| E1 | Repo PreToolUse hook (component placement) | warning | (not found at .claude/hooks/) | Install from make-no-mistakes-toolkit v1.14+ — see `references/atomic-design-hooks-setup.md` |

### Missing Components
| Component | Priority | Design System | Needed For |
|-----------|----------|--------------|-----------|

### Duplicated Components
| Component A | Component B | Similarity | Extract As |
|-------------|-------------|-----------|-----------|

### Story / Test Coverage
| Component | Story? | Unit test? | Visual regression? |
|-----------|--------|-----------|-------------------|
```

---

## Design System Gap Analysis

Works on both Flutter and Vite. Use Context7 MCP to query current docs for the selected design system. Read `${CLAUDE_PLUGIN_ROOT}/references/design-systems/` for pre-compiled component catalogs.

### Process

1. **Resolve library**: Use Context7 `resolve-library-id` for the design system
2. **Query components**: Get the full component catalog
3. **Cross-reference**: Compare against the project's existing components
4. **Classify gaps**: For each missing component, propose atom / molecule / organism classification
5. **Generate** (via `/atomic-design-toolkit:generate`): Create the missing components using the design system's patterns adapted to the project's framework

### Supported Design Systems

| System | Stack fit | Key Unique Components |
|--------|-----------|----------------------|
| Material 3 | Flutter, Vite (Material Web) | Badge, BottomSheet, Chip, NavigationRail, SearchBar |
| MUI | Vite + React | SpeedDial, Stepper, DataGrid (X), Stack, Autocomplete |
| Cupertino | Flutter | ActionSheet, ContextMenu, DatePicker, SegmentedControl |
| Fluent 2 | Vite (Fluent UI React) | Persona, Toolbar, DataGrid, InfoBar, TeachingBubble |
| Carbon | Vite (React / Web Components) | StructuredList, ContentSwitcher, InlineNotification, TreeView |
| Bootstrap 5 | Vite (vanilla / jQuery / Blazor) | Offcanvas, Toast, Accordion, Carousel, ScrollSpy |
| Tailwind + shadcn | Vite (React) | Command, DataTable, InputOTP, Sheet, Resizable |
| Vuetify | Vite + Vue 3 | VDataTable, VStepper, VExpansionPanels, VVirtualScroll |
| Headless UI | Vite (React / Vue) | Accessibility-first patterns (ARIA, keyboard nav, focus trap) |
| Atlassian | Vite (React) | InlineEdit, DynamicTable, Flag notifications |
| Cloudscape | Vite (React) | AppLayout, SplitPanel, Wizard |
| Primer | Vite (React / CSS) | Timeline, StateLabel, Blankslate |
| Polaris | Vite (React) | AccountConnection, CalloutCard, IndexTable |
| Spectrum | Flutter, Vite (React Aria) | CoachMark, IllustratedMessage, StatusLight |
| Lightning | Vite (React / Web Components) | ActivityTimeline, DataTable, Path |
| Ant Design | Vite (React / Vue) | Cascader, Transfer, TreeSelect, Watermark, Tour |
| Chakra UI | Vite (React) | Editable, PinInput, Show/Hide |
| Radix UI | Vite (React) | HoverCard, NavigationMenu, ScrollArea |

### Adaptive Components (Flutter)

For platform-adaptive widgets, generate both Material and Cupertino variants:

```dart
class AdaptiveSwitch extends StatelessWidget {
  const AdaptiveSwitch({super.key, required this.value, required this.onChanged});
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return switch (Theme.of(context).platform) {
      TargetPlatform.iOS || TargetPlatform.macOS =>
        CupertinoSwitch(value: value, onChanged: onChanged),
      _ => Switch(value: value, onChanged: onChanged),
    };
  }
}
```

### Component Gallery (master reference)
- **All Components**: https://component.gallery/components/
- **All Design Systems**: https://component.gallery/design-systems/

---

## Report Mode (`:report`)

When `:report` is present in the argument list, after running the selected audit passes, write a structured markdown report to `.atomic-design-toolkit/reports/audit-{YYYYMMDD-HHMM}-{stack}.md`. This file is the contract `/atomic-design-toolkit:migrate` consumes.

### Process

1. Run the selected audit passes (stack detection, component inventory, bundle health, design system gap analysis — whatever the other flags request).
2. Read `${CLAUDE_PLUGIN_ROOT}/references/audit-report-schema.md` for the required file format.
3. Classify every finding on **four dimensions**, not just severity:
   - **Severity** — `blocker` / `warning` / `info`
   - **Effort** — `S` (≤2h) / `M` (≤1 day) / `L` (>1 day) / `XL` (>1 week)
   - **Risk** — one-line plain-English consequence of leaving the finding unfixed
   - **Phase fit** — integer 0-5 matching the 6-phase migration model (Baseline / Infrastructure / Dependency consolidation / Feature modules / Legacy asset removal / Hardening)
4. Assign stable IDs: `B{n}` (blockers), `W{n}` (warnings), `I{n}` (info), `E{n}` (atomic-design enforcement findings from Step V7). Numbering within each tier starts at 1 and is stable across re-audits of the same project — if a finding disappears, its ID is retired, not reused.
5. Record dependency relations: every finding's `Blocks` and `Blocked by` lines must reference other IDs in the same report (or `(none)`). E-findings frequently block B/W findings because hooks would have prevented those B/W findings from regressing.
6. Surface **new findings** — ones that did not match any known signal — under a `### New findings` subsection with IDs prefixed `N{n}`. These are candidates for future additions to `vite-audit-checklist.md`.
7. Emit a `## Suggested Phases` appendix listing finding IDs by phase number — this is the seed `/migrate` uses to draft the remediation plan. E-findings typically land in Phase 5 (Hardening) unless V1-V5 surfaced active drift, in which case the top E-finding moves to Phase 1 (Infrastructure) per the compounded-risk override.
8. Emit a `## Re-audit Checklist` appendix — one concrete command per remediated finding so the user can confirm the signal flipped to PASS.

### Output Checklist

- [ ] File written to `.atomic-design-toolkit/reports/audit-{YYYYMMDD-HHMM}-{stack}.md`.
- [ ] Frontmatter includes all required fields from the schema reference.
- [ ] TL;DR has exactly three sentences (stack summary → top risk → recommended next action referencing `/migrate`).
- [ ] Every finding has Severity / Effort / Risk / Phase fit / Signal / Evidence / Remediation / Blocks / Blocked by.
- [ ] Passing checks listed one-line each (no details needed).
- [ ] `.atomic-design-toolkit/` added to `.gitignore` if the team has not opted to commit reports.
- [ ] Atomic-Design Enforcement section present with E{n} findings from Step V7 (or "(none)" if all four cures are present).
- [ ] If all 4 cures present, no E findings in report — the four V7 passing checks instead appear under "Passing checks".
- [ ] If 0 cures present **and** V1-V5 component-layer drift was detected, the top E-finding is escalated to **`blocker`** severity (overrides per-finding severity because compounded risk is real per premortem §5.2 — $324K forward extrapolation).
- [ ] E-finding remediations link to `references/atomic-design-hooks-setup.md` and (when applicable) the `make-no-mistakes-toolkit` version that ships the hooks.

### Example Invocation

For the **example-platform** audit that produced 0 blockers, 2 warnings, and 1 new finding:

```bash
/atomic-design-toolkit:audit :vite :report
# → writes .atomic-design-toolkit/reports/audit-20260418-1530-vite.md
# → print the file path + TL;DR + the suggested /migrate command
```

See the full worked example inside `${CLAUDE_PLUGIN_ROOT}/references/audit-report-schema.md`.
