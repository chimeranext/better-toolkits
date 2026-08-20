---
name: parallelize
description: >
  Fan out a body of work across isolated background agents (capability gate,
  stream split, briefing, converge). Use when the user invokes /parallelize,
  asks to run work in parallel, or wants multiple Task/Agent streams without
  file collisions. Multi-harness entry for the parallelize protocol SSOT.
disable-model-invocation: true
---

# parallelize — multi-harness entry

Read and follow the protocol SSOT:

[`references/parallelize/protocol.md`](../../references/parallelize/protocol.md)

Claude Code thin command (same SSOT): `commands/parallelize.md`.

Harness notes:

- **Cursor:** this skill (`/parallelize` in the skills menu). Spawn via the harness Agent/Task surface the protocol’s capability gate detects (`Agent` / Task with background + isolation when available).
- **Claude Code:** `/make-no-mistakes:parallelize` → same protocol.
- **OpenCode2 / Antigravity:** instruct the agent to Read the protocol path above, then run the gate + fan-out using whatever spawn primitive the harness exposes.

`$ARGUMENTS` = work description, plan/spec path, or issue IDs. If empty, ask what to parallelize before spawning.
