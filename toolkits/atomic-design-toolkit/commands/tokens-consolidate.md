---
description: "Extract design tokens from N repos/apps, flag where they diverge (never merge silently), propose a canonical set, and materialize a shared packages/tokens (tokens.css + tokens.ts + tailwind-preset.js) with a per-app migration plan that feeds /migrate."
argument-hint: "<path> [<path> ...] [:report] [:materialize]  e.g. ../app-a ../app-b, . ../other :report"
---

# /tokens-consolidate — Design-Token Extraction + Consolidation

You are a design-systems engineer resolving **token divergence**: the same design values
(colors, type, spacing, radii, shadows) copied by hand into several apps that have since drifted
apart. This command extracts the concrete values from each source, shows exactly where they
disagree, proposes one reconciled set, and materializes a **single source of truth** the apps
import instead of re-typing values.

This is the **sibling of `/audit` and `/wcag-audit`**: same stack detection, same
`references/audit-report-schema.md` contract, same `/migrate` handoff for the per-app rollout.

> Lineage note: the extraction method (five token categories, "flag inconsistencies rather than
> merge silently") follows the general design-system-extract approach that circulates in the
> agent-design community; it is reimplemented here in the house voice with Acme examples — nothing
> vendored, no upstream skill bundled.
>
> **Canonical instance:** ChimeraNext's design system is already materialized as the
> **`@chimeranext/tokens`** package in the `chimeranext/design-system` repo (Style Dictionary →
> `tokens.css` + `tailwind-preset` + Dart). When consolidating ChimeraNext apps, the goal is to
> migrate them onto **that** package, not to fork a new one — this command produces the divergence
> report and the migration plan that get each app there.

## Usage

```bash
# Extract + divergence report across three apps
/atomic-design-toolkit:tokens-consolidate ./apps/web ../better-microservices/apps/web ../portfolio

# Just one app, against the canonical @chimeranext/tokens
/atomic-design-toolkit:tokens-consolidate ./apps/web

# Emit the report file (input to /migrate)
/atomic-design-toolkit:tokens-consolidate ./a ./b :report

# Also write packages/tokens/ (tokens.css + tokens.ts + tailwind-preset.js)
/atomic-design-toolkit:tokens-consolidate ./a ./b :materialize
```

## Step 0: Locate token sources

For each input path, find where design values live (in priority order):

| Source | Where |
|--------|-------|
| CSS custom properties | `:root { --... }` in `globals.css` / `tokens.css` / `theme.css` |
| Tailwind theme | `theme.extend.{colors,fontFamily,spacing,borderRadius,boxShadow}` in `tailwind.config.{js,ts}` |
| A tokens package | an existing `@*/tokens` import or `packages/tokens/` |
| Hardcoded literals | hex/rgb/hsl and px/rem values inline in components (the drift symptom) |

If an app already imports `@chimeranext/tokens`, record it as **already-canonical** and only report
its remaining hardcoded literals.

## Step 1: Extract concrete values (five categories)

For every source, extract **actual values — never guess**. Missing a value is a finding, not a
default to invent. The five categories:

1. **Colors** — brand primary/accent, semantic (success / warning / error / info), a neutral scale
   (9-11 steps), and surfaces (background / card / muted / border / foreground). Record the color
   space as authored (hex, `rgb`, `hsl`).
2. **Typography** — font families + fallbacks, size scale, weights, line-heights, letter-spacing,
   and any named text styles (hero / heading / body / eyebrow).
3. **Spacing** — the base unit (4px / 8px) and the full scale up to the largest gap/section padding.
4. **Radii + shadows** — radius scale (xs → 3xl), and each shadow as offset / blur / spread / color / opacity.
5. **Other** — z-index layers, animation durations + easings, breakpoints, container widths.

Normalize names to a canonical scheme so cross-app comparison is apples-to-apples:
`--color-*`, `--font-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--z-*`, `--duration-*`, `--ease-*`, `--screen-*`.

## Step 2: Divergence report (flag, don't merge)

Build a **token × repo matrix**. For each canonical token, list each source's value; mark:

- **✓ consistent** — all sources agree.
- **⚠ divergent** — sources disagree (the drift). **Do not pick a winner silently** — surface it as a
  decision.
- **∅ missing** — a source lacks the token entirely (gap).
- **＋ extra** — a source has a token no other has (candidate to promote or drop).

Example (Acme):

| Token | acme-web | acme-docs | acme-portfolio | Verdict |
|---|---|---|---|---|
| `--color-primary` | `#7C5CFF` | `#7C5CFF` | `#7B5BFE` | ⚠ divergent (portfolio off by 1 hue) |
| `--space-4` | `1rem` | `1rem` | `1rem` | ✓ consistent |
| `--radius-lg` | `10px` | `0.5rem` (8px) | `12px` | ⚠ divergent (3 different values) |
| `--font-heading` | `Sora` | `Sora` | ∅ missing | ∅ (portfolio has no display face) |
| `--shadow-glow` | present | ∅ | ∅ | ＋ extra (only acme-web) |

For each ⚠/∅/＋ row, add a one-line **note** (why they differ, what the safe reconciliation is).
Near-duplicates (`10px` vs `0.5rem`) are flagged, not auto-collapsed.

## Step 3: Propose the canonical set

Recommend one value per token with a stated rule:

- **ChimeraNext apps:** the canonical value is whatever **`@chimeranext/tokens`** already defines;
  divergences are "app X drifted from canonical" → migrate X. Only propose a *new* canonical value
  when the token is absent from the package (a real gap to add upstream).
- **Non-ChimeraNext / greenfield:** prefer the value that (a) most sources already use, (b) sits on a
  regular scale (4/8pt spacing, a modular type scale), and (c) passes contrast for color pairs
  (defer to `wcag-audit` for the check). State the rule you applied per divergent token.

Never resolve a divergence the user hasn't seen — the report lists options; the canonical proposal is
explicit and reversible.

## Step 4: Materialize `packages/tokens/` (`:materialize`)

Emit three artifacts from **one** source of truth so no app re-types values:

- **`tokens.css`** — CSS custom properties grouped by category (`:root { --color-*; --font-*; ... }`),
  plus a `[data-theme="dark"]` / `.dark` block for the dark overrides. This is what Tailwind + plain CSS consume.
- **`tokens.ts`** — typed exports (`export const color = { primary: "…" } as const`) for TS logic/theming.
- **`tailwind-preset.js`** — a Tailwind preset that maps the tokens into `theme.extend`, so each app's
  `tailwind.config` does `presets: [require("@org/tokens/tailwind-preset")]` instead of redefining the theme.

Keep all three **generated from the same token map** (a single JS/JSON object or a Style-Dictionary-style
source) — if they can drift, they will. For ChimeraNext, do **not** create a competing package: point the
apps at `@chimeranext/tokens` and only propose additions to it.

## Step 5: Per-app migration plan → `/migrate`

Emit, per app, an ordered list of changes that `/atomic-design-toolkit:migrate` turns into phased work:

1. Add the tokens package as a dependency (or workspace link); extend the Tailwind preset.
2. Replace the app's local `:root` token block with an import of `tokens.css`.
3. Replace hardcoded literals (from Step 1) with token references — the highest-count offenders first.
4. Re-run `/tokens-consolidate <app> :report` to confirm 0 divergent / 0 hardcoded remain.

Map these to the report-schema **6-phase model**: package adoption + preset = **Phase 1/2**;
literal replacement per feature = **Phase 3**; delete the now-dead local token block = **Phase 4**;
add a CI check that fails on new hardcoded colors = **Phase 5**.

## Report Mode (`:report`)

Reuse `references/audit-report-schema.md`:

- **File name:** `.atomic-design-toolkit/reports/tokens-{YYYYMMDD-HHMM}.md`.
- **Finding IDs:** `T{n}` (token divergence / gap / hardcoded-literal cluster) — distinct from
  `/audit`'s `W/B/E/N` and `/wcag-audit`'s `A/Q`.
- **Frontmatter** adds a `tokens` block under `summary`:
  ```yaml
  summary:
    blockers: 0
    warnings: 4          # divergent tokens
    info: 2              # gaps / extras
    tokens:
      sources: 3
      consistent: 41
      divergent: 6
      missing: 3
      extra: 2
      canonical-package: "@chimeranext/tokens"   # or "(new) packages/tokens"
      hardcoded-literals: 118                      # count across all sources
  ```
- Each `T{n}` finding carries the **token × repo** values in its Evidence block and the proposed
  canonical value in Remediation.
- Include the **divergence matrix** as a `## Token Divergence` appendix and the plan as `## Suggested Phases`.
- TL;DR: sources scanned, divergent-token count, and the `/atomic-design-toolkit:migrate <path>` command.

## Output Checklist

- [ ] Every input path's token source located (or "hardcoded only" noted).
- [ ] Five categories extracted with concrete values; missing values flagged, not invented.
- [ ] Token × repo divergence matrix with ✓ / ⚠ / ∅ / ＋ verdicts and per-row notes.
- [ ] Canonical proposal stated with the rule applied (and pointed at `@chimeranext/tokens` for ChimeraNext apps).
- [ ] On `:materialize`: `tokens.css` + `tokens.ts` + `tailwind-preset.js` from one source.
- [ ] On `:report`: schema-valid file written; path + TL;DR + `/migrate` command printed.
