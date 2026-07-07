# IBM Carbon Design System — Component Reference

Reference for gap analysis. Use Context7 MCP:
```
resolve-library-id: "carbon design system"
query-docs: "list all Carbon components"
```

Source: https://carbondesignsystem.com/components/overview

## Key Unique Components (not in Material 3)

These are Carbon components worth adopting in Flutter projects:

| Component | Purpose | Flutter Equivalent | Atomic Level |
|-----------|---------|-------------------|-------------|
| StructuredList | Tabular data without full DataTable overhead | Custom | Molecule |
| ContentSwitcher | Toggle between content views (not tabs) | Custom | Molecule |
| InlineNotification | Contextual, inline status messages | Custom (not SnackBar) | Molecule |
| TreeView | Hierarchical navigation/data display | Custom | Organism |
| Pagination | Table pagination with page size selector | Custom | Molecule |
| DataTable | Full-featured sortable, filterable table | DataTable (limited) | Organism |
| Accordion | Expandable content sections | ExpansionTile (basic) | Molecule |
| NumberInput | Numeric input with increment/decrement | Custom | Atom |
| DatePicker | Range and single date selection | showDateRangePicker | Organism |
| FileUploader | Drag-and-drop file upload with progress | Custom | Organism |
| ProgressIndicator | Step-based progress (not just linear) | Stepper (basic) | Molecule |

## Design Tokens

Carbon uses a different token system than Material:
- **Gray scales**: Gray 10-100 (not elevation-based)
- **Spacing**: Based on 2rem grid (not 4dp/8dp)
- **Typography**: IBM Plex family
- **Motion**: Productive (fast, functional) vs Expressive (slower, dramatic)
