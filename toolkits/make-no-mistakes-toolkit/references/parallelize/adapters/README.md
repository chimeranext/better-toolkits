# Parallelize — harness entry matrix

**Protocol SSOT:** [`protocol.md`](../protocol.md) (harness-agnostic).

| Harness | Entry | How to load SSOT |
|---------|-------|------------------|
| **Claude Code** | `commands/parallelize.md` (`/make-no-mistakes:parallelize`) | Orchestrator → Read protocol |
| **Cursor** | `skills/parallelize/SKILL.md` (`/parallelize`) | Same protocol; spawn via Agent/Task after capability gate |
| **OpenCode V2 / Antigravity** | Docs + paste path | Read `references/parallelize/protocol.md`, then gate + fan-out |

Do not maintain a second fan-out protocol per harness. Map tool names (`Agent`, `Task`, `SendMessage`, …) in the capability gate to whatever the live harness exposes.
