# Bootstrap 5 Component Catalog (Vite)

Reference for gap analysis on Vite projects that use Bootstrap 5 (with or without jQuery). Typical stack fit: Laravel / Django / Rails / plain HTML + Vite for asset bundling — the Seacrets.Online pattern.

Use Context7 MCP for current docs:
```
resolve-library-id: "bootstrap"
query-docs: "Bootstrap 5 components and utilities"
```

## Component Catalog

| Component | Bootstrap Class / Element | Atomic Level | Notes |
|-----------|--------------------------|-------------|-------|
| Alert | `.alert` + variants | Molecule | Dismissible variant needs the JS bundle |
| Accordion | `.accordion` | Organism | Uses Collapse plugin |
| Badge | `.badge` | Atom | Can be a `span` inside any element |
| Breadcrumb | `.breadcrumb` + `<ol>` | Molecule | |
| Button | `.btn` + variants | Atom | Solid, outline, size, state variants |
| Button Group | `.btn-group` | Molecule | Toolbar = multiple groups |
| Card | `.card` | Molecule | Header / body / footer subcomponents |
| Carousel | `.carousel` | Organism | Requires JS plugin + data attributes |
| Close Button | `.btn-close` | Atom | Used by Alert / Modal / Offcanvas |
| Collapse | `.collapse` | Atom | Behavior primitive used by Accordion, Navbar |
| Dropdown | `.dropdown` | Molecule | Requires Popper |
| List Group | `.list-group` | Molecule | Flush, horizontal, numbered variants |
| Modal | `.modal` | Organism | Uses focus trap + scroll lock |
| Navbar | `.navbar` | Organism | Responsive breakpoints baked in |
| Nav / Tabs / Pills | `.nav` + `.nav-tabs` / `.nav-pills` | Molecule | Tab switching requires the JS plugin |
| Offcanvas | `.offcanvas` | Organism | New in Bootstrap 5 — sidebar / drawer |
| Pagination | `.pagination` | Molecule | |
| Placeholder | `.placeholder` | Atom | Skeleton primitive |
| Popover | `.popover` | Molecule | Content-rich hover / click tooltip |
| Progress | `.progress` + `.progress-bar` | Atom | Determinate and animated variants |
| Scrollspy | `data-bs-spy="scroll"` | Organism | Behavior plugin, not a component |
| Spinner | `.spinner-border` / `.spinner-grow` | Atom | |
| Toast | `.toast` | Molecule | Stacked via `.toast-container` |
| Tooltip | `[data-bs-toggle="tooltip"]` | Atom | Requires JS init + Popper |

## Form Controls

| Control | Class / Element | Atomic Level | Notes |
|---------|----------------|-------------|-------|
| Text input | `.form-control` | Atom | |
| Select | `.form-select` | Atom | Native select, styled |
| Checkbox / Radio | `.form-check` | Atom | Switch variant: `.form-switch` |
| Range | `.form-range` | Atom | |
| File | `.form-control` type="file" | Atom | Styled natively in v5 |
| Input group | `.input-group` | Molecule | Prepend / append addons |
| Floating label | `.form-floating` | Molecule | Label floats on focus / filled |
| Validation | `.is-valid` / `.is-invalid` | State modifier | Use with server-side validation feedback |

## Design Tokens

Bootstrap 5 exposes tokens primarily through **Sass variables** and **CSS custom properties**. A Vite project typically imports Bootstrap's SCSS in a single entry and overrides variables before the `@import`.

| Token Category | Source | Example |
|---------------|--------|---------|
| Color | Sass `$primary`, `$secondary`, ... | `$primary: #0d6efd;` |
| Color (runtime) | CSS var `--bs-primary` | `var(--bs-primary)` |
| Typography | Sass `$font-family-base`, `$font-size-base` | |
| Spacing | Sass `$spacer`, utility classes `p-*` / `m-*` | `0.25rem * spacer-multiplier` |
| Breakpoints | Sass `$grid-breakpoints` | xs / sm / md / lg / xl / xxl |
| Shadows | Sass `$box-shadow`, CSS var `--bs-box-shadow` | sm / default / lg variants |
| Border radius | Sass `$border-radius`, CSS var `--bs-border-radius` | sm / default / lg / pill |

## Audit Hotspots Specific to Bootstrap 5

When auditing a Bootstrap 5 Vite project, watch for these patterns beyond the generic `vite-audit-checklist.md`:

- **Coexisting majors** — `bootstrap@4` alongside `bootstrap@5` is the single biggest source of visual inconsistency. Check with `npm ls bootstrap --all`.
- **jQuery dependency** — Bootstrap 5 dropped the jQuery requirement. If the project still bundles jQuery for Bootstrap JS, that dependency is obsolete (but may still be needed for legacy plugins; verify before removing).
- **data-attribute namespace** — v5 uses `data-bs-*` (was `data-*` in v4). Mixed usage indicates half-migrated markup.
- **Icons** — Bootstrap Icons is a separate package (`bootstrap-icons`) — confirm it is npm-managed, not vendored.
- **Popper** — v5 depends on `@popperjs/core`. It must be resolved exactly once; duplicates cause dropdowns / tooltips to misbehave.

## Migration Hints

Projects modernizing a legacy Bootstrap setup (like the Seacrets pattern) usually follow this order:

1. Move jQuery / Popper / Bootstrap from vendored files or CDN to npm.
2. Import via a single Vite entry (`import 'bootstrap';` or per-plugin imports for tree-shaking).
3. Replace v4 `data-toggle="modal"` with v5 `data-bs-toggle="modal"` across all templates.
4. Drop v4 from `package.json`; run `npm dedupe`.
5. Regenerate the Bootstrap CSS through Vite's SCSS pipeline — never serve `bootstrap.min.css` from `public/` alongside the Vite build.
