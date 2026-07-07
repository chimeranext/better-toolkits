---
name: widget-decomposition
description: >
  Auto-activates when the user is working on a UI component that needs decomposition
  into the Atomic Design hierarchy. Works for Flutter widgets and for Vite components
  (React, Vue, Svelte, Solid, vanilla JS+TS modules with HTML partials).
  Triggers on: "decompose this widget", "decompose this component", "this widget is too big",
  "refactor into atoms", "split this into molecules", "extract reusable component",
  "widget is monolithic", "component is monolithic", "too many responsibilities",
  "move to core/widgets", "move to src/components", "create atom from this",
  "Widgetbook entry", "Storybook story", "Histoire story".
  Do NOT trigger for: design system comparisons (use design-system-analyzer),
  full codebase audits (use /atomic-design-toolkit:audit command), or non-UI code.
---

# Component Decomposition Advisor

You detected that the user is working on a UI component that needs decomposition into the Atomic Design hierarchy. This skill applies to **Flutter** widgets and **Vite** components (React / Vue / Svelte / Solid / vanilla JS+TS with HTML partials).

## Stack Detection

Before proposing a decomposition, identify the stack:

- `pubspec.yaml` at repo root → **Flutter**
- `vite.config.{js,ts,mjs,cjs}` at repo root or `"vite"` in `package.json` devDependencies → **Vite**
- Within Vite, sub-detect from `package.json`: React (`react`), Vue (`vue`), Svelte (`svelte`), Solid (`solid-js`), or **Vanilla** when none of those are present

File conventions differ per stack — the Atomic Design methodology does not.

## Atomic Design Levels

Read `${CLAUDE_PLUGIN_ROOT}/references/atomic-methodology.md` for the full methodology.

Quick reference:

| Level | Responsibility | State? | Examples |
|-------|---------------|--------|----------|
| **Atom** | Single-purpose UI element, no business logic | No (stateless) | Button, Avatar, Badge, TextInput, Icon |
| **Molecule** | Atoms composed with local interaction logic | Minimal (form state) | SearchBar, UserChip, RatingStars |
| **Organism** | Molecules with data binding and state management | Yes (provider / store / hook) | UserList, CommentThread, ProductCard |
| **Template** | Page layout structure, slots for organisms | No (layout only) | DashboardTemplate, DetailTemplate |
| **Page** | Template bound to route and data providers | Yes (route + DI) | DashboardPage, ProfilePage |

## When a Component Needs Decomposition

Signals are consistent across stacks, with framework-specific thresholds:

- **Size** — Flutter widget >150 lines; React/Vue/Svelte component >250 lines; vanilla HTML partial >400 lines.
- **Mixing layout + logic + state** — Concerns should live at different atomic levels.
- **Used in 2+ features** — Candidate for extraction to a shared location.
- **Stateful primitive** — A "button atom" that owns a store / context / hook is misclassified; it is really an organism.
- **Inline compositions** — Sub-components built inline should become their own files so they can be tested and reused.
- **Missing gallery entry** — A shared component without a Widgetbook / Storybook / Histoire story is harder to discover and review.

## How To Help

1. Read the component the user is working on.
2. Identify which parts are atoms, molecules, and organisms.
3. Propose a decomposition table (same format as `/atomic-design-toolkit:generate`).
4. Ask for approval before refactoring.
5. Generate the decomposed files with the appropriate gallery entries (Widgetbook for Flutter, Storybook / Histoire for Vite SPA frameworks, a static demo page or Playwright visual test for vanilla Vite).

## File Placement Rules

### Flutter
- Shared widgets → `core/widgets/{atoms|molecules|organisms}/`
- Feature-specific → `features/{feature}/presentation/{templates|pages}/`
- Widgetbook → `{widget_name}.widgetbook.dart` alongside the widget

### Vite — React / Vue / Svelte / Solid
- Shared components → `src/components/{atoms|molecules|organisms}/`
- Templates / layouts → `src/layouts/` or `src/templates/`
- Pages / routes → `src/pages/` or `src/routes/`
- Stories → `{ComponentName}.stories.{tsx,jsx,vue,svelte}` alongside the component (Storybook) or `{ComponentName}.story.{tsx,vue,svelte}` (Histoire)

### Vite — Vanilla (Seacrets pattern)
- A "component" is a triple: HTML partial + ESM module + SCSS/CSS
- Atoms / molecules / organisms split across three parallel directories:
  - `resources/views/{atoms|molecules|organisms}/`
  - `resources/js/{atoms|molecules|modules}/`
  - `resources/scss/{atoms|molecules|organisms}/`
- Templates → `resources/views/layouts/`
- Pages → `resources/views/pages/` (or rendered by a server-side controller)

## Anti-Patterns

### Cross-Stack
- Never hardcode colors — use the stack's token system.
- Never skip gallery entries for shared components.
- Never put business logic in atoms or molecules.
- Never create a page without a template.

### Flutter-Specific
- Use `Theme.of(context).colorScheme` / `textTheme`, never literal `Color(0x...)` values.
- Use the project's state management (Riverpod / Bloc / Provider) in organisms, not `setState`.

### Vite-Specific
- React / Vue / Solid: tokens come from CSS variables or Tailwind theme — never hardcode hex values in JSX / templates.
- Vanilla + Bootstrap: use Bootstrap utility classes or Sass variables; never inline styles.
- Keep the partial / module / style triple co-located so a reviewer can find all three in one place.
