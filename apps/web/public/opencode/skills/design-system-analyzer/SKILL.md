---
name: design-system-analyzer
description: >
  Auto-activates when the user discusses design system gap analysis, component
  catalogs, or cross-referencing their project against a design system.
  Works for Flutter projects and for Vite projects (React, Vue, Svelte, Solid, vanilla).
  Triggers on: "design system gap", "component catalog", "what components am I missing",
  "Material 3 components", "Bootstrap 5 components", "shadcn components", "cross-reference design system",
  "compare against Carbon", "what widgets does Primer have that I don't", "design token audit",
  "missing UI primitives".
  Do NOT trigger for: generating specific feature components (use /atomic-design-toolkit:generate),
  or general framework development questions.
---

# Design System Analyzer

You detected that the user wants to compare their project against a design system's component catalog. This works for both Flutter and Vite codebases.

## What To Do

1. **Detect the stack** so you know which design systems are compatible:
   - `pubspec.yaml` → Flutter (use Material 3 / Cupertino / Spectrum Flutter implementations)
   - `vite.config.*` or `"vite"` in `package.json` → Vite (use any web-compatible system)

2. **Ask which design system they want to compare against** (or infer from context). Stack-appropriate options:

   | Stack | Compatible design systems |
   |-------|---------------------------|
   | Flutter | Material 3, Cupertino, Fluent 2 (ports), Carbon (ports), Spectrum Flutter |
   | Vite + React | Material 3 (MUI), Tailwind + shadcn, Carbon, Fluent UI, Ant Design, Chakra, Radix, Cloudscape, Polaris, Atlassian, Primer, Spectrum (React Aria), Lightning, Headless UI |
   | Vite + Vue | Material (Vuetify), Ant Design Vue, Element Plus, Naive UI, Headless UI Vue, Radix Vue |
   | Vite + Svelte | Skeleton UI, Melt UI, shadcn-svelte, Carbon Svelte |
   | Vite + Solid | Kobalte, shadcn-solid |
   | Vite + Vanilla | Bootstrap 5, Bulma, UIkit, Tailwind + HeroUI, Material Web components |

3. **Suggest the dedicated command** for a full gap analysis:
   > Use `/atomic-design-toolkit:audit :{system}` for a full gap analysis, or `/atomic-design-toolkit:audit :audit:{stack}:{system}` for combined component + bundle-health audit.

4. **If the question is quick** (e.g. "does Carbon have a TreeView equivalent?"), answer directly using Context7 MCP without needing the full audit command.

5. **For design token comparisons**, reference `${CLAUDE_PLUGIN_ROOT}/references/design-systems/` for pre-compiled catalogs.

## Context7 Integration

```
resolve-library-id: "{design system name}"
query-docs:
  libraryId: "{resolved ID}"
  query: "list all components with descriptions"
```

## Key Unique Components Per System

Read `${CLAUDE_PLUGIN_ROOT}/references/design-systems/` for detailed catalogs (`material3.md`, `mui.md`, `cupertino.md`, `carbon.md`, `bootstrap5.md`, `tailwind-shadcn.md`, `vuetify.md`, `ant-design.md`). Quick reference:

### Flutter-native
- **Material 3**: Badge, BottomSheet, NavigationRail, SearchBar, SegmentedButton
- **Cupertino**: ActionSheet, ContextMenu, DatePicker, SegmentedControl
- **Spectrum**: CoachMark, IllustratedMessage, StatusLight

### Web-native (Vite-compatible)
- **Bootstrap 5**: Offcanvas, Toast, Accordion, Carousel, Scrollspy (needs JS plugins + Popper)
- **Tailwind + shadcn**: Command, DataTable, InputOTP, Sheet, Resizable (Radix-powered)
- **Carbon**: StructuredList, ContentSwitcher, InlineNotification, TreeView
- **Headless UI**: Accessibility-first patterns (ARIA, keyboard nav, focus trap)
- **Atlassian**: InlineEdit, DynamicTable, Flag notifications
- **Cloudscape**: AppLayout, SplitPanel, Wizard
- **Primer**: Timeline, StateLabel, Blankslate
- **Polaris**: AccountConnection, CalloutCard, IndexTable
- **Ant Design**: Cascader, Transfer, TreeSelect
- **Chakra UI**: Editable, PinInput, Show/Hide
- **Radix UI**: HoverCard, NavigationMenu, ScrollArea

## Framing the Gap Report

For any stack, the gap report should include:

- **Present** — components the project already has (even if named differently).
- **Missing** — components in the catalog with no project equivalent.
- **Partial** — project has a component but it lacks variants the catalog provides.
- **Extra** — project components that do not map to the catalog (worth reviewing for invention vs duplication).

On Vite projects, also flag:

- **Mis-sourced** — a catalog component re-implemented from scratch when a packaged version exists (e.g. hand-rolled accordion instead of Bootstrap 5's `.accordion`).
- **Vendor-forked** — a catalog component copied into `public/` or `vendor/` rather than imported via npm.
