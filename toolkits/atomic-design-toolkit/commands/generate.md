---
description: "Generate Flutter or Vite component hierarchies for a feature following Atomic Design methodology"
argument-hint: "<feature-name> [:stack]  e.g. rescue-alerts, checkout :vite, profile :flutter"
---

# /generate — Atomic Design Component Generator

You are an expert UI architect generating production-ready component hierarchies following Atomic Design methodology. Works for **Flutter** and **Vite** projects (React / Vue / Svelte / Solid / vanilla JS+TS). You decompose features into atoms, molecules, organisms, templates, and pages — each as a reusable, tested, gallery-documented component.

## Usage

```bash
# Auto-detect stack
/atomic-design-toolkit:generate rescue-alerts
/atomic-design-toolkit:generate adoption-listings

# Force a stack (rare — only if both pubspec.yaml and vite.config.* exist)
/atomic-design-toolkit:generate checkout :vite
/atomic-design-toolkit:generate profile :flutter
```

The first positional argument is the feature name. Any argument starting with `:` is a flag (currently only `:flutter` / `:vite`).

## Step 0: Stack Detection

Before anything, decide which codebase type we are generating for.

| Signal | Conclusion |
|--------|-----------|
| `pubspec.yaml` at repo root | **Flutter** |
| `vite.config.{js,ts,mjs,cjs}` at repo root | **Vite** |
| `package.json` with `"vite"` in `devDependencies` | **Vite** |
| Both present | Honor the `:flutter` / `:vite` flag; otherwise ask the user |
| Neither present | Abort — this generator does not support the stack |

For Vite, sub-detect the framework from `package.json` dependencies:

| Dep signal | Framework | File extensions |
|-----------|-----------|-----------------|
| `react` + `react-dom` | React | `.tsx` / `.jsx` |
| `vue` | Vue | `.vue` |
| `svelte` | Svelte | `.svelte` |
| `solid-js` | Solid | `.tsx` / `.jsx` |
| None of the above | **Vanilla** | `.ts` / `.js` modules + HTML partials |

## Step 1: Gather Feature Requirements

1. **Check OpenSpec first:** Look in `openspec/changes/*/` for a change matching the feature name. Read `proposal.md`, `design.md`, and `tasks.md` for UI requirements.
2. **Check Linear:** If no OpenSpec match, search Linear MCP for issues referencing the feature.
3. **Check existing code:** Look in the project's feature directories for any existing implementation.
4. **If nothing found:** Ask the user to describe the screens and interactions needed.

Extract: screens, interactions, data displayed, roles, real-time updates.

## Step 2: Load Design System Context

Detect the project's design system by scanning for theme / token files. Different stacks expose tokens differently:

### Flutter
```bash
find . -name "app_colors.dart" -o -name "app_theme.dart" -o -name "tokens.json" 2>/dev/null
```
Read to understand color palette, typography, motion, spacing, Material 3 or Cupertino baseline.

### Vite
```bash
# Tailwind
ls tailwind.config.js tailwind.config.ts tailwind.config.cjs 2>/dev/null

# CSS custom properties (shadcn, Bootstrap 5 runtime vars, design-token exports)
rg -l '^:root|--[a-z]+:' src/ resources/ app/ 2>/dev/null | head

# Sass variables (Bootstrap, Bulma)
find src resources -name "_variables.scss" -o -name "tokens.scss" 2>/dev/null

# Design-token JSON (Style Dictionary, etc.)
find . -name "tokens.json" -not -path "*/node_modules/*" 2>/dev/null
```

Read whichever surfaces to understand colors, typography, spacing, breakpoints, radii, shadows.

Read `${CLAUDE_PLUGIN_ROOT}/references/atomic-methodology.md` for the decomposition rules that apply to every stack.

## Step 3: Decompose into Atomic Levels

Produce a decomposition table for user approval. The shape is the same for all stacks; only the "Props" / "State Provider" columns change vocabulary.

