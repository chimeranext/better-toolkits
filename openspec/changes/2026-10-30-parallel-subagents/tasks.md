# Tasks — /parallel-subagents + /subagents-claude

## Implementation

- [x] C1: Create `skills/subagents-claude/SKILL.md` (peer of `subagents-opencode`, Claude primitives).
- [x] C2: Create `references/subagents-claude/protocol.md` (controller+implementer+reviewer+ledger for Claude Code).
- [x] P1: Create `skills/parallel-subagents/SKILL.md` (harness detection, waves, background dispatch, gates, human finishing).
- [x] P2: Create `references/parallel-subagents/protocol.md` (orchestrator protocol SSOT).
- [x] P3: Create `commands/parallel-subagents.md` (command entry).
- [x] P4: Add `parallel-subagents` and `subagents-claude` to the toolkit's `package.json` `"skills"` catalog.

## Verification

- [x] `openspec validate 2026-10-30-parallel-subagents` valid.
- [x] Harness detection logic distinguishes opencode vs claude (unit-checked).
- [x] `parallel-subagents` protocol documents dependency graph, waves, worktree isolation, background dispatch, test gate, review gate, human finishing.
- [x] `subagents-claude` protocol references Claude primitives (`.claude/agents`, `ListAgents`/`SendMessage`, `--worktree`).
- [x] No auto-merge anywhere in the protocol.
- [x] Skills registered in the toolkit catalog.
