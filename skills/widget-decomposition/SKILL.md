---
name: widget-decomposition
description: >
  Auto-activates when the user is working on Flutter widgets and needs help
  decomposing them into the Atomic Design hierarchy. Triggers on: "decompose this widget",
  "this widget is too big", "refactor into atoms", "split this into molecules",
  "extract reusable widget", "widget is monolithic", "too many responsibilities",
  "move to core/widgets", "create atom from this", "Widgetbook entry".
  Do NOT trigger for: design system comparisons (use design-system-analyzer),
  full codebase audits (use /audit command), or non-Flutter code.
---

# Widget Decomposition Advisor

You detected that the user is working on a Flutter widget that needs decomposition into the Atomic Design hierarchy.

## Atomic Design Levels

Read `${CLAUDE_PLUGIN_ROOT}/references/atomic-methodology.md` for the full methodology.

Quick reference:

| Level | Responsibility | State? | Examples |
|-------|---------------|--------|----------|
| **Atom** | Single-purpose UI element, no business logic | No (stateless) | Button, Avatar, Badge, TextInput, Icon |
| **Molecule** | Atoms composed with local interaction logic | Minimal (form state) | SearchBar, UserChip, RatingStars |
| **Organism** | Molecules with data binding and state management | Yes (provider/bloc) | UserList, CommentThread, ProductCard |
| **Template** | Page layout structure, slots for organisms | No (layout only) | DashboardTemplate, DetailTemplate |
| **Page** | Template bound to route and data providers | Yes (route + DI) | DashboardPage, ProfilePage |

## When a Widget Needs Decomposition

- **>150 lines** — Too much in one file
- **Mixing layout + logic + state** — Should be separated by level
- **Used in 2+ features** — Should be extracted to `core/widgets/`
- **Has `setState` but is called an "atom"** — Misclassified, should be organism
- **Builds other widgets inline** — The inline widgets should be their own files

## How To Help

1. Read the widget the user is working on
2. Identify which parts are atoms, molecules, and organisms
3. Propose a decomposition table (same format as `/atomic-design-toolkit:generate`)
4. Ask for approval before refactoring
5. Generate the decomposed files with Widgetbook entries

## File Placement Rules

- **Shared widgets** → `core/widgets/{atoms|molecules|organisms}/`
- **Feature-specific** → `features/{feature}/presentation/{templates|pages}/`
- **Widgetbook** → `{widget_name}.widgetbook.dart` alongside the widget

## Anti-Patterns

- Never hardcode colors — use `Theme.of(context).colorScheme`
- Never hardcode text styles — use `Theme.of(context).textTheme`
- Never skip Widgetbook entries
- Never put business logic in atoms or molecules
- Never create a page without a template
