# Impeccable design QA — atomic-design-toolkit reference

Owner: `atomic-design-toolkit`. Impeccable (design guidance for AI coding
agents: 1 skill, 24 commands, 61 deterministic detector rules) is the
toolkit's design-review engine. Related: `design-system-analyzer`,
`wcag-audit`, `audit/`.

This reference is **branding-agnostic**. It names roles, rules, and flows —
never hex values, font names, or brand tokens. Concrete values live in the
consuming project's design SSOT (tokens + `DESIGN.md`) and are passed to
impeccable as context, not restated here.

## Install

Per project (no global writes without HITL per bootstrap protocol):

```bash
npx impeccable install --providers=<harness> --scope=project
```

This wires the skill + design hook for the harness. Refresh with
`npx impeccable update`. Add the `.gitignore` block from the impeccable README
(`.impeccable/` ephemeral output stays untracked; `config.json`,
`design.json`, `surfaces/*.md`, `critique/*.md` stay tracked).

## Command map (impeccable → toolkit flows)

| Impeccable | Toolkit flow |
|---|---|
| `/impeccable audit <surface>` | `design-system-analyzer` gap pass first, then detector |
| `/impeccable critique <surface>` | design review before any polish (leaves design unchanged) |
| `/impeccable polish <surface>` | implement critique findings |
| `/impeccable typeset/layout/colorize` | targeted passes (fonts, rhythm, accents) |
| `/impeccable document` | refresh the project's DESIGN.md from implementation |
| `/impeccable extract` | promote repeated patterns to `tokens-consolidate` |
| `/impeccable live/generate` | browser variant iteration (needs local dev server) |

## DESIGN.md loop (SSOT discipline)

- Impeccable's `init` writes `PRODUCT.md` (audience/purpose/constraints) and
  `document` writes per-project `DESIGN.md`. These are PROJECT records.
- The corporate SSOT stays in the design-system repo (`DESIGN.md` + token
  source). Never let a project record drift from it: run the SSOT lint /
  token tests after any `document` refresh, and promote intentional changes
  upstream instead of forking values.
- Shape before build for new surfaces (`/impeccable shape`); record the
  comp-first vs code-first decision in `.impeccable/config.json`.

## Detector in CI

```bash
npx impeccable detect ./dist --json   # exit 0 clean, 2 findings, 1 setup error
```

- Gate landing/CLAUDE-relevant surfaces on exit 0. Record the before/after
  counts in the PR body as evidence.
- Waivers travel with reason: prefer detector config with reason over
  inline markers when the build strips comments; otherwise restyle to remove
  the pattern. A single intentional instance (e.g. one page eyebrow) may be
  waived with the reason in the PR — repeated identical instances are
  template slop, never waive those.

## Anti-pattern classes (role-level, no brand values)

- Decorative gradient text on headings — use solid role colors.
- Text/background pairs below AA — fix by adding a *text-safe step* of the
  same role to the SSOT; never by swapping roles.
- Functional text below the legibility floor — raise to the floor.
- Cards nested in cards — flatten container chrome, keep leaf cards.
- Identical kicker-above-heading repeated per section — vary or drop.
- All-caps body copy — reserve caps for short labels.
- Unbounded line length, sections without horizontal inset.
