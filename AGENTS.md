# Agent guidance — better-toolkits

Repo-level instructions for Cursor, Claude Code, and other agents working in this
repository. Prefer this file over inventing workspace layouts under the parent
`chimeranext/` folder (that folder is **not** a git root).

Related: [`docs/hitl.md`](docs/hitl.md) (ask-and-wait before shared-state
mutations), [`docs/multi-harness-ssot.md`](docs/multi-harness-ssot.md).

## Git worktrees (mandatory when parallel)

When more than one branch/PR is active, or the primary checkout is dirty, use an
isolated worktree — never ad-hoc sibling folders under `../chimeranext/`.

**Canonical paths (inside this repo):**

| Harness | Path |
| --- | --- |
| Cursor / generic agents | `.agents/worktrees/<slug>` |
| Claude Code / `/make-no-mistakes:implement` | `.claude/worktrees/<issue-id>` |
| Manual fallback | `.worktrees/<slug>` |

**Create:**

```bash
mkdir -p .agents/worktrees
git worktree add .agents/worktrees/<slug> -b <branch> <base-ref>
cd .agents/worktrees/<slug>
```

**Rules:**

- One worktree per issue/agent; do not `git switch` the primary tree to steal a branch.
- Slug = short kebab case (`feat-og-preview-images`, `APP-1234-widget`).
- Every mutation: `cd` to the worktree path first (see MNM `feedback_cd_between_worktrees`).
- Remove worktrees after merge (HITL) — `git worktree remove .agents/worktrees/<slug>`.

**Forbidden:** `../better-toolkits-og`, `../better-toolkits-fcto`, or any flat sibling
directory under `chimeranext/` — those are accidental, not convention.
