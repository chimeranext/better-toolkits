---
name: local-pr-review
description: >
  Review de código de la rama actual en local con Heimdall (NVIDIA NIM). Use when the user asks for "local pr review",
  "revisar mi rama", "revisá el diff", "PR review local", "/local-pr-review",
  or wants an AI code review without touching GitHub or CI.
---

# local-pr-review — thin entry (Heimdall)

Read and follow [`shared/references/heimdall/protocol.md`](../../references/heimdall/protocol.md)
(protocol SSOT). Pass `$ARGUMENTS` through to `heimdall-review diff`.

Engine: `shared/heimdall/` (needs `NVIDIA_API_KEY`; see protocol for
secret handling). Default path is **one-shot LLM-as-Judge** (single inference over
the full PR JSON). Legacy multi-turn tool loop: `REVIEWER_AGENTIC_LOOP=1`.
Default prints the review; never posts.

**Cursor (bootstrap):** `/local-pr-review` in `shared/bootstrap/commands/`; plugin
path `skills/local-pr-review/` (symlink to this folder). After marketplace bumps:
`/prune-better-toolkits-cache`.

**Gemini (additive, not a replacement for NIM):** `/local-pr-review --provider gemini`
(alias `gemini-direct`) — requires `GOOGLE_AI_API_KEY`. No separate Gemini slash
command; see protocol § Multi-provider.

## Lecciones aprendidas (2026-10-28)

- **Catálogo NIM free rotativo:** los endpoints `nim_type_preview` de build.nvidia.com
  cambian. Heimdall consulta el catálogo en cada review (`warnIfNimCatalogNeedsRefresh`)
  y WARN si un lane de la cadena ya no existe (p.ej. `kimi-k2.6` dio 404 y fue
  reemplazado). La ancla `NIM_CATALOG_ANCHOR_DATE` se congela manualmente al
  re-priorizar; >30 días sin re-priorizar ⇒ WARN de re-consulta.
- **Orden de la cadena adversarial por LATENCIA medida, no por "mejor coder"**
  (2026-10-28): `nim-nemotron-3.5-lightning` (~0.6s) → `nim-nemotron-3-ultra`
  (~0.86s con `enable_thinking:false`) → `nim-deepseek-v4.1-flash` (colgó >45s)
  → `nim-glm-5-3-flash` (colgó >240s; default `reasoning_effort`=max lo saca del tier free).
- **Slug de API ≠ slug de página:** GLM es `z-ai/glm-5.3-flash` (punto), no
  `z-ai/glm-5-3-flash` (guión). Validá siempre contra el curl de la página del modelo.
- **Key por default:** `staging` → `NVIDIA_API_KEY_INTERNAL_STAGING` en
  `~/.agents/.heimdall.env`. Precedencia: user scope → repo → env.
- **Marker de confianza:** `<!--heimdall:confidence:{...}-->` (renombrado desde
  `bifrost:confidence`). Es metadata HTML plano, distinguible de `bifrost:component`.

