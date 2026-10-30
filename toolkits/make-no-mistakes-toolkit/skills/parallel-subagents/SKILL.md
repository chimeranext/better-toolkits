---
name: parallel-subagents
description: Harness-agnostic orchestrator for parallel subagent-driven development with background execution — detects the harness (OpenCode → subagents-opencode; Claude → subagents-claude), builds a dependency graph, isolates each task in its worktree, dispatches independent tasks in parallel with background, gates waves on tests, reviews each implementation, and finishes with a human integration decision (no auto-merge). Use when dispatching multiple independent tasks concurrently, running parallel agents with background execution, "parallel subagents", "dispatch waves", or delegating to parallel agents across harnesses.
---
# /parallel-subagents

Read and follow [`references/parallel-subagents/protocol.md`](../references/parallel-subagents/protocol.md) (protocol SSOT).

Harness-agnostic orchestrator for parallel subagent-driven development, inspired by
superpowers `dispatching-parallel-agents`, Oakheart Lab (orchestrator pattern), and
Claude Code sub-agent best practices.

Invokes the correct per-harness skill:
- **OpenCode** → `subagents-opencode` (herdr).
- **Claude Code** → `subagents-claude` (`.claude/agents`, `ListAgents`/`SendMessage`, `--worktree`).

Flow: detect harness → dependency graph → waves → isolation (worktree) → parallel
dispatch with **background** → test gate → per-implementation review → human
integration decision (never auto-merge).

Key rules:
- **Parallel only for independent tasks** (distinct files, no shared state).
- Tasks sharing files/state → **sequential waves** with a commit between waves.
- **Background**: the coordinator does not block waiting; it receives a completion
  notification.
- **Isolation**: one worktree per task; block `git add -A`; commit-before-dispatch.
- **Review gate**: reviewer after each implementer; fresh fix agent if gaps.
- **Human finishing**: integration decision via `/resolve-open-questions`; no auto-merge.