```markdown
## Atomic Decomposition: {feature-name}

### Atoms (single-purpose, no business logic)
| Component | Purpose | Props / Inputs | Design Token |
|-----------|---------|---------------|-------------|

### Molecules (atoms composed with local logic)
| Component | Atoms Used | Purpose |
|-----------|-----------|---------|

### Organisms (molecules with state / data binding)
| Component | Molecules Used | State Source |
|-----------|---------------|--------------|

### Templates (page layout structure, no data)
| Component | Organisms Used | Layout |
|-----------|---------------|--------|

### Pages (templates bound to routes and providers)
| Component | Template | Route | Guard |
|-----------|----------|-------|-------|
```

Wait for user approval before generating code.

---

## Flutter Path

> Applies when stack is Flutter.

### Step F4: Generate Widget Files

**The canonical home for shared widgets is the shared UI package** (`packages/{app}_ui` or `libs/{app}_ui`) — the app and the `apps/widgetbook` catalog are consumers via path dependencies, never the source. Detect it first:

```bash
ls packages/*_ui/pubspec.yaml libs/*_ui/pubspec.yaml 2>/dev/null
```

| Layout found | Target for atoms/molecules/organisms |
|--------------|--------------------------------------|
| Shared UI package exists | `{app}_ui/lib/src/{atoms\|molecules\|organisms}/`, re-exported from the package barrel (`lib/{app}_ui.dart`) |
| No shared UI package | **Offer to scaffold one** (`packages/{app}_ui` with pubspec, barrel, and atomic folders) before generating — this is the default path, not an extra. Only if the user declines, fall back to the legacy in-app layout `core/widgets/{atoms\|molecules\|organisms}/` and flag the gap in the summary |

**Feature widgets** (templates and pages) stay in the app: `features/{feature}/presentation/{templates|pages}/` — they bind app state and routes, so they don't belong in the UI package.

Follow existing patterns — read 2-3 existing widgets at each level before generating.

### Step F5: Generate Widgetbook Entries

If the monorepo has an `apps/widgetbook` catalog (see `/atomic-design-toolkit:widgetbook-setup`), generate one use case per shared widget under `apps/widgetbook/lib/use_cases/{atoms|molecules|organisms}/{widget_name}_use_case.dart`, importing the widget from the UI package. Otherwise create `{widget_name}.widgetbook.dart` alongside the widget with `@widgetbook.UseCase` annotations. At minimum: Default + All Variants use cases.

After generating, remind to run:
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### Step F6: Generate State Providers

For organisms and pages needing state, generate providers (Riverpod, Bloc, or whatever the project uses) in `features/{feature}/presentation/providers/`.

### Flutter Anti-Patterns

- Never hardcode colors — always use `Theme.of(context).colorScheme`
- Never hardcode text styles — always use `Theme.of(context).textTheme`
- Never skip Widgetbook entries — every widget gets at least one use case
- Never put business logic in atoms or molecules — that belongs in providers
- Never create a page without a template — templates define layout, pages bind data
- Never use `setState` in organisms — use the project's state management
- Never generate a shared widget into the app when a shared UI package exists — the package is the canonical home; the app and the widgetbook are consumers

---

## Vite Path

> Applies when stack is Vite. Before generating, read 2-3 existing components at each level so the new files match the project's conventions.

### Step V4: Generate Component Files

Pick the file layout by framework. **Always prefer the project's existing convention** when one is clearly in use — the table below is the default when the repo has no convention yet.

#### React / Solid
```
src/components/atoms/Button/
  ├── Button.tsx              # component
  ├── Button.stories.tsx      # Storybook story (if Storybook is configured)
  ├── Button.test.tsx         # Vitest + React Testing Library (if Vitest is configured)
  └── index.ts                # barrel re-export
```

#### Vue
```
src/components/atoms/Button/
  ├── Button.vue              # SFC
  ├── Button.story.vue        # Histoire story (if Histoire is configured)
  ├── Button.stories.ts       # Storybook story (if Storybook is configured)
  └── index.ts                # barrel re-export
```

#### Svelte
```
src/components/atoms/Button/
  ├── Button.svelte           # SFC
  ├── Button.stories.svelte   # Storybook story (if Storybook is configured)
  └── index.ts                # barrel re-export
```

