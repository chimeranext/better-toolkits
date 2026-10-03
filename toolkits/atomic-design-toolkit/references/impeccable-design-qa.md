# Impeccable design QA — atomic-design-toolkit reference

Owner: `atomic-design-toolkit`. Impeccable (pbakaus/impeccable, design guidance
for AI coding agents: 1 skill, 24 commands, 61 deterministic detector rules) is
the toolkit's design-review engine. Related: `design-system-analyzer`,
`wcag-audit`, `audit/`.

## Install

Per project (no global writes without HITL per bootstrap protocol):

```bash
npx impeccable install --providers=opencode --scope=project
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
- The corporate SSOT stays in `design-system/DESIGN.md` + `tokens.json` (W3C).
  Never let a project `DESIGN.md` drift from it: run `design:lint` /
  token tests after any `document` refresh, and promote intentional changes
  upstream instead of forking values.
- Shape before build for new surfaces (`/impeccable shape`); record the
  decision (comp-first vs code-first) in `.impeccable/config.json`.

## Detector in CI

```bash
npx impeccable detect ./dist --json   # exit 0 clean, 2 findings, 1 setup error
```

- Gate landing/CLAUDE-relevant surfaces on exit 0. Waivers travel with reason:
  inline `<!-- impeccable-disable <rule>: <reason> -->` only when the marker
  survives the build (Astro strips HTML comments — prefer `config.json`
  `detector.ignoreRules` with reason, or restyle to remove the pattern).
- Known-good precedent: `chimeranext/website` landing went 43 → 0 findings
  (gradient-text, nested-cards, low-contrast pairs, 10px pills, kickers,
  line-length, cramped-padding) in PR `fix(website): impeccable polish pass`.

## Anti-patterns (highest signal)

- Gradient text on headings, neon-on-dark pairs below AA, functional text
  under 11px, cards nested in cards, identical kicker-above-h2 ×N, all-caps
  body copy, unbounded line length (>80ch), sections without horizontal inset.
- Brand roles beat detector literalism: when a role color fails AA as text,
  add a *soft step* to the SSOT (e.g. arcaneSoft for links) instead of
  swapping roles — see `design-system` soft-step precedent.
