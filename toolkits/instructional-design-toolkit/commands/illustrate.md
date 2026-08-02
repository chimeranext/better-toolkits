---
description: Genera el asset set de ilustraciones brandeadas de un curso o módulo vía la API de Gemini — descubre los embeds/manifests pendientes en el markdown, genera los diagramas, los revisa visualmente y los promueve a content/courses/<slug>/assets/. La paleta de marca llega por overlay del consumer.
argument-hint: "[course-slug | course-slug/module-slug] [--regenerate <asset-name>] [--model <gemini-model>]"
---

# Illustrate: $ARGUMENTS

You are generating the **branded illustration asset set** for a course (or one
module), so every lesson's embedded diagrams exist, match the consumer's visual
identity, and survive the importer pipeline (assets in
`content/courses/<slug>/assets/` get uploaded to platform Storage and their
markdown paths rewritten).

This command extracts the image-generation pattern that previously lived only
inside `slides-generate` Phase 2 §5, and makes it available for **lesson
markdown** (text classes, challenges, briefs) — the convention is one asset set
per course, embedded in the lessons.

## Contract

| Location | Role |
|---|---|
| `content/courses/<slug>/assets/*.png` | **Durable home** — committed, uploaded by the importer, referenced from lessons as `../../assets/<name>.png` |
| `<holding>/<course-slug>/*.png` | **Staging** — raw generations (good and bad takes) reviewed before promotion. Consumer-specific holding folder (chimera-academy: `nanobanana-output/`, gitignored); namespaced per course. Neutral default: `.illustrate-staging/` |
| `module-*/assets-needed.md` | Optional **manifest** written by authoring passes: one line per asset — `<name>.png — <one-sentence diagram description in English>` |

## Phase 1 — Discover what's missing

1. Resolve the target course dir from `$ARGUMENTS` (consumer layout;
   chimera-academy: `content/courses/<slug>/`). Optional module scope.
2. Collect needed assets from two sources:
   - Every `assets-needed.md` manifest in scope.
   - Every image reference in lesson markdown (`../../assets/<name>.png` or
     `assets/<name>.png`) that does **not** exist on disk.
3. For each missing asset without a manifest line, derive the description from
   the embed's alt text and surrounding section. If neither gives enough to
   draw from, ask the user rather than inventing.
4. Present the generation list (name → description) and **wait for approval**
   if it exceeds 8 assets or if any description was derived rather than
   authored.

## Phase 2 — Resolve the visual identity

The base command is voice/brand-neutral. Defaults:

> Clean modern diagram on a neutral dark background. High-contrast text
> labels. Two accent colors used consistently. Rounded rectangle containers.
> Numbered items use colored circle badges. Minimal, no shading, no gradients
> on background. 16:9 aspect ratio.

A consumer overlay (see Overlay invocation below) replaces this with the brand
palette — e.g. chimera-academy contributes: dark navy-purple `#272749`
background, white labels, lilac `#C980FC` / coral `#FF7151` / pink `#F488F8`
accents, and the holding folder `nanobanana-output/`. Never hardcode a
consumer palette in this file.

## Phase 3 — Generate

Requires `GEMINI_API_KEY` in the environment (have the operator stage it with
their secret helpers; never echo it). Default model
`gemini-3-pro-image-preview`; override with `--model`.

For each asset, ONE generation call:

```bash
curl -sS "https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Generate an image: {DESCRIPTION}. {PALETTE_STYLE}"}]}],
       "generationConfig":{"responseModalities":["TEXT","IMAGE"]}}' -o resp.json
# extract candidates[0].content.parts[*].inlineData.data (base64) → <holding>/<course-slug>/<name>.png
```

Prompting rules (they are what keeps decks/lessons feeling like ONE system):
- One diagram concept per image — never compose two ideas.
- Spell out every text label verbatim in the description (the model renders
  what you write; vague descriptions produce lorem-ipsum-like labels).
- State the layout explicitly (horizontal chain / vertical process / N-row
  comparison / two-column funnel).
- Reuse the exact same palette sentence for every asset in the run.

## Phase 4 — Review gate (mandatory, visual)

**Read every generated PNG** (view it — do not trust the API status): labels
spelled correctly, layout matches the description, palette consistent with the
rest of the course set. Regenerate failures (max 2 retries each, refining the
description); anything still failing goes to the report as `NEEDS-HUMAN`.

Promote approved takes: copy from the holding folder to
`content/courses/<slug>/assets/<name>.png`. Never leave keepers only in
staging — staging is disposable/gitignored.

## Phase 5 — Verify embeds & report

1. Re-scan the lesson markdown in scope: every `assets/<name>.png` reference
   must now resolve to a file. List any still-missing.
2. Report: assets generated / promoted / retried / NEEDS-HUMAN, the palette
   source (overlay vs neutral default), and a reminder to run the consumer's
   import dry-run so the importer validates the image paths.

## Overlay invocation (post-base-draft)

After producing the base asset set, follow
`${CLAUDE_PLUGIN_ROOT}/assets/runtime/overlay-protocol.md` to discover and
apply consumer overlays (skills declaring `overlay_target: ["illustrate"]`,
sorted by `overlay_priority`). Expected contributions when a consumer like
`chimera-academy` is installed: brand palette sentence, holding-folder path,
logo/watermark rules. Layer 1 invariants do not apply to PNGs, but the
**file names referenced from lesson markdown are load-bearing** — an overlay
must never rename generated files after embeds were written. If
`${CLAUDE_PLUGIN_ROOT}` fails to expand, emit a visible warning and deliver
the neutral-palette set — do not crash.

## Failure modes

| Symptom | Cause / fix |
|---|---|
| `GEMINI_API_KEY` missing | Stage it via the operator's secret flow; do not paste keys into the session. |
| Labels misspelled / hallucinated | Description didn't spell the labels verbatim — rewrite and regenerate. |
| Set looks inconsistent | Palette sentence drifted between calls — regenerate the outliers with the exact shared sentence. |
| Importer can't find images | Keeper left in staging — Phase 4 promotion skipped; copy to `assets/` and re-verify. |
