---
name: local-pr-review
description: >
  Review de código de la rama actual en local con Heimdall (Kimi vía NVIDIA NIM). Use when the user asks for "local pr review",
  "revisar mi rama", "revisá el diff", "PR review local", "/local-pr-review",
  or wants an AI code review without touching GitHub or CI.
---

# local-pr-review — thin entry (Heimdall)

Read and follow [`shared/references/heimdall/protocol.md`](../../references/heimdall/protocol.md)
(protocol SSOT). Pass `$ARGUMENTS` through to `heimdall-review diff`.

Engine: `shared/heimdall/` (needs `NVIDIA_API_KEY`; see protocol for
secret handling). Default prints the review; never posts.

**Cursor (bootstrap):** `/local-pr-review` in `shared/bootstrap/commands/`; plugin
path `skills/local-pr-review/` (symlink to this folder). After marketplace bumps:
`/prune-better-toolkits-cache`.

**Gemini (additive, not a replacement for NIM):** `/local-pr-review --provider gemini`
(alias `gemini-direct`) — requires `GOOGLE_AI_API_KEY`. No separate Gemini slash
command; see protocol § Multi-provider.
