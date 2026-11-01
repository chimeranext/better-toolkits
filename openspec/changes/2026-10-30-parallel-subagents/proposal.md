# Proposal — /parallel-subagents + /subagents-claude

## Problem

The monorepo has **`/subagents-opencode`** (herdr-driven subagent development for
the OpenCode harness) but **no `/subagents-claude`** peer, and **no ghostskill
that dispatches multiple independent tasks in parallel with **background**
execution. The documented ideal (from superpowers `dispatching-parallel-agents`,
Oakheart Lab's orchestrator pattern, and Claude Code sub-agent best practices) is:

- One worker per independent domain, with **isolated context** (never inheriting
  the coordinator's session).
- A **dependency graph** first: tasks sharing files/state run sequentially or in
  waves; truly independent tasks run concurrently.
- **Background** dispatches (fire-and-forget with completion notification) so a
  long-running task does not block the coordinator.
- **Isolation** per task (worktree + branch), with `git add -A` blocked and
  commit-before-dispatch.
- A **review gate** per implementation (never trust the implementer's word).
- Finishing/integration is a **human decision**, never auto-merge.

Today none of this exists as a single coherent skill. `subagents-opencode` is
sequential-capable but not parallel-by-default, there is no background-aware
orchestrator, and the Claude harness has no equivalent skill at all.

## Proposed change

Add two skills to `toolkits/make-no-mistakes-toolkit/skills/`:

1. **`subagents-claude/`** — peer of `subagents-opencode` for the **Claude Code**
   harness (`.claude/agents/*.md`, `ListAgents`/`SendMessage`, `--worktree`),
   following the `subagents-harness-capabilities.md` matrix.
2. **`parallel-subagents/`** — a harness-agnostic orchestrator that:
   - detects the active harness (OpenCode → `subagents-opencode`; Claude →
     `subagents-claude`),
   - builds a dependency graph and splits tasks into parallel waves,
   - isolates each task in its own worktree + branch,
   - dispatches with **background** execution (no blocking of the coordinator),
   - gates each wave on green tests,
   - runs a review gate per implementation,
   - finishes with a human integration menu (no auto-merge).

Both ship as skills with a `SKILL.md` + `references/<name>/protocol.md`, plus a
`commands/parallel-subagents.md` command entry.

## Out of scope

- **Agent Teams** (Claude Code `TeammateTool`/`SendMessage`/`TaskList`): a Claude
  Code-only feature requiring A2A orchestration on other harnesses — deferred to a
  future change.
- Database branching / port isolation (noted as optional extensions, not
  implemented).
- Auto-merge or auto-integration (stays a human decision).

## Constraints

- Harness detection is heuristic (presence of `opencode`/`~/.config/opencode`
  vs `claude`/`.claude`), with an explicit override.
- No stream is discarded; stderr preserved into the shared log sink.
- Parallel dispatch only for independent tasks sharing no files/state; anything
  else is sequenced into waves.
- Background execution means the coordinator does not block waiting, but still
  receives completion notifications.
