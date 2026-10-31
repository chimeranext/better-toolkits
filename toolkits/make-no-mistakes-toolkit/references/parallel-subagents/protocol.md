# /parallel-subagents — protocol SSOT

Harness-agnostic orchestrator for parallel subagent-driven development. Inspired by
`superpowers/dispatching-parallel-agents`, Oakheart Lab (orchestrator pattern), and
Claude Code sub-agent best practices.

## Harness detection

```bash
if [ -n "$OPENCODE_..." ] || [ -d "$HOME/.config/opencode" ]; then
    harness=opencode
elif [ -d "$HOME/.claude" ] || command -v claude; then
    harness=claude
else
    harness=opencode   # default; override via $ARGUMENTS
fi
```

- **OpenCode** → `subagents-opencode` (herdr: TUI workers in separate processes).
- **Claude Code** → `subagents-claude` (`.claude/agents`, `ListAgents`/`SendMessage`,
  `--worktree`).

## Pattern (coordinator)

1. **Dependency graph** — before dispatching anything, build the graph. Tasks that
   touch distinct files with no shared state → may run in the same wave. Tasks that
   share files/state → sequential waves with a commit between waves.
2. **Isolation** — one worktree per task:
   `git worktree add .agents/worktrees/<slug> -b <branch> <base>`.
   Block broad staging (`git add -A` / `git add .`) via hook. Commit the baseline
   before dispatch. Prefer **new files** over shared edits.
3. **Parallel dispatch + background** — each independent task is dispatched with
   **background** execution (the coordinator does not block waiting) and an isolated
   context. Prompts are self-contained: scope, file references, constraints, success
   criteria, expected output.
4. **Wave gate** — between waves, run tests; do not advance until green.
5. **Review gate** — after each implementation, a reviewer (spec + diff) checks; if
   there are gaps, a fresh fix agent (completed agents cannot receive messages) applies
   them. Mark complete only after review passes.
6. **Human finishing** — when all verified tasks are done, present the integration
   decision via **`/resolve-open-questions`** (an ask batch with options — merge
   locally / push + PR / keep as-is — plus a recommendation). **Never auto-merge**; the
   decision belongs to the human.

## Key rules

- **Parallel only for independent tasks.** Verify distinct files and no shared state
  before parallelizing.
- **Background** ≠ fire-and-forget without review: the task still passes through the
  review gate and wave gate; only the *coordinator's wait* is non-blocking.
- The coordinator keeps its context for coordination; artifacts are passed as files,
  not pasted into prompts.
- One implementer per task; the implementer does not dispatch subagents.
- The coordinator does not auto-merge; integration is a human decision.

## Wave gate (detail)

Between waves: run the test suite. If it fails, do not advance until green. The commit
between waves ensures the next wave reads the latest state (no stale state).

## Review gate (detail)

```
Implementer → commits → reports done
Reviewer → reads spec + diff → gap report
Fix Agent (if gaps) → receives gap report → patches and recommits
Coordinator → mark complete only after review OK
```

## Stop conditions

Stop and report (do not improvise) when:

- two tasks need overlapping edits that cannot be safely sequenced.
- a worker rejects model/auth/directory.
- a wave does not pass the test gate after a reasonable cap of fix rounds.
- an irreversible operation is required without human approval.

## Formal model (why, in plain language)

This protocol is accompanied by a formal model of the orchestrator (TLA+,
verified with TLC). You do **not** need to read TLA+ to use `/parallel-subagents`.
The model exists to make explicit which risks the orchestrator guards against —
especially the **semantic overlap** between parallel tasks, which Git and tests
cannot see. See [`formal-model.md`](formal-model.md) for the plain-language
explanation (textual vs semantic conflicts, what each invariant means, and when
the model is worth it vs. overkill).

## References

- superpowers/dispatching-parallel-agents: https://github.com/obra/superpowers/blob/main/skills/dispatching-parallel-agents/SKILL.md
- superpowers/using-git-worktrees: https://github.com/obra/superpowers/blob/main/skills/using-git-worktrees/SKILL.md
- superpowers/finishing-a-development-branch: https://github.com/obra/superpowers/blob/main/skills/finishing-a-development-branch/SKILL.md
- Oakheart Lab — subagent-driven development: https://blog.oakheartlab.com/p/subagent-driven-development-how-to
- Claude Code sub-agent best practices: https://claudefa.st/blog/guide/agents/sub-agent-best-practices
- Per-harness capabilities: [`subagents-harness-capabilities.md`](../subagents-harness-capabilities.md)
