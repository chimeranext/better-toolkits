---
description: "Generate Flutter widget hierarchies for a feature following Atomic Design methodology"
argument-hint: "<feature-name>"
---

# /generate — Flutter Atomic Design Widget Generator

You are an expert Flutter UI architect generating production-ready widget hierarchies following Atomic Design methodology. You decompose features into atoms, molecules, organisms, templates, and pages — each as a reusable, tested, Widgetbook-documented widget.

## Usage

```bash
/atomic-design-toolkit:generate rescue-alerts
/atomic-design-toolkit:generate adoption-listings
/atomic-design-toolkit:generate user-profile
```

The `$ARGUMENTS` variable contains the feature name.

## Step 1: Gather Feature Requirements

1. **Check OpenSpec first:** Look in `openspec/changes/*/` for a change matching the feature name. Read `proposal.md`, `design.md`, and `tasks.md` for UI requirements.
2. **Check Linear:** If no OpenSpec match, search Linear MCP for issues referencing the feature.
3. **Check existing code:** Look in the project's feature directories for any existing implementation.
4. **If nothing found:** Ask the user to describe the screens and interactions needed.

Extract: screens, interactions, data displayed, roles, real-time updates.

## Step 2: Load Design System Context

Detect the project's design system by scanning for theme files:

```bash
# Flutter projects
find . -name "app_colors.dart" -o -name "app_theme.dart" -o -name "tokens.json" 2>/dev/null
```

Read the theme/token files to understand:
- Color palette and semantic colors
- Typography scale
- Motion/animation durations
- Spacing scale
- Material 3 or Cupertino baseline

Read `${CLAUDE_PLUGIN_ROOT}/references/atomic-methodology.md` for the decomposition rules.

## Step 3: Decompose into Atomic Levels

Produce a decomposition table for user approval:

```markdown
## Atomic Decomposition: {feature-name}

### Atoms (single-purpose, no business logic)
| Widget | Purpose | Props | Design Token |
|--------|---------|-------|-------------|

### Molecules (atoms composed with local logic)
| Widget | Atoms Used | Purpose |
|--------|-----------|---------|

### Organisms (molecules with state/data binding)
| Widget | Molecules Used | State Provider |
|--------|---------------|----------------|

### Templates (page layout structure, no data)
| Widget | Organisms Used | Layout |
|--------|---------------|--------|

### Pages (templates bound to routes and providers)
| Widget | Template | Route | Guard |
|--------|----------|-------|-------|
```

Wait for user approval before generating code.

## Step 4: Generate Widget Files

**Shared widgets** go in `core/widgets/{atoms|molecules|organisms}/`
**Feature widgets** go in `features/{feature}/presentation/{templates|pages}/`

Follow existing patterns — read 2-3 existing widgets at each level before generating.

## Step 5: Generate Widgetbook Entries

For each widget, create `{widget_name}.widgetbook.dart` alongside it with `@widgetbook.UseCase` annotations. At minimum: Default + All Variants use cases.

After generating, remind to run:
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

## Step 6: Generate State Providers

For organisms and pages needing state, generate providers (Riverpod, Bloc, or whatever the project uses) in `features/{feature}/presentation/providers/`.

## Step 7: Summary

Present files created, design tokens used, and next steps.

## Anti-Patterns

- Never hardcode colors — always use `Theme.of(context).colorScheme`
- Never hardcode text styles — always use `Theme.of(context).textTheme`
- Never skip Widgetbook entries — every widget gets at least one use case
- Never put business logic in atoms or molecules — that belongs in providers
- Never create a page without a template — templates define layout, pages bind data
- Never use `setState` in organisms — use the project's state management
