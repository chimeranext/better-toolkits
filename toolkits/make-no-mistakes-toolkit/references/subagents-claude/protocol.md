# /subagents-claude — protocol SSOT

Agnostic **subagent-driven development** pattern for the **Claude Code** harness,
using Claude's native primitives. It is the peer of `/subagents-opencode` (herdr)
for the Claude harness.

## Pattern (coordinator)

1. **Dispatch a fresh implementer per task** — isolated context; build only what it
   needs (it does not inherit the session).
2. After each task, **task review**: spec compliance + code quality (never skip it;
   the implementer's self-review does not replace it).
3. **Fix loop** if review finds findings (cap of rounds; if it does not converge,
   **Ruling** and move on). Use a **fresh fix agent** — completed subagents cannot
   receive follow-up messages, so the fix is a new dispatch with the gap report.
4. **Final review** of the whole branch once all tasks are done.
5. **Ledger** (`progress.md`) as a recovery map — survives compaction; record every
   `Ruling`.

## Key rules

- One implementer per task; do **not** dispatch implementers in parallel over the
  same files (conflicts).
- The implementer does **not** dispatch subagents (neither helpers nor reviewer).
- The coordinator runs all tasks without pausing to ask; it only stops for:
  irreversible/destructive operations, sensitive security actions, or external
  effects (merge/push to a shared branch/publish).
- The coordinator keeps its context for coordination; artifacts are passed as files,
  not pasted into prompts.

## Subagents (Claude Code)

Subagents are Markdown files in `.claude/agents/*.md` (project) or
`~/.claude/agents/*.md` (user), with YAML frontmatter:

```yaml
---
name: implementer
description: Implements a task with isolated context.
tools: Read, Edit, Bash, Grep, Glob
model: sonnet
---
```

- The coordinator invokes subagents with **high-quality invocations**: specific scope,
  file references, constraints, and explicit success criteria. A subagent cannot
  pause to ask questions, so the first invocation must carry everything it needs.
- `CLAUDE_CODE_SUBAGENT_MODEL` allows running subagents on a cheaper model.

## Cross-session messaging

To coordinate findings between sessions (for example, the reviewer passing gaps to the
fix agent, or a worker reporting to another):

- `ListAgents` / `SendMessage` — pass context between sessions/subagents.
- In the coordinator+implementer pattern, the coordinator orchestrates; workers report
  to the coordinator, not to each other (unless explicitly needed).

## Worktree isolation

Each task that edits files must run in an isolated worktree:

```bash
git worktree add .agents/worktrees/<slug> -b <branch> <base-ref>
```

- The canonical convention is `.agents/worktrees/<slug>` (per AGENTS.md).
- Claude Code supports `claude --worktree` to work in a worktree natively.
- Block broad staging (`git add -A` / `git add .`) via hook.
- Commit before dispatch; commit between handoffs so the next worker reads the latest
  state.
- Prefer **new files** over shared edits when possible.

## Verification

- Treat the worker's output as untrusted until verified (Jidoka).
- Review the final diff before accepting any worker patch.
- The coordinator runs integration checks not covered by the worker.
- The **reviewer** reads spec + diff and emits a gap report; a fresh fix agent applies
  it.

## Retire workers

A delegation ends with the worker retired. For Claude subagents, close/retire the
worker's session when recording the disposition (accepted, rejected, superseded,
blocked). Files, diffs, and worktrees survive on disk.

## Stop conditions

Stop and report (do not improvise) when:

- a subagent rejects the model, auth state, or working directory.
- auth blocks the session.
- a worker's status is ambiguous and cannot be confirmed.
- workers need overlapping edits the coordinator cannot safely integrate.
- an irreversible operation is required without human approval.

## Plan-first delegation (opt-in)

Only when the user enables it ("plan first"/"plan mode"). The default is direct.

## Per-harness capabilities

See [`subagents-harness-capabilities.md`](../subagents-harness-capabilities.md) — a
harness-agnostic matrix. The worktree convention is `.agents/worktrees`.

## References

- Claude Code sub-agents: https://code.claude.com/docs/en/sub-agents
- Cross-session messaging: https://code.claude.com/docs/en/cross-session-messaging
- Worktrees: https://code.claude.com/docs/en/worktrees
- Workflows: https://code.claude.com/docs/en/workflows
- superpowers/subagent-driven-development: https://github.com/obra/superpowers/blob/main/skills/subagent-driven-development/SKILL.md
