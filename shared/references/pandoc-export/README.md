# Pandoc export (brand-neutral SSOT + vault-first resolution)

Standalone Markdown → PDF for client-facing deliverables (SRS, SPMP, checklists).
Does **not** require Obsidian.

## `better.tex` vs a vault brand template (e.g. engagement `_templates/export/*.tex`)

| | **Vault brand template** (`_templates/export/*.tex`, not `better.tex`) | **`better.tex` (this pack)** |
| --- | --- | --- |
| Owner | Engagement / business-brain vault | better-toolkits shared SSOT |
| Brand | Client/studio colors, fonts, logo, footer | Neutral palette (`DocInk` / `DocAccent`); optional `$logo$` |
| Fonts | Often vault-specific (e.g. Montserrat + Open Sans packages) | Engine defaults / Liberation via `-V` |
| Logo | Usually required (`logo.png` beside the template) | Optional |
| When to use | **Default** when the destination brain already has an export pack — same look Isaac used for client PDF drafts | Fallback for new brains, non-branded vaults, or toolkit dogfood |

Same Pandoc structure (title page metadata, fancyhdr, titlesec). Different skin.

## Resolution order (skills that emit PDF)

Use [`resolve-template.sh`](resolve-template.sh):

1. **Engagement vault branded** — `<vault>/_templates/export/*.tex` excluding `better.tex`
2. **Engagement vault seeded** — `<vault>/_templates/export/better.tex`
3. **Setup cache** — `~/.config/better-toolkits/pandoc-export/better.tex` (seeded by `/toolkits-initial-setup`)
4. **Toolkit SSOT** — `shared/references/pandoc-export/better.tex`

```bash
mapfile -t _pandoc < <(bash shared/references/pandoc-export/resolve-template.sh --root "$VAULT" --print-resource-path)
TMPL="${_pandoc[0]}"
RP="${_pandoc[1]}"

pandoc INPUT.md -o OUT.pdf \
  --pdf-engine=xelatex \
  --template="$TMPL" \
  --resource-path="$RP" \
  --data-dir=/usr/share/pandoc/data \
  -V documentclass=article
```

Fractional-CTO skills that produce client PDFs (SPMP 16326, requirements 29148,
16085 companions when exported) **must** follow this order — never hard-code only
`better.tex` when a vault brand template exists.

## Seeding

| Trigger | Action |
| --- | --- |
| `/toolkits-initial-setup` | Copy this pack to `~/.config/better-toolkits/pandoc-export/` |
| New business-brain without `_templates/export/` | Copy `better.tex` (+ `block-id.lua`) into `<vault>/_templates/export/` |
| Vault already has a brand `.tex` | Leave it; skills prefer it over `better.tex` |

## Files

| File | Role |
| --- | --- |
| [`better.tex`](better.tex) | Neutral Pandoc LaTeX template |
| [`block-id.lua`](block-id.lua) | Optional `^block-id` → LaTeX labels |
| [`resolve-template.sh`](resolve-template.sh) | Vault-first resolver |

## Prerequisites

- `pandoc` ≥ 3
- PDF engine: `xelatex` (preferred)
- For vault brand templates: fonts + `logo.png` as that pack requires
