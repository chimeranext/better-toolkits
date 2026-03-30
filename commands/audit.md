---
description: "Scan Flutter codebase for decomposable widgets and run design system gap analysis"
argument-hint: "[:design-system]  e.g. :material3, :carbon, :audit:material3"
---

# /audit — Widget Audit + Design System Gap Analysis

You are an expert Flutter UI architect scanning codebases for missing, monolithic, or misplaced widgets. Optionally cross-references against 14+ design systems.

## Usage

```bash
# Pure audit — scan for decomposable widgets
/atomic-design-toolkit:audit

# Design system gap analysis
/atomic-design-toolkit:audit :material3
/atomic-design-toolkit:audit :cupertino
/atomic-design-toolkit:audit :carbon
/atomic-design-toolkit:audit :shadcn

# Combined: audit + design system lens
/atomic-design-toolkit:audit :audit:material3
/atomic-design-toolkit:audit :audit:carbon
```

## Mode Detection

Parse `$ARGUMENTS`:

| Argument | Mode |
|----------|------|
| (empty) or `:audit` | Full codebase widget scan |
| `:material3` | Material 3 gap analysis |
| `:cupertino` | Apple HIG / Cupertino gap analysis |
| `:fluent2` | Microsoft Fluent 2 gap analysis |
| `:carbon` | IBM Carbon gap analysis |
| `:headless-ui` | Tailwind Headless UI (accessibility patterns) |
| `:atlassian` | Atlassian Design System |
| `:cloudscape` | AWS Cloudscape |
| `:primer` | GitHub Primer |
| `:polaris` | Shopify Polaris |
| `:spectrum` | Adobe Spectrum |
| `:lightning` | Salesforce Lightning |
| `:ant` | Ant Design |
| `:chakra` | Chakra UI |
| `:radix` | Radix UI (headless primitives) |
| `:shadcn` | shadcn/ui |
| `:audit:{system}` | Combined audit + gap analysis |

## Audit Mode — Full Codebase Widget Scan

### Step A1: Inventory Existing Widgets

Scan all widget files in the project:

```bash
# Find all widgets
find . -name "*.dart" -type f | xargs grep -l "extends StatelessWidget\|extends StatefulWidget\|extends ConsumerWidget\|extends HookWidget" 2>/dev/null
```

Classify by atomic level based on directory structure and widget complexity.

### Step A2: Classify Existing Widgets

| Classification | Criteria | Action |
|---------------|----------|--------|
| **Well-decomposed** | Correct granularity for its level | Skip |
| **Monolithic** | >150 lines, mixing layout + logic + state | Flag for decomposition |
| **Misplaced** | In atoms/ but has state management | Flag for reclassification |
| **Duplicated** | Similar widgets across features | Flag for extraction to core/ |
| **Inline** | Widget built inline without its own file | Flag for extraction |

### Step A3: Identify Missing Components

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

### Step A4: Generate Audit Report

```markdown
## Widget Audit Report

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

## Design System Gap Analysis

Use Context7 MCP to query current docs for the selected design system.

Read `${CLAUDE_PLUGIN_ROOT}/references/design-systems/` for pre-compiled component catalogs.

### Process

1. **Resolve library**: Use Context7 `resolve-library-id` for the design system
2. **Query components**: Get the full component catalog
3. **Cross-reference**: Compare against the project's existing widgets
4. **Classify gaps**: For each missing component, propose atom/molecule/organism classification
5. **Generate**: Create the missing widgets using the design system's patterns adapted to Flutter

### Design System Reference Table

| System | Key Unique Components |
|--------|----------------------|
| Material 3 | Badge, BottomSheet, Chip, NavigationRail, SearchBar |
| Cupertino | ActionSheet, ContextMenu, DatePicker, SegmentedControl |
| Carbon | StructuredList, ContentSwitcher, InlineNotification |
| Headless UI | Focus trap, keyboard nav, ARIA patterns |
| Atlassian | InlineEdit, DynamicTable, Flag notifications |
| Cloudscape | AppLayout, SplitPanel, Wizard |
| Primer | Timeline, StateLabel, Blankslate |
| Polaris | AccountConnection, CalloutCard, IndexTable |
| Spectrum | CoachMark, IllustratedMessage, StatusLight |

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
