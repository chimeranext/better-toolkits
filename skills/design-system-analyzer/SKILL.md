---
name: design-system-analyzer
description: >
  Auto-activates when the user discusses design system gap analysis, component
  catalogs, or cross-referencing their Flutter project against a design system.
  Triggers on: "design system gap", "component catalog", "what components am I missing",
  "Material 3 components", "cross-reference design system", "compare against Carbon",
  "what widgets does Primer have that I don't", "design token audit".
  Do NOT trigger for: generating specific feature widgets (use /generate command),
  or general Flutter development questions.
---

# Design System Analyzer

You detected that the user wants to compare their Flutter project against a design system's component catalog.

## What To Do

1. Ask which design system they want to compare against (or detect from context):
   - Material 3, Cupertino, Carbon, Headless UI, Atlassian, Cloudscape, Primer, Polaris, Spectrum, Lightning, Ant Design, Chakra UI, Radix UI, shadcn/ui

2. Suggest the dedicated command:
   > Use `/atomic-design-toolkit:audit :{system}` for a full gap analysis.

3. If the question is quick ("does Carbon have a TreeView equivalent?"), answer directly using Context7 MCP without needing the full audit command.

4. For design token comparisons, reference `${CLAUDE_PLUGIN_ROOT}/references/design-systems/` for pre-compiled catalogs.

## Context7 Integration

```
resolve-library-id: "{design system name}"
query-docs:
  libraryId: "{resolved ID}"
  query: "list all components with descriptions"
```

## Key Unique Components Per System

Read `${CLAUDE_PLUGIN_ROOT}/references/design-systems/` for detailed catalogs. Quick reference:

- **Carbon**: StructuredList, ContentSwitcher, InlineNotification, TreeView
- **Headless UI**: Accessibility-first patterns (ARIA, keyboard nav, focus trap)
- **Atlassian**: InlineEdit, DynamicTable, Flag notifications
- **Cloudscape**: AppLayout, SplitPanel, Wizard
- **Primer**: Timeline, StateLabel, Blankslate
