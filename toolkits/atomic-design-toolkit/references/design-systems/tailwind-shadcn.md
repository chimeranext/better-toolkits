# Tailwind + shadcn/ui Component Catalog (Vite + React)

Reference for gap analysis on Vite + React projects that use Tailwind CSS with shadcn/ui primitives. shadcn/ui is not an npm package — components are copied into the repo via the CLI and owned by the project.

Use Context7 MCP for current docs:
```
resolve-library-id: "shadcn/ui"
query-docs: "shadcn/ui components and Tailwind configuration"
```

## Component Catalog

| Component | shadcn/ui CLI name | Atomic Level | Underlying primitive |
|-----------|-------------------|-------------|----------------------|
| Accordion | `accordion` | Organism | Radix Accordion |
| Alert | `alert` | Molecule | — |
| Alert Dialog | `alert-dialog` | Organism | Radix AlertDialog |
| Aspect Ratio | `aspect-ratio` | Atom | Radix AspectRatio |
| Avatar | `avatar` | Atom | Radix Avatar |
| Badge | `badge` | Atom | — |
| Breadcrumb | `breadcrumb` | Molecule | — |
| Button | `button` | Atom | variant + size via cva |
| Calendar | `calendar` | Molecule | react-day-picker |
| Card | `card` | Molecule | — |
| Carousel | `carousel` | Organism | embla-carousel-react |
| Chart | `chart` | Organism | recharts wrapper |
| Checkbox | `checkbox` | Atom | Radix Checkbox |
| Collapsible | `collapsible` | Atom | Radix Collapsible |
| Combobox | `combobox` | Molecule | Command + Popover composition |
| Command | `command` | Organism | cmdk — command palette |
| Context Menu | `context-menu` | Molecule | Radix ContextMenu |
| Data Table | `data-table` | Organism | tanstack/react-table |
| Date Picker | `date-picker` | Molecule | Calendar + Popover |
| Dialog | `dialog` | Organism | Radix Dialog |
| Drawer | `drawer` | Organism | vaul |
| Dropdown Menu | `dropdown-menu` | Molecule | Radix DropdownMenu |
| Form | `form` | Organism | react-hook-form + zod |
| Hover Card | `hover-card` | Molecule | Radix HoverCard |
| Input | `input` | Atom | — |
| Input OTP | `input-otp` | Molecule | input-otp |
| Label | `label` | Atom | Radix Label |
| Menubar | `menubar` | Organism | Radix Menubar |
| Navigation Menu | `navigation-menu` | Organism | Radix NavigationMenu |
| Pagination | `pagination` | Molecule | — |
| Popover | `popover` | Molecule | Radix Popover |
| Progress | `progress` | Atom | Radix Progress |
| Radio Group | `radio-group` | Molecule | Radix RadioGroup |
| Resizable | `resizable` | Organism | react-resizable-panels |
| Scroll Area | `scroll-area` | Atom | Radix ScrollArea |
| Select | `select` | Atom | Radix Select |
| Separator | `separator` | Atom | Radix Separator |
| Sheet | `sheet` | Organism | Radix Dialog + side variants |
| Sidebar | `sidebar` | Organism | collapsible app-shell primitive |
| Skeleton | `skeleton` | Atom | — |
| Slider | `slider` | Atom | Radix Slider |
| Sonner | `sonner` | Organism | sonner (toasts) |
| Switch | `switch` | Atom | Radix Switch |
| Table | `table` | Molecule | — |
| Tabs | `tabs` | Molecule | Radix Tabs |
| Textarea | `textarea` | Atom | — |
| Toast | `toast` | Organism | Deprecated — Sonner preferred |
| Toggle | `toggle` | Atom | Radix Toggle |
| Toggle Group | `toggle-group` | Molecule | Radix ToggleGroup |
| Tooltip | `tooltip` | Atom | Radix Tooltip |

## Design Tokens

Tailwind + shadcn ship tokens through two layered mechanisms:

| Layer | Source | Example |
|-------|--------|---------|
| Tailwind theme | `tailwind.config.{js,ts}` `theme.extend` | `colors.primary`, `fontFamily.sans` |
| CSS variables | `src/index.css` (or `app/globals.css`) under `:root` / `.dark` | `--background`, `--foreground`, `--primary`, `--radius` |
| Class utilities | Tailwind classes referencing tokens | `bg-background text-foreground` |

shadcn/ui components read CSS variables so theming (light / dark / brand) can swap at runtime without a rebuild.

### Standard Tokens Used by shadcn

- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`
- `--radius`
- Chart / sidebar / brand extensions as needed

## Audit Hotspots Specific to Tailwind + shadcn

When auditing a Tailwind + shadcn Vite project, watch for these beyond the generic `vite-audit-checklist.md`:

- **Unmanaged primitive duplication** — shadcn components live in the repo (`src/components/ui/`), so a team can inadvertently fork the same primitive into multiple files. Grep for duplicate component names before flagging them as missing.
- **Radix version drift** — shadcn depends on individual `@radix-ui/*` packages. Multiple majors of a single Radix primitive (e.g. `@radix-ui/react-dialog@1` and `@2`) cause subtle behavior differences. Audit with `npm ls` for each Radix package in use.
- **Tailwind class purge** — confirm `content` globs in `tailwind.config` cover every location that uses classes (including MDX, content files, and library paths when building a shared design system).
- **`cn()` helper consistency** — shadcn relies on a `cn()` utility (usually `clsx` + `tailwind-merge`). Verify every component uses the same helper; mixed utilities break class precedence.
- **Dark mode strategy** — `darkMode: 'class'` vs `'media'` must match whatever toggles the `.dark` class at runtime. Mismatched config produces a site that ignores the user's preference or the explicit toggle.
- **Ad-hoc colors** — Tailwind arbitrary values like `bg-[#ff0000]` sprinkled through components are a design-system leak. Flag them in the audit and suggest extracting to `theme.extend.colors`.

## Migration Hints

Projects adopting shadcn on top of an existing Vite + React codebase usually follow this order:

1. Install Tailwind; configure `content` globs to cover every source location.
2. Run `npx shadcn@latest init` to scaffold `components.json`, the `cn()` utility, and the base CSS variables.
3. Add primitives one at a time (`npx shadcn@latest add button`, `...add dialog`) so each merge stays reviewable.
4. Replace the legacy component with the shadcn variant behind a feature flag if the UI is user-visible; remove the old component once parity is confirmed.
5. Extend `tailwind.config` tokens to match the brand — never hardcode colors inside components.
