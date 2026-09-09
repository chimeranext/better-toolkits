# Code organization standards (DSMS, IFS, CPS)

Protocol SSOT for the **clean code** trio. Portable baseline for any client repo —
generalized from industry practice (Clean Code ch.5, PSR-12, `@typescript-eslint/member-ordering`).

| Acronym | Full name | Scope |
| --- | --- | --- |
| **DSMS** | Domain-Sliced Module Structure | Where files live (folders / modules) |
| **IFS** | Intra-File Structure | How one file reads top-to-bottom |
| **CPS** | Categorized Public Surface | How public barrels / entrypoints export |

```text
DSMS  (where the module/file lives)     ← base
  ├─ IFS  (how it reads inside)        ← orthogonal; applies to every file
  └─ CPS  (how it publishes outward)   ← depends on DSMS
```

**Adopt order:** document and review DSMS → IFS → CPS. **Day-to-day priority:** IFS (same reading rhythm in every source file).

## Adoption policy

- **Incremental only** — apply when you add or materially edit code in that concern. Do **not** mass-refactor legacy trees for compliance.
- **Satellite repos** — client `AGENTS.md` carries **pointers** to these docs; do not duplicate full practice text in apps/packages.
- **Not a refactor license** — adopting these standards does **not** authorize folder moves, barrel rewrites, or banner refactors outside the current ticket scope.

---

## 1. DSMS — Domain-Sliced Module Structure

Organize folders and modules by **domain/capability first**, then by technical layer — not the reverse.

### When it applies

- Component libraries (`src/components/{feature}/{atoms|molecules|organisms|templates}/`)
- App domains (Laravel: `app/Domain/{Feature}/…`; Node: `apps/{context}/` or `src/features/{feature}/`)
- Feature modules and bounded contexts
- Mobile: `lib/features/{feature}/{presentation|domain|data}/`

**Does not apply to:** pure technical libraries with no domain slices; one-off scripts; forced retrofit of legacy trees without a migration plan.

### Rules

1. **Feature-first path:** After `src/` / `app/` / `lib/`, the next segment MUST be a domain/feature id (`checkout`, `messaging`, `shared`, …), not a bare technical layer (`atoms/`, `services/` at the root).
2. **Technical layer nesting:** Atomic layers or domain folders nest **under** the feature.
3. **Keep feature roots flat** unless domain complexity truly needs nesting.
4. **Shared kit:** Cross-feature primitives live under reserved `shared/` or `core/`, not scattered.
5. **UI repos:** Atomic Design layers are the technical layer under each feature.
6. **Feature types:** Cross-layer shapes MAY live in `{feature}/types.ts` (or `{feature}/types/`).
7. **No parallel trees:** Do not maintain both flat `src/atoms/` and `src/components/{feature}/atoms/`.

### Anti-patterns

- Layer-first (`src/atoms/Button.tsx` with no feature)
- Deep unnecessary nesting (`agency/crm/dashboard/widgets/…`)
- Mixed legacy flat + domain-sliced paths in the same PR without a cutover plan

### Audit checks

- [ ] New modules follow `{feature}/{layer}/`
- [ ] No new top-level technical-only folders
- [ ] Shared primitives under `shared/` or `core/`
- [ ] Feature types not duplicated per layer without reason

---

## 2. IFS — Intra-File Structure

Canonical ordering and section labeling **inside a single source file**, so every file is readable the same way.

IFS is **branding for established practice** — not a greenfield invention:

- Clean Code ch.5 — newspaper metaphor / vertical ordering
- “TL;DR at top” layout (public API first, helpers below)
- `@typescript-eslint/member-ordering`, PHP-CS-Fixer `ordered_class_elements`
- PSR-12 file header order (`declare` → `namespace` → `use`)

Client adds: **mandatory section banners** stating **what** + **why**, shared across TS, Dart, and PHP.

### When it applies

- React/TS components and modules
- Dart/Flutter widgets and services
- PHP classes / domain services
- Test files beyond trivial single cases
- Barrel files **with** local logic (pure re-export barrels → prefer CPS only)

