# MUI (Material UI) Component Catalog (Vite + React)

Reference for gap analysis on Vite + React projects that use MUI — Google's Material Design implementation for React. Covers MUI Core (free) and briefly flags MUI X (paid) components.

Use Context7 MCP for current docs:
```
resolve-library-id: "@mui/material"
query-docs: "MUI Core components and theming"
```

## Component Catalog — MUI Core

| Component | Import | Atomic Level | Notes |
|-----------|--------|-------------|-------|
| Alert | `@mui/material/Alert` | Molecule | Severity variants |
| Accordion | `@mui/material/Accordion` | Organism | Summary + Details subcomponents |
| Autocomplete | `@mui/material/Autocomplete` | Molecule | Free-solo + multiple variants |
| Avatar | `@mui/material/Avatar` | Atom | AvatarGroup = molecule |
| Backdrop | `@mui/material/Backdrop` | Atom | Overlay primitive |
| Badge | `@mui/material/Badge` | Atom | Dot or content variants |
| Breadcrumbs | `@mui/material/Breadcrumbs` | Molecule | |
| Button | `@mui/material/Button` | Atom | Contained / outlined / text variants |
| ButtonGroup | `@mui/material/ButtonGroup` | Molecule | |
| Card | `@mui/material/Card` | Molecule | CardHeader / CardMedia / CardContent / CardActions |
| Checkbox | `@mui/material/Checkbox` | Atom | |
| Chip | `@mui/material/Chip` | Atom | Filled / outlined, deletable variant |
| CircularProgress | `@mui/material/CircularProgress` | Atom | Determinate / indeterminate |
| Collapse | `@mui/material/Collapse` | Atom | Transition primitive |
| Container | `@mui/material/Container` | Atom | Responsive centered wrapper |
| CssBaseline | `@mui/material/CssBaseline` | n/a | Normalize stylesheet (root-level only) |
| Dialog | `@mui/material/Dialog` | Organism | DialogTitle / Content / Actions |
| Divider | `@mui/material/Divider` | Atom | |
| Drawer | `@mui/material/Drawer` | Organism | Temporary / persistent / permanent |
| Fab | `@mui/material/Fab` | Atom | Floating action button |
| FormControl | `@mui/material/FormControl` | Molecule | Field wrapper with label + helper + error |
| Grid | `@mui/material/Grid` | Atom | Layout primitive (Grid2 in v6+) |
| IconButton | `@mui/material/IconButton` | Atom | |
| ImageList | `@mui/material/ImageList` | Organism | Gallery layout |
| LinearProgress | `@mui/material/LinearProgress` | Atom | |
| Link | `@mui/material/Link` | Atom | Works with react-router |
| List | `@mui/material/List` | Molecule | ListItem + ListItemButton + ListItemText |
| Menu | `@mui/material/Menu` | Molecule | MenuItem |
| Modal | `@mui/material/Modal` | Organism | Lower-level primitive (Dialog wraps it) |
| Pagination | `@mui/material/Pagination` | Molecule | |
| Paper | `@mui/material/Paper` | Atom | Elevation surface primitive |
| Popover | `@mui/material/Popover` | Molecule | |
| Popper | `@mui/material/Popper` | Atom | Positioning primitive |
| Radio | `@mui/material/Radio` | Atom | |
| Rating | `@mui/material/Rating` | Molecule | |
| Select | `@mui/material/Select` | Atom | Use MenuItem children |
| Skeleton | `@mui/material/Skeleton` | Atom | |
| Slider | `@mui/material/Slider` | Atom | |
| Snackbar | `@mui/material/Snackbar` | Organism | Paired with Alert for content |
| SpeedDial | `@mui/material/SpeedDial` | Organism | FAB with menu |
| Stack | `@mui/material/Stack` | Atom | Flex layout primitive |
| Stepper | `@mui/material/Stepper` | Organism | Step / StepLabel / StepContent |
| Switch | `@mui/material/Switch` | Atom | |
| Table | `@mui/material/Table` | Molecule | Basic table primitives (MUI X for features) |
| Tabs | `@mui/material/Tabs` | Molecule | Tab + TabPanel |
| TextField | `@mui/material/TextField` | Atom | Outlined / filled / standard variants |
| ToggleButton | `@mui/material/ToggleButton` | Atom | |
| Tooltip | `@mui/material/Tooltip` | Atom | |
| Typography | `@mui/material/Typography` | Atom | All heading + body variants |

### MUI X (Paid / Licensed)

Flag these only if the project uses MUI X — they are not part of the free tier:

| Component | Package | Notes |
|-----------|---------|-------|
| DataGrid | `@mui/x-data-grid` | Free tier available; Pro / Premium paid |
| DatePicker / TimePicker | `@mui/x-date-pickers` | |
| TreeView | `@mui/x-tree-view` | |
| Charts | `@mui/x-charts` | |

## Design Tokens

MUI exposes tokens through the `ThemeProvider` + `createTheme`. Tokens are accessible at runtime via the `useTheme()` hook or the `sx` prop.

| Token Category | Source | Example |
|---------------|--------|---------|
| Color | `theme.palette.primary.main`, `theme.palette.grey[500]` | `sx={{ color: 'primary.main' }}` |
| Typography | `theme.typography.h1`, `theme.typography.body1` | `<Typography variant="h1">` |
| Spacing | `theme.spacing(n)` = `n * 8px` default | `sx={{ p: 2 }}` → 16px padding |
| Breakpoints | `theme.breakpoints.up('md')` | `sx={{ display: { xs: 'none', md: 'block' } }}` |
| Shadows | `theme.shadows[0..24]` | 25-tier elevation |
| Shape | `theme.shape.borderRadius` | Default 4px |
| Transitions | `theme.transitions.easing.easeInOut` | Motion tokens |

## Audit Hotspots Specific to MUI

- **Multiple theme providers** — a deeply nested `ThemeProvider` can override higher-level tokens unexpectedly. Grep for `ThemeProvider` usages; there should typically be one top-level plus at most one dark-mode toggle.
- **Mixed `sx` + `styled` + `makeStyles`** — MUI v4's `makeStyles` is deprecated in v5; its presence alongside `sx` means the project is mid-migration. Flag for consolidation.
- **MUI v4 + v5 coexistence** — signal #3 of the bundle-health checklist (mixed majors). `@material-ui/core` (v4) and `@mui/material` (v5) are separate packages that can coexist; eliminate the v4 one.
- **Emotion vs styled-components** — MUI v5 defaults to `@emotion/*`; some projects still drag `styled-components` along. One style engine only.
- **Rolled-your-own theme instead of palette** — if components reach for literal hex values inside `sx` instead of `theme.palette.*`, you have a design-system leak.
- **Icon package bloat** — `@mui/icons-material` re-exports thousands of icons. Confirm the project does named imports (`import { Menu } from '@mui/icons-material/Menu'`), not default / star imports, so tree-shaking works.

## Migration Hints

Projects adopting or modernizing MUI usually follow:

1. Install `@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/icons-material`.
2. Wrap the app in `ThemeProvider` + `CssBaseline`.
3. Centralize `createTheme` in `src/theme/index.ts`; extend palette / typography there.
4. Replace ad-hoc colors in components with `theme.palette.*` references via the `sx` prop.
5. If migrating from v4: follow the official v4 → v5 codemod (`npx @mui/codemod v5.0.0/preset-safe .`), then remove `@material-ui/*` packages entirely.
