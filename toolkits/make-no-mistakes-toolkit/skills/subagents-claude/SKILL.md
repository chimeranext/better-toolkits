---
name: subagents-claude
description: Subagent-driven development for the Claude Code harness (agnostic pattern: controller + implementer + reviewer + ledger), using Claude-native primitives (.claude/agents, ListAgents/SendMessage, --worktree). Peer of /subagents-opencode for the Claude harness. Use when executing an implementation plan with independent tasks from Claude Code, delegating to parallel agents, or mentions "subagent-driven development", "multi-agent", "claude subagents", "agent teams fallback".
---
# /subagents-claude

Read and follow [`references/subagents-claude/protocol.md`](../references/subagents-claude/protocol.md) (protocol SSOT).

Agnostic subagent-driven development pattern (controller + implementer + reviewer +
ledger) for the **Claude Code** harness. It is the peer of `/subagents-opencode`
(which uses herdr) but implemented with Claude's native primitives:

- **Subagents**: `.claude/agents/*.md` (name/description/tools/model) — isolated context.
- **Cross-session messaging**: `ListAgents` / `SendMessage` to pass findings between sessions.
- **Worktrees**: `claude --worktree` (or `git worktree add`) in `.agents/worktrees/<slug>`.
- **Workflows** (when dozens/hundreds of tasks): `/workflows`, `agent()`, `pipeline()`, `parallel()`.

Key rules (same as `subagents-opencode`):
- One implementer per task; do not dispatch implementers in parallel over the same files.
- The implementer does **not** dispatch subagents (neither helpers nor reviewer).
- The coordinator runs tasks without pausing to ask; it only stops for irreversible
  operations, security, or external effects (merge/push/publish).
- After each task, **task review** (spec + quality). **Fix loop** with a fresh fix agent
  (completed subagents cannot receive follow-up messages). **Ledger** (`progress.md`) as
  a recovery map.

Canonical worktrees: `.agents/worktrees/<slug>` (per better-toolkits AGENTS.md).

Per-harness capabilities: see [`references/subagents-harness-capabilities.md`](../references/subagents-harness-capabilities.md).
