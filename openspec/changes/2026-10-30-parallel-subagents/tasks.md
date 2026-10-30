# Tasks — /parallel-subagents + /subagents-claude

## Implementation

- [ ] C1: Create `skills/subagents-claude/SKILL.md` (peer of `subagents-opencode`, Claude primitives).
- [ ] C2: Create `references/subagents-claude/protocol.md` (controller+implementer+reviewer+ledger for Claude Code).
- [ ] P1: Create `skills/parallel-subagents/SKILL.md` (harness detection, waves, background dispatch, gates, human finishing).
- [ ] P2: Create `references/parallel-subagents/protocol.md` (orchestrator protocol SSOT).
- [ ] P3: Create `commands/parallel-subagents.md` (command entry).
- [ ] P4: Add `parallel-subagents` and `subagents-claude` to the toolkit's `package.json` `"skills"` catalog.

## Verification

- [ ] `openspec validate 2026-10-30-parallel-subagents` valid.
- [ ] Harness detection logic distinguishes opencode vs claude (unit-checked).
- [ ] `parallel-subagents` protocol documents dependency graph, waves, worktree isolation, background dispatch, test gate, review gate, human finishing.
- [ ] `subagents-claude` protocol references Claude primitives (`.claude/agents`, `ListAgents`/`SendMessage`, `--worktree`).
- [ ] No auto-merge anywhere in the protocol.
- [ ] Skills registered in the toolkit catalog.
