# atomic-design-toolkit

Flutter Atomic Design widget generator — decompose features into atoms, molecules, organisms, templates, and pages. Audit your codebase. Cross-reference against 14+ design systems.

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

## What's Inside

### Commands (2)

| Command | Description |
|---------|-------------|
| `/atomic-design-toolkit:generate <feature>` | Generate a complete widget hierarchy for a feature |
| `/atomic-design-toolkit:audit [:<system>]` | Scan codebase for decomposable widgets + design system gap analysis |

### Skills (2)

| Skill | Triggers when you... |
|-------|---------------------|
| `design-system-analyzer` | Discuss design system gaps, component catalogs, or cross-referencing |
| `widget-decomposition` | Work on a monolithic widget that needs splitting |

## Modes

### Generate Mode

```bash
/atomic-design-toolkit:generate rescue-alerts
/atomic-design-toolkit:generate adoption-listings
```

Produces a full Atomic Design decomposition:
1. Gathers feature requirements (OpenSpec, Linear, or interactive)
2. Loads the project's design system tokens
3. Proposes decomposition table (atoms, molecules, organisms, templates, pages)
4. Generates widget files + Widgetbook entries + state providers

### Audit Mode

```bash
/atomic-design-toolkit:audit                    # Pure codebase scan
/atomic-design-toolkit:audit :material3          # Material 3 gap analysis
/atomic-design-toolkit:audit :cupertino          # Apple HIG gap analysis
/atomic-design-toolkit:audit :carbon             # IBM Carbon gap analysis
/atomic-design-toolkit:audit :audit:material3    # Combined
```

**14+ supported design systems:**

| System | Key Unique Components |
|--------|----------------------|
| Material 3 | Badge, BottomSheet, Chip, NavigationRail, SearchBar |
| Cupertino | ActionSheet, ContextMenu, DatePicker, SegmentedControl |
| Fluent 2 | Persona, Toolbar, DataGrid, InfoBar, TeachingBubble |
| Carbon | StructuredList, ContentSwitcher, InlineNotification, TreeView |
| Headless UI | Accessibility-first patterns (ARIA, focus trap) |
| Atlassian | InlineEdit, DynamicTable, Flag notifications |
| Cloudscape | AppLayout, SplitPanel, Wizard |
| Primer | Timeline, StateLabel, Blankslate |
| Polaris | AccountConnection, CalloutCard, IndexTable |
| Spectrum | CoachMark, IllustratedMessage, StatusLight |
| Lightning | ActivityTimeline, DataTable, Path |
| Ant Design | Cascader, Transfer, TreeSelect |
| Chakra UI | Editable, PinInput, Show/Hide |
| Radix UI | HoverCard, NavigationMenu, ScrollArea |
| shadcn/ui | Command, DataTable, InputOTP, Sheet |

## Atomic Design Levels

| Level | Responsibility | State? | Location |
|-------|---------------|--------|----------|
| **Atom** | Single-purpose UI element | No | `core/widgets/atoms/` |
| **Molecule** | Atoms with local interaction | Minimal | `core/widgets/molecules/` |
| **Organism** | Molecules with data binding | Yes | `core/widgets/organisms/` |
| **Template** | Page layout with slots | No | `features/*/templates/` |
| **Page** | Template bound to route | Yes | `features/*/pages/` |

## Architecture

```
atomic-design-toolkit/
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
├── commands/
│   ├── generate.md          # Feature widget generation
│   └── audit.md             # Codebase audit + design system gaps
├── skills/
│   ├── design-system-analyzer/
│   │   └── SKILL.md         # Auto-activates on DS discussions
│   └── widget-decomposition/
│       └── SKILL.md         # Auto-activates on widget refactoring
├── references/
│   ├── atomic-methodology.md
│   └── design-systems/
│       ├── material3.md
│       ├── cupertino.md
│       └── carbon.md
└── README.md
```

## Requirements

- **Claude Code** — the CLI or IDE extension
- **Flutter project** — with a widget directory structure
- **Context7 MCP** — optional, for querying design system docs

## License

[Business Source License 1.1](./LICENSE) — you may use, modify, and redistribute for non-competitive purposes. Converts to Non-Profit OSL 3.0 after 5 years.
