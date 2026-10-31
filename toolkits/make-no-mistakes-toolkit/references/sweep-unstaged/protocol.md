# /sweep-unstaged — protocol SSOT

Harness-agnostic body. Thin entry: `commands/sweep-unstaged.md`.

---

# /sweep-unstaged — check ground truth of the worktree universe

A ground-truth sweep: every worktree of the repository must have **nothing**
uncommitted, **nothing** unpushed, and **nothing** excluded from a pull request
that is ready-to-review / mergeable. The command never merges, never pushes, and
never mutates — it audits and reports.

## Invariant

**Exit means:** the worktree set is clean. Each change has a commit and a push
to its branch. Each change sits in an open, non-draft, mergeable PR. Exit does
not mean approval, merge, or issue Done.

## Why

Local files, stashes, and unpushed commits are invisible to reviewers. A PR
becomes reviewable only after a full push. This command closes the loop that
`sync-advisor`/`worktree-cleanup` reason about per-branch. It audits the whole
worktree universe at once and flags the two failure modes that lose work
(uncommitted) or hide work (unpushed / PR-less).

## Inputs

| Flag | Meaning |
| --- | --- |
| `--json` | emit one JSON object per worktree (no prose) |

## Pipeline (always)

### 1. Enumerate worktrees

`git worktree list --porcelain` — this is the ground truth, not the CWD
(LTGT). The sweep covers every checkout: the main tree and every `.agents/
worktrees/*` / `.worktrees/*`.

### 2. Per worktree, measure three predicates

| Predicate | Measured by | Flags |
| --- | --- | --- |
| **uncommitted** | `git status --porcelain` non-empty (untracked included) | work with no other copy |
| **unpushed** | `git rev-list --count origin/<branch>..HEAD` > 0, or no origin/<branch> | work not on the remote |
| **PR coverage** | `gh pr list --head <branch>` open, non-draft, `mergeable=MERGEABLE` | work excluded from review |

### 3. Verdict

- **CLEAN** — all three predicates pass for every worktree. Exit 0.
- **DIRTY** — any worktree fails any predicate. Exit 1. The report names the
  failing predicates so the human (or a delegating agent) can act.

## What it does NOT do

- Does not commit, push, open PRs, merge, or rebase.
- Does not check `/opsx-sync` drift (that is a separate command — see Related).
- Does not treat a draft PR as coverage: a draft stays out of review.

## Reporting

Plain mode prints one block per worktree (branch, origin-branch, uncommitted,
unpushed, PR number/draft/mergeable, verdict) and a final SWEEP verdict.
`--json` prints one JSON object per worktree for machine consumption.

## Integration

- `/sweep-unstaged` **flags**. `/opsx-sync` **fixes** spec drift. When the
  sweep reports `unpushed` or missing PR coverage, the next step is to push and
  open/update the PR — then re-sweep.
- `worktree-cleanup` refuses worktrees with uncommitted/unpushed work. This
  sweep is the pre-flight check before any cleanup.

## Related

- **LTGT** — search/measure from the git common-dir across all worktrees, never
  a CWD-only view.
- `sync-advisor` — per-branch drift measurement (how far behind/diverged).
- `worktree-cleanup` — refuses uncommitted/unpushed worktrees.
- `/opsx-sync` — OpenSpec spec drift sync.
- **GGT / REL / MPH** — branch model, release cut, and HITL gates that the
  ready PR will pass through.