**Does not apply to:** config JSON/YAML; generated stubs; tiny single-export files where banners add noise.

### Canonical section order

**React / TypeScript**

1. Imports (React → third-party → project)
2. Types & interfaces (props first, then internal)
3. Constants & config
4. Main component / public API
5. Helpers (same abstraction band; lower detail further down)
6. Exports (default last when used)

**Dart / Flutter**

1. Imports (`dart:` → `package:` → relative)
2. Types & interfaces
3. Constants & config
4. Main widget / public API
5. Private helpers
6. Exports (if any local barrel logic)

**PHP class / service**

1. Namespace + `use` (framework → vendor → project)
2. Class docblock
3. Constants
4. Properties (`public` → `protected` → `private`)
5. Constructor
6. Public methods (domain first)
7. Protected methods
8. Private helpers

**Tests**

1. Imports (framework → SUT → fixtures)
2. Setup / teardown
3. Cases grouped by scenario (not alphabetical dump)

### Comment block conventions

Every **major** section banner must state **what** the section contains and **why** it exists.

**TypeScript / React / Dart**

```typescript
// ---------------------------------------------------------------------------
// Types — component props and internal state shape
// ---------------------------------------------------------------------------
```

- Major sections: `// ---` banners (~79 chars)
- Inline `//` for local *why* (edge cases) — never “increment counter”
- Prefer not to use block comments inside TS/Dart that fight formatters

**PHP**

```php
/**
 * @section Public Methods — order fulfillment workflow
 */
```

| Style | Use when |
| --- | --- |
| `// ---` banner (TS/Dart) | Major section boundary |
| `@section` (PHP) | Method/property group boundary |
| Single-line `//` | Local non-obvious *why* |
| PHPDoc / `///` | Public API documentation |

### Anti-patterns

1. **Long file** (>~500 lines) without extraction to DSMS siblings
2. **Mixed abstraction levels** interleaved
3. **Mystery guest** — unlabeled 5+ line blocks
4. **Stale / obvious comments**
5. **Export chaos** — exports scattered mid-file

### Audit checks

- [ ] Canonical order for file kind (TS / Dart / PHP / test)
- [ ] Major sections have banners with **what** + **why**
- [ ] No mystery unlabeled blocks
- [ ] Imports grouped
- [ ] Abstraction levels grouped (high → low down the file)
- [ ] Comments explain *why*, not *what*

---

## 3. CPS — Categorized Public Surface

Public barrels and package entrypoints group exports by **domain slice**, then by **kind** (runtime → type-only → deprecated), with section banners stating what and why.

### When it applies

- Package entrypoints (`src/index.ts`, `lib/{package}.dart`)
- Facades / barrels with many re-exports

**Does not apply to:** internal modules with no public barrel; tiny packages with a handful of exports.

### Rules

1. Group by **DSMS feature** first (`checkout`, `messaging`, `shared`, …).
2. Within a feature: **runtime values** → **`export type`** → **deprecated**.
3. **Section banners required** (what + why).
4. No unlabeled dump zones in large barrels.
5. UI repos: keep top-level Atomic markers (`// Atoms`, …) and nest feature banners underneath when blocks grow.
6. Always `export type { … }` for type-only symbols (TS).
7. Do not invent unused public exports.

### Anti-patterns

- Interleaved `export` / `export type` pairs with no kind grouping
- Feature spaghetti in one unlabeled list
- Bare `export` of types
- Speculative unused exports

### Audit checks

- [ ] New exports under the correct feature section
- [ ] Runtime before type-only
- [ ] Banner for new feature / large sub-group
- [ ] `export type` for types (TS)
- [ ] Consumer exists (or lands in the same PR)

---

## Quick reference

| Question | Practice |
| --- | --- |
| Does this belong in `{feature}/` or `shared/`? | DSMS |
| Is this an organism or a molecule? | DSMS |
| Imports → types → main → helpers? | IFS |
| Banner `// ---` / `@section`? | IFS (file) / CPS (barrel) |
| Does this ship in the package barrel? | CPS |
| `export` or `export type`? | CPS |
