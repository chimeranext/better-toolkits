# Material 3 Component Catalog (Flutter)

Reference for gap analysis. Use Context7 MCP for current docs:
```
resolve-library-id: "flutter material"
query-docs: "Material 3 components available in Flutter"
```

## Component Catalog

| Component | Flutter Class | Atomic Level | Notes |
|-----------|--------------|-------------|-------|
| Badge | Badge | Atom | New in M3 |
| Bottom App Bar | BottomAppBar | Organism | |
| Bottom Sheet | BottomSheet / showModalBottomSheet | Organism | |
| Card | Card | Molecule | Elevated, Filled, Outlined variants |
| Checkbox | Checkbox | Atom | |
| Chip | Chip / FilterChip / InputChip / ActionChip | Atom | |
| Date Picker | showDatePicker / DatePickerDialog | Organism | |
| Dialog | AlertDialog / SimpleDialog | Organism | |
| Divider | Divider | Atom | |
| Drawer | Drawer / NavigationDrawer | Organism | M3 uses NavigationDrawer |
| FAB | FloatingActionButton | Atom | Standard, Small, Large, Extended |
| Icon Button | IconButton | Atom | Filled, FilledTonal, Outlined variants |
| List Tile | ListTile | Molecule | |
| Menu | MenuAnchor / DropdownMenu | Molecule | |
| Navigation Bar | NavigationBar | Organism | Replaces BottomNavigationBar |
| Navigation Rail | NavigationRail | Organism | |
| Progress Indicator | CircularProgressIndicator / LinearProgressIndicator | Atom | |
| Radio | Radio | Atom | |
| Search Bar | SearchBar / SearchAnchor | Molecule | New in M3 |
| Segmented Button | SegmentedButton | Molecule | Replaces ToggleButtons |
| Slider | Slider / RangeSlider | Atom | |
| Snackbar | SnackBar | Molecule | |
| Switch | Switch | Atom | |
| Tabs | TabBar / Tab | Molecule | Primary and Secondary tabs |
| Text Field | TextField | Atom | Filled and Outlined variants |
| Time Picker | showTimePicker | Organism | |
| Tooltip | Tooltip | Atom | |

## Design Tokens

| Token Category | Flutter API |
|---------------|-------------|
| Color | `Theme.of(context).colorScheme` |
| Typography | `Theme.of(context).textTheme` |
| Shape | `Theme.of(context).shape` (M3) |
| Elevation | Material elevation system (0-5) |
| Motion | `Curves.*` + `Duration` |
