---
description: "Local PR review on the current branch diff (Heimdall / Kimi via NVIDIA NIM). Does not post to GitHub. Pass --base or other args through to heimdall-review diff."
priority: 25
---

# /local-pr-review

Local review before you open or update a PR. **Default engine: Heimdall (Kimi via
NVIDIA NIM).** Optional: `--provider gemini` / `gemini-direct` (Heimdall agentic,
`GOOGLE_AI_API_KEY`). No separate Gemini slash command — one protocol SSOT.
Does not replace NIM. See protocol § Multi-provider.

Skill SSOT (same behavior): `${CLAUDE_PLUGIN_ROOT}/skills/local-pr-review/SKILL.md`
(symlink → `shared/skills/local-pr-review/`).

Read and follow [`shared/references/heimdall/protocol.md`](../../references/heimdall/protocol.md)
(protocol SSOT). Pass `$ARGUMENTS` through to `heimdall-review diff`.

Requires `NVIDIA_API_KEY` for the default path — use product-repo secret helpers; see protocol.
