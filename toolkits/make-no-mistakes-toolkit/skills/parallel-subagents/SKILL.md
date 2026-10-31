---
name: parallel-subagents
description: Harness-agnostic orchestrator for parallel subagent-driven development with background execution — detects the harness (OpenCode → subagents-opencode; Claude → subagents-claude), builds a dependency graph, isolates each task in its worktree, dispatches independent tasks in parallel with background, gates waves on tests, reviews each implementation, and finishes with a human integration decision (no auto-merge). Use when dispatching multiple independent tasks concurrently, running parallel agents with background execution, "parallel subagents", "dispatch waves", or delegating to parallel agents across harnesses.
---
# /parallel-subagents

Read and follow [`references/parallel-subagents/protocol.md`](../references/parallel-subagents/protocol.md) (protocol SSOT).
