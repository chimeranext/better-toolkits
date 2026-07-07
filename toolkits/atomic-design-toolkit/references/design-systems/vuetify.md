# Vuetify Component Catalog (Vite + Vue)

Reference for gap analysis on Vite + Vue projects that use Vuetify — Material Design for Vue. Covers Vuetify 3 (Vue 3) primarily; flags Vuetify 2 differences where relevant.

Use Context7 MCP for current docs:
```
resolve-library-id: "vuetify"
query-docs: "Vuetify 3 components and theme configuration"
```

## Component Catalog — Vuetify 3

| Component | Element | Atomic Level | Notes |
|-----------|---------|-------------|-------|
| v-alert | `<v-alert>` | Molecule | type / variant / density props |
| v-app | `<v-app>` | n/a | Root layout wrapper (required) |
| v-app-bar | `<v-app-bar>` | Organism | Top app shell |
| v-autocomplete | `<v-autocomplete>` | Molecule | Searchable select |
| v-avatar | `<v-avatar>` | Atom | |
| v-badge | `<v-badge>` | Atom | |
| v-banner | `<v-banner>` | Molecule | |
| v-bottom-navigation | `<v-bottom-navigation>` | Organism | Mobile nav primitive |
| v-bottom-sheet | `<v-bottom-sheet>` | Organism | |
| v-breadcrumbs | `<v-breadcrumbs>` | Molecule | |
| v-btn | `<v-btn>` | Atom | Elevated / flat / tonal / outlined / text / plain variants |
| v-card | `<v-card>` | Molecule | v-card-title / v-card-text / v-card-actions |
| v-carousel | `<v-carousel>` | Organism | |
| v-checkbox | `<v-checkbox>` | Atom | |
| v-chip | `<v-chip>` | Atom | v-chip-group for sets |
| v-color-picker | `<v-color-picker>` | Molecule | |
| v-combobox | `<v-combobox>` | Molecule | |
| v-data-table | `<v-data-table>` | Organism | Sortable / paginated / filterable |
| v-date-picker | `<v-date-picker>` | Molecule | |
| v-dialog | `<v-dialog>` | Organism | Modal primitive |
| v-divider | `<v-divider>` | Atom | |
| v-expansion-panels | `<v-expansion-panels>` | Organism | Accordion |
| v-file-input | `<v-file-input>` | Atom | |
| v-footer | `<v-footer>` | Organism | |
| v-form | `<v-form>` | Molecule | Validation wrapper |
| v-icon | `<v-icon>` | Atom | Works with MDI, FA, Material Icons |
| v-img | `<v-img>` | Atom | Responsive image with placeholder |
| v-list | `<v-list>` | Molecule | v-list-item + v-list-subheader |
| v-main | `<v-main>` | n/a | Layout slot for app content |
| v-menu | `<v-menu>` | Molecule | |
| v-navigation-drawer | `<v-navigation-drawer>` | Organism | |
| v-otp-input | `<v-otp-input>` | Molecule | |
| v-overlay | `<v-overlay>` | Atom | Scrim / backdrop primitive |
| v-pagination | `<v-pagination>` | Molecule | |
| v-progress-circular | `<v-progress-circular>` | Atom | |
| v-progress-linear | `<v-progress-linear>` | Atom | |
| v-radio-group | `<v-radio-group>` | Molecule | v-radio children |
| v-range-slider | `<v-range-slider>` | Atom | |
| v-rating | `<v-rating>` | Molecule | |
| v-select | `<v-select>` | Atom | |
| v-sheet | `<v-sheet>` | Atom | Surface primitive |
| v-skeleton-loader | `<v-skeleton-loader>` | Atom | |
| v-slide-group | `<v-slide-group>` | Molecule | Horizontally-scrollable children |
| v-slider | `<v-slider>` | Atom | |
| v-snackbar | `<v-snackbar>` | Organism | |
| v-speed-dial | `<v-speed-dial>` | Organism | |
| v-stepper | `<v-stepper>` | Organism | |
| v-switch | `<v-switch>` | Atom | |
| v-system-bar | `<v-system-bar>` | Organism | |
| v-table | `<v-table>` | Molecule | Static table (use v-data-table for data-driven) |
| v-tabs | `<v-tabs>` | Molecule | |
| v-text-field | `<v-text-field>` | Atom | |
| v-textarea | `<v-textarea>` | Atom | |
| v-time-picker | `<v-time-picker>` | Molecule | |
| v-timeline | `<v-timeline>` | Organism | |
| v-toolbar | `<v-toolbar>` | Organism | |
| v-tooltip | `<v-tooltip>` | Atom | |
| v-virtual-scroll | `<v-virtual-scroll>` | Organism | |

## Design Tokens

Vuetify uses a theme system configured at plugin registration (`createVuetify({ theme: {...} })`). Tokens are exposed via CSS variables (`--v-theme-primary`) and accessible inside components via `useTheme()`.

| Token Category | Source | Example |
|---------------|--------|---------|
| Color | `theme.colors.primary`, CSS var `--v-theme-primary` | `bg-primary` utility class |
| Variants | `elevation-{0..24}`, `rounded-{0..xl}` | Utility classes |
| Typography | `theme.defaults.VTypography` | |
| Spacing | `ma-{0..16}`, `pa-{0..16}` utility classes | Scale of 4px |
| Breakpoints | `theme.display.{name}` | xs / sm / md / lg / xl / xxl |
| Density | `density="default|comfortable|compact"` prop | |

## Audit Hotspots Specific to Vuetify

- **Vuetify 2 + 3 coexistence** — signal #3 of the bundle-health checklist. Vuetify 3 requires Vue 3; Vuetify 2 requires Vue 2. Coexistence means an incomplete Vue major migration — block it.
- **Missing `<v-app>` root** — many Vuetify layout primitives (`v-app-bar`, `v-navigation-drawer`, `v-main`, `v-footer`) require `<v-app>` as ancestor. Missing it produces silent layout breakage.
- **Custom CSS overriding token classes** — Vuetify components are themeable; overriding them with hand-rolled CSS indicates a missing token. Flag any `!important` inside component-level CSS.
- **MDI icon bloat** — `@mdi/font` ships the entire icon set as a font. For bundle-sensitive builds, switch to `@mdi/js` with treeshakable imports.
- **Mixed `sass` / `scss` / `pcss`** — Vuetify's customization path requires Sass; `postcss`-only projects must install Sass tooling. Inconsistency indicates half-migrated setup.

## Migration Hints

1. Install `vuetify@^3`, `sass` (dev), and the icon set of choice (`@mdi/font` or `@mdi/js`).
2. Create the Vuetify plugin in `src/plugins/vuetify.ts` — register theme, defaults, display breakpoints.
3. Wrap root in `<v-app>` inside `App.vue`.
4. Add the `vite-plugin-vuetify` plugin for tree-shaking component imports.
5. For v2 → v3 migrations: the official migration guide + `eslint-plugin-vuetify` catches the majority of prop / slot renames; manual work remains for the grid (new `v-row` / `v-col` semantics) and form validation (no longer emits `valid` event automatically).