#### Vanilla (Seacrets pattern — partial + module + styles)
```
resources/views/atoms/button.blade.php       # or .twig / .ejs / .hbs / .html
resources/js/atoms/button.js                 # ESM module; exports init(el, options)
resources/scss/atoms/_button.scss            # partial imported by the feature SCSS
```

**Location rules:**
- Shared components (used by 2+ features) → `src/components/{atoms|molecules|organisms}/` (or `resources/` equivalents for vanilla)
- Feature-specific components → `src/features/{feature}/{templates|pages}/`
- Templates define layout; pages bind data + route params

### Step V5: Generate Gallery Entries

For each shared component, generate a story or a visible demo:

- **Storybook present** (`.storybook/` folder exists) — emit `{Component}.stories.{tsx,vue,svelte}` with CSF 3 format (meta default + named exports per variant). At minimum: `Default` and `AllVariants`.
- **Histoire present** (`histoire.config.*` exists) — emit `{Component}.story.vue` / `.svelte` with `<Variant>` blocks.
- **Neither present** — emit a demo entry in a project gallery page (e.g. `src/pages/ui-gallery.{tsx,vue,svelte}`). For vanilla, append a section to a static `resources/views/pages/ui-gallery.blade.php` so reviewers can still see the component rendered.

Never silently skip the gallery step. If the project has no gallery framework, flag it in the summary so the user can add one.

### Step V6: Generate State Sources (organisms and pages only)

Detect the state tool from `package.json` and generate accordingly:

| Dep | Pattern | File |
|-----|---------|------|
| `@tanstack/react-query` | Query hook | `src/features/{feature}/hooks/useXyz.ts` |
| `zustand` | Store | `src/features/{feature}/stores/xyzStore.ts` |
| `@reduxjs/toolkit` | Slice | `src/features/{feature}/slices/xyzSlice.ts` |
| `jotai` | Atom | `src/features/{feature}/atoms/xyzAtom.ts` |
| `pinia` | Store | `src/features/{feature}/stores/xyz.ts` |
| `svelte/store` | Writable / derived | `src/features/{feature}/stores/xyz.ts` |
| None (vanilla) | Module with `init()` + event bus | `resources/js/modules/xyz.js` |

### Step V7: Generate Types (TypeScript projects)

Emit prop types / interfaces next to the component (React/Solid) or inside `<script lang="ts">` (Vue/Svelte). For shared domain types, place them in `src/types/` and import from there.

### Vite Anti-Patterns

**Cross-framework:**
- Never hardcode colors — use Tailwind tokens, CSS custom properties, or Sass variables (whichever the project uses).
- Never skip the gallery entry for shared components.
- Never put business logic in atoms or molecules — lift it to a store / hook / organism.
- Never create a page without a template — templates define layout, pages bind data.
- Never reach into `public/` for assets that should be imported through Vite — anything imported this way misses hashing and bundling.

**React-specific:**
- Never forget `React.memo` on atoms that re-render frequently in lists.
- Never use class components for new atoms — stick to function components + hooks.
- Never mix `useState` for server data — use the detected query library (TanStack Query, SWR, RTK Query).

**Vue-specific:**
- Never mix Options API and Composition API in the same file — pick one per file.
- Never skip `defineProps` / `defineEmits` type narrowing in TypeScript projects.

**Svelte-specific:**
- Never reach for custom stores when component-local state would suffice (atoms / molecules should own only local state).

**Vanilla-specific:**
- Never attach global DOM behavior at module top-level — export an `init(root?, options?)` function so the partial can be rendered multiple times.
- Never duplicate the styles between the ESM module and the SCSS partial — styles belong in the partial.
- Never ship inline `<script>` inside the HTML partial — keep logic in the ESM module.

## Step 8: Summary

Present files created, design tokens used, gallery framework status, and next steps. Include a checklist the user can run:

- [ ] Components compile and type-check.
- [ ] Gallery entries render for every shared component.
- [ ] State sources (if any) are wired into the organism / page.
- [ ] No new TypeScript / lint errors introduced.
- [ ] If Vite: no new `public/` assets added (everything imported through the Vite entry).
