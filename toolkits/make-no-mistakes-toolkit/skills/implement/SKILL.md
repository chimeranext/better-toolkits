---
name: implement
description: >
  Execute Linear issues with the make-no-mistakes disciplined protocol
  (worktrees, HITL gates, reviewer loops, OpenSpec Phase 0). Use when the
  user invokes /implement or asks to run the full implement protocol.
  Prefer implement-advisor first when the issue may lack Bilingual Format.
disable-model-invocation: true
---

# implement — multi-harness entry

Read and follow the protocol SSOT in order:

`references/implement/` — see the phase table in `commands/implement.md`.

Start with:

1. `references/implement/config-and-input.md`
2. `references/implement/redaction-guard.md`
3. Then preflight → branch → HITL → phases 0–4 as listed in the orchestrator.

Harness matrix: `references/implement/adapters/README.md`.

`$ARGUMENTS` = Linear issue ID(s) or URL(s).
