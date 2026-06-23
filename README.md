# atomic-design-toolkit

Atomic Design toolkit for **Flutter** and **Vite** — decompose features into atoms, molecules, organisms, templates, and pages. Audit your codebase (including Vite bundle health: duplicates, hashless assets, mixed major versions, vendorized libs, dual lockfiles). Cross-reference against 18+ design systems. Drive phased remediation with `/migrate`.

A Claude Code plugin by [Luis Andres Pena Castillo](https://github.com/lapc506).

## Install

### Claude Code

```bash
claude plugin add chimeranext/atomic-design-toolkit
```

### OpenCode (npm)

```bash
npx @chimeranext/atomic-design-toolkit install
```

Other commands:

```bash
npx @chimeranext/atomic-design-toolkit update      # Sync assets to latest version
npx @chimeranext/atomic-design-toolkit doctor       # Health check
npx @chimeranext/atomic-design-toolkit uninstall    # Remove all managed files
```

## Quickstart

The toolkit auto-detects your stack (Flutter vs Vite) and picks framework-appropriate conventions. Pick the guide that matches your project.

### Quickstart — Vite (React / Vue / Svelte / Solid / vanilla)

Works out of the box on any project with a `vite.config.{js,ts,mjs,cjs}` at the repo root or `"vite"` in `package.json` devDependencies.

**1. Inventory + bundle health, no remediation yet**

```bash
/atomic-design-toolkit:audit
```

Claude detects React / Vue / Svelte / Solid / vanilla from `package.json`, inventories every component under `src/components/` (and `resources/views/` for vanilla), and runs the 10 bundle-health signals: duplicate deps, legacy `public/` JS/CSS, mixed major versions, vendorized libs, hashless assets, outdated deps, CI audit coverage, HMR, visual regression, dual lockfiles.

**2. Emit a structured report**

```bash
/atomic-design-toolkit:audit :vite :report
```

Writes `.atomic-design-toolkit/reports/audit-{timestamp}-vite.md` with:
- Finding IDs (`B1`, `W1`, `N1`…) stable across re-audits
- Severity × Effort × Risk × Phase classification
- `Blocks` / `Blocked by` dependency graph
- TL;DR + Re-audit checklist + Suggested phases

**3. Cross-reference a design system (optional)**

```bash
/atomic-design-toolkit:audit :vite :tailwind-shadcn :report       # Vite + React + shadcn
/atomic-design-toolkit:audit :vite :bootstrap5 :report             # Vite vanilla + Bootstrap
/atomic-design-toolkit:audit :vite :vuetify :report                # Vite + Vue 3
```

The report gains a "Design System Gap" appendix: components you have vs. components the catalog defines, classified as Present / Missing / Partial / Extra / Mis-sourced.

**4. Generate missing components**

```bash
/atomic-design-toolkit:generate <feature-name>
```

For a Vite + React project, Claude produces a full decomposition and emits:
```
src/components/atoms/Button/
  ├── Button.tsx              # component
  ├── Button.stories.tsx      # Storybook story (auto-detected)
  ├── Button.test.tsx         # Vitest + RTL (auto-detected)
  └── index.ts
```

For Vite + Vue / Svelte / Solid the files change shape (`*.vue` / `*.svelte`), stories point at Histoire or Storybook (whichever is configured), and state sources wire into Pinia / svelte/store / whatever `package.json` declares.

For Vite **vanilla** (Seacrets pattern — Laravel / Django / Rails + Vite for assets) the output is a triple per component:
```
resources/views/atoms/button.blade.php       # HTML partial
resources/js/atoms/button.js                  # ESM module with init(el, options)
resources/scss/atoms/_button.scss             # Co-located styles
```

**5. Drive phased remediation**

```bash
/atomic-design-toolkit:migrate                                    # plan from latest report
/atomic-design-toolkit:migrate :execute                           # interactive, one phase per session
/atomic-design-toolkit:migrate :execute :phase=2 :linear          # just phase 2, also create Linear issues
```

`/migrate` reads the report, builds a dependency graph, orders findings into the 6-phase model (Baseline → Infrastructure → Dependency consolidation → Feature modules → Legacy asset removal → Hardening), and writes a plan to `.atomic-design-toolkit/plans/migration-{timestamp}.md`. In `:execute` mode, every phase requires explicit approval and must pass its re-audit commands before the next phase can start.

### Quickstart — Flutter

Works out of the box on any project with a `pubspec.yaml` at the repo root.

**1. Inventory**

```bash
/atomic-design-toolkit:audit
```

Claude scans every `*.dart` file for `extends StatelessWidget` / `StatefulWidget` / `ConsumerWidget` / `HookWidget`, classifies by atomic level based on location (`core/widgets/atoms|molecules|organisms/`, `features/*/presentation/`), and flags monoliths, misplaced widgets, duplicates, and inline builders.

**2. Cross-reference a design system**

```bash
/atomic-design-toolkit:audit :material3                # Material 3 for Flutter
/atomic-design-toolkit:audit :cupertino                # Apple HIG (platform-adaptive)
/atomic-design-toolkit:audit :carbon                   # IBM Carbon Flutter port
```

**3. Generate missing widgets**

```bash
/atomic-design-toolkit:generate <feature-name>
```

Produces: widget files under `core/widgets/` or `features/{feature}/presentation/`, Widgetbook entries (`{widget_name}.widgetbook.dart`), and state providers (Riverpod / Bloc / Provider — whatever the project uses).

### Stack → Design System Matrix

If you are not sure which flag to pass:

| Your stack | Recommended design system flag | Pre-compiled catalog |
|-----------|-------------------------------|----------------------|
| Flutter | `:material3` or `:cupertino` or `:carbon` | ✅ |
| Vite + React (greenfield) | `:tailwind-shadcn` | ✅ |
| Vite + React (enterprise MUI) | `:mui` | ✅ |
| Vite + React (enterprise Ant) | `:ant-design` | ✅ |
| Vite + React (AWS console style) | `:cloudscape` | via Context7 |
| Vite + React (Shopify / Atlassian / GitHub) | `:polaris` / `:atlassian` / `:primer` | via Context7 |
| Vite + Vue 3 | `:vuetify` or `:ant-design` | ✅ |
| Vite + Svelte | `:tailwind-shadcn` (shadcn-svelte) | via Context7 |
| Vite + vanilla (Laravel / Django / Rails) | `:bootstrap5` | ✅ |

Catalogs marked ✅ are pre-compiled in `references/design-systems/`. The rest resolve through Context7 MCP at query time.

## What's Inside

### Commands (3)

| Command | Description |
|---------|-------------|
| `/atomic-design-toolkit:generate <feature> [:<stack>]` | Generate a complete component hierarchy for a feature (Flutter and Vite) |
| `/atomic-design-toolkit:audit [:<stack>] [:<system>] [:report]` | Scan codebase for decomposable components + bundle health + design system gap analysis. Optional `:report` emits a structured report file. |
| `/atomic-design-toolkit:migrate [report-path] [:plan\|:execute] [:phase=N] [:linear]` | Consume an audit report and generate a phased remediation plan with per-phase checkpoints and re-audit verification |

### Skills (2)

| Skill | Triggers when you... |
|-------|---------------------|
| `design-system-analyzer` | Discuss design system gaps, component catalogs, or cross-referencing |
| `widget-decomposition` | Work on a monolithic widget that needs splitting |

## Modes

### Generate Mode

Auto-detects the stack (Flutter vs Vite) and emits framework-appropriate files.

```bash
/atomic-design-toolkit:generate rescue-alerts              # auto-detect
/atomic-design-toolkit:generate checkout :vite             # force Vite
/atomic-design-toolkit:generate profile :flutter           # force Flutter
```

Produces a full Atomic Design decomposition:
1. Gathers feature requirements (OpenSpec, Linear, or interactive)
2. Loads the project's design system tokens (Flutter `Theme`, Tailwind config, CSS vars, Sass vars, or token JSON)
3. Proposes decomposition table (atoms, molecules, organisms, templates, pages)
4. Generates component files + gallery entries + state sources, matching the detected framework:
   - **Flutter** → widgets + Widgetbook entries + Riverpod/Bloc/Provider
   - **Vite + React / Vue / Svelte / Solid** → components + Storybook/Histoire stories + hooks/stores (TanStack Query, Zustand, Redux Toolkit, Jotai, Pinia, svelte/store)
   - **Vite vanilla** (Seacrets pattern) → HTML partial + ESM module (`init()`) + SCSS partial + static gallery demo

### Audit Mode

Auto-detects the stack (Flutter vs Vite) and runs the appropriate checks. Both paths produce an inventory, classify decomposable components, and (optionally) cross-reference a design system. The Vite path adds a **Bundle Health** axis — ten signals covering duplicates, legacy `public/` assets, mixed major versions, vendorized libs, hashless assets, outdated dependencies, CI audit coverage, HMR, visual regression, and dual lockfiles.

```bash
/atomic-design-toolkit:audit                         # Auto-detect stack, pure scan
/atomic-design-toolkit:audit :flutter                # Force Flutter
/atomic-design-toolkit:audit :vite                   # Force Vite

# Design system gap analysis
/atomic-design-toolkit:audit :material3              # Flutter / Material Web
/atomic-design-toolkit:audit :mui                    # Vite + React + MUI
/atomic-design-toolkit:audit :bootstrap5             # Vite + Bootstrap 5
/atomic-design-toolkit:audit :tailwind-shadcn        # Vite + React + shadcn
/atomic-design-toolkit:audit :vuetify                # Vite + Vue 3
/atomic-design-toolkit:audit :ant-design             # Vite + React / Vue
/atomic-design-toolkit:audit :carbon                 # Flutter or Vite (React)
/atomic-design-toolkit:audit :cupertino              # Flutter

# Combined: audit + design system lens + report
/atomic-design-toolkit:audit :audit:flutter:material3
/atomic-design-toolkit:audit :audit:vite:bootstrap5
/atomic-design-toolkit:audit :audit:vite:tailwind-shadcn:report
```

**Stack detection:** `pubspec.yaml` → Flutter · `vite.config.*` (or `"vite"` in `package.json`) → Vite. Vite sub-detects React / Vue / Svelte / Solid / vanilla (server-rendered templates + Vite for assets — the Laravel / Django / Rails pattern).

**Bundle Health (Vite):** see [`references/vite-audit-checklist.md`](./references/vite-audit-checklist.md) for the full ten-signal methodology, derived from a real frontend modernization that cut asset weight 55% and file count 93%.

**Report mode (`:report`):** emits `.atomic-design-toolkit/reports/audit-{timestamp}-{stack}.md` — a structured markdown file with stable finding IDs (B1, W1, N1…), Severity/Effort/Risk/Phase classification, and a Blocks/Blocked-by dependency graph. This is the input `/atomic-design-toolkit:migrate` consumes to build remediation plans. Schema documented in [`references/audit-report-schema.md`](./references/audit-report-schema.md).

### Migrate Mode

```bash
/atomic-design-toolkit:migrate                                   # plan the latest audit report
/atomic-design-toolkit:migrate :execute                          # interactive execution (phase by phase)
/atomic-design-toolkit:migrate :execute :phase=2                 # run a single phase
/atomic-design-toolkit:migrate :linear                           # also emit Linear issues
```

`/migrate` reads an audit report, validates its schema, builds a `Blocked by` dependency graph, orders findings into the 6-phase model (Baseline / Infrastructure / Dependency consolidation / Feature modules / Legacy asset removal / Hardening), and writes a plan file to `.atomic-design-toolkit/plans/migration-{timestamp}.md`. With `:execute`, it runs **one phase per session** with explicit user approval between phases and mandatory re-audit verification before marking a phase complete.

**18+ supported design systems:**

| System | Stack fit | Key Unique Components |
|--------|-----------|----------------------|
| Material 3 | Flutter, Vite (Material Web) | Badge, BottomSheet, Chip, NavigationRail, SearchBar |
| MUI | Vite + React | SpeedDial, Stepper, Autocomplete, DataGrid (X) |
| Cupertino | Flutter | ActionSheet, ContextMenu, DatePicker, SegmentedControl |
| Fluent 2 | Vite (Fluent UI React) | Persona, Toolbar, DataGrid, InfoBar, TeachingBubble |
| Carbon | Flutter, Vite (React / Web Components) | StructuredList, ContentSwitcher, InlineNotification, TreeView |
| Bootstrap 5 | Vite (vanilla / jQuery) | Offcanvas, Toast, Accordion, Carousel, Scrollspy |
| Tailwind + shadcn | Vite + React | Command, DataTable, InputOTP, Sheet, Resizable |
| Vuetify | Vite + Vue 3 | VDataTable, VStepper, VExpansionPanels, VVirtualScroll |
| Headless UI | Vite (React / Vue) | Accessibility-first patterns (ARIA, focus trap) |
| Atlassian | Vite (React) | InlineEdit, DynamicTable, Flag notifications |
| Cloudscape | Vite (React) | AppLayout, SplitPanel, Wizard |
| Primer | Vite (React / CSS) | Timeline, StateLabel, Blankslate |
| Polaris | Vite (React) | AccountConnection, CalloutCard, IndexTable |
| Spectrum | Flutter, Vite (React Aria) | CoachMark, IllustratedMessage, StatusLight |
| Lightning | Vite (React / Web Components) | ActivityTimeline, DataTable, Path |
| Ant Design | Vite (React / Vue) | Cascader, Transfer, TreeSelect, Watermark, Tour |
| Chakra UI | Vite (React) | Editable, PinInput, Show/Hide |
| Radix UI | Vite (React) | HoverCard, NavigationMenu, ScrollArea |

## Atomic Design Levels

| Level | Responsibility | State? | Flutter location | Vite location (SPA) | Vite location (vanilla) |
|-------|---------------|--------|------------------|---------------------|-------------------------|
| **Atom** | Single-purpose UI element | No | `core/widgets/atoms/` | `src/components/atoms/` | `resources/views/atoms/` + `resources/js/atoms/` |
| **Molecule** | Atoms with local interaction | Minimal | `core/widgets/molecules/` | `src/components/molecules/` | `resources/views/molecules/` + `resources/js/molecules/` |
| **Organism** | Molecules with data binding | Yes | `core/widgets/organisms/` | `src/components/organisms/` | `resources/views/organisms/` + `resources/js/modules/` |
| **Template** | Page layout with slots | No | `features/*/templates/` | `src/layouts/` or `src/templates/` | `resources/views/layouts/` |
| **Page** | Template bound to route | Yes | `features/*/pages/` | `src/pages/` or `src/routes/` | `resources/views/pages/` |

## Architecture

```
atomic-design-toolkit/
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
├── commands/
│   ├── generate.md          # Feature component generation (Flutter + Vite)
│   ├── audit.md             # Codebase audit + bundle health + design system gaps + report emission
│   └── migrate.md           # Phased remediation from audit reports
├── skills/
│   ├── design-system-analyzer/
│   │   └── SKILL.md         # Auto-activates on DS discussions
│   └── widget-decomposition/
│       └── SKILL.md         # Auto-activates on widget refactoring
├── references/
│   ├── atomic-methodology.md
│   ├── vite-audit-checklist.md        # Bundle-health signals for Vite
│   ├── audit-report-schema.md         # /audit :report ↔ /migrate contract
│   └── design-systems/
│       ├── material3.md                # Flutter / Material Web
│       ├── mui.md                      # Vite + React
│       ├── cupertino.md
│       ├── carbon.md
│       ├── bootstrap5.md               # Vite vanilla + jQuery
│       ├── tailwind-shadcn.md          # Vite + React + shadcn
│       ├── vuetify.md                  # Vite + Vue 3
│       └── ant-design.md               # Vite + React / Vue
└── README.md
```

## Requirements

- **Claude Code** — the CLI or IDE extension
- **Flutter project** (with a widget directory structure) **or Vite project** (with `vite.config.*` or `"vite"` in `package.json`)
- **Context7 MCP** — optional, for querying design system docs

## License

[Business Source License 1.1](./LICENSE) — you may use, modify, and redistribute for non-competitive purposes. Converts to Non-Profit OSL 3.0 after 5 years.
