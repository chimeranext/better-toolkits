# /sweep-unstaged — protocol SSOT

Harness-agnostic body. Thin entry: `commands/sweep-unstaged.md`.

---

# /sweep-unstaged — check ground truth of the worktree universe

A ground-truth sweep: every worktree of the repository must have **nothing**
uncommitted, **nothing** unpushed, and **nothing** excluded from a pull request
that is ready-to-review / mergeable. The command never merges, never pushes, and
never opens PRs. It audits, reports, and when OpenSpec delta-drift is detected it
applies the **mandatory sync** through the shared engine
`scripts/ci/opsx-sync-apply.sh` / `opsx-sync-apply.ps1` (never leaves drift
behind).

## Invariant

**Exit means:** the worktree set is clean. Each change has a commit and a push
to its branch. Each change sits in an open, non-draft, mergeable PR. Exit does
not mean approval, merge, or issue Done. A second duty is unconditional: when
delta-drift exists, the sweep syncs it into main specs before it reports.

## Why

Local files, stashes, and unpushed commits are invisible to reviewers. A PR
becomes reviewable only after a full push. This command closes the loop that
`sync-advisor`/`worktree-cleanup` reason about per-branch. It audits the whole
worktree universe at once and flags the two failure modes that lose work
(uncommitted) or hide work (unpushed / PR-less). OpenSpec drift is a third mode:
delta specs not reflected in main specs break the spec store's single source of
truth, so the sweep resolves it automatically.

## Implementations

Only two artifacts exist. Both are thin wrappers over the same shared engine.

| Harness | Path |
| --- | --- |
| bash / POSIX | `scripts/ci/sweep-unstaged.sh` |
| Windows PowerShell | `scripts/ci/sweep-unstaged.ps1` |

Shared engine (syncing delta specs into main specs):

| Harness | Path |
| --- | --- |
| bash / POSIX | `scripts/ci/opsx-sync-apply.sh` |
| Windows PowerShell | `scripts/ci/opsx-sync-apply.ps1` |

The engine is also the backend of `/opsx-sync`. A change to the engine must keep
both pairs in parity (same flags, same verdicts, same stderr discipline).

## Inputs

| Flag | Meaning |
| --- | --- |
| `--json` | emit one JSON object per worktree (no prose) |

## Pipeline (always)

### 1. Enumerate worktrees

`git worktree list --porcelain` — this is the ground truth, not the CWD
(LTGT). The sweep covers every checkout: the main tree and every `.agents/
worktrees/*` / `.worktrees/*`.

### 2. Per worktree, measure three predicates + drift

| Predicate | Measured by | Flags |
| --- | --- | --- |
| **uncommitted** | `git status --porcelain` non-empty (untracked included) | work with no other copy |
| **unpushed** | `git rev-list --count origin/<branch>..HEAD` > 0, or no origin/<branch> | work not on the remote |
| **PR coverage** | `gh pr list --head <branch>` open, non-draft, `mergeable=MERGEABLE` | work excluded from review |
| **OpenSpec drift** | for each `<change>/specs/**/spec.md`, the equivalent main spec must exist and match (`cmp`) | delta not reflected in main specs |

### 3. Verdict + mandatory sync

- **CLEAN** — all predicates pass for every worktree, no drift. Exit 0.
- **DIRTY** — any worktree fails any predicate. Exit 1. The report names the
  failing predicates so the human (or a delegating agent) can act.
- **Mandatory sync** — if drift was detected in any worktree, the sweep runs the
  shared engine (`opsx-sync-apply.sh --root <wt>`) for every drifted worktree
  before printing its final verdict. Engine failure stops the sweep with exit 1.

## What it does NOT do

- Does not commit, push, open PRs, merge, or rebase.
- Does not treat a draft PR as coverage: a draft stays out of review.
- Pushing a branch or opening a PR is the human's (or a delegating agent's) next
  step after the sweep flags `unpushed` / missing coverage — never the sweep's.

## Reporting

Plain mode prints one block per worktree (branch, origin-branch, uncommitted,
unpushed, PR number/draft/mergeable, openspec drift detail, verdict) and a final
SWEEP verdict. `--json` prints one JSON object per worktree for machine
consumption. Stderr is never discarded; a combined log is the expected capture.

## Integration

- `/sweep-unstaged` **flags and syncs**. `/opsx-sync` **fixes** spec drift on
  demand. When the sweep reports `unpushed` or missing PR coverage, the next
  step is to push and open/update the PR — then re-sweep.
- `worktree-cleanup` refuses worktrees with uncommitted/unpushed work. This
  sweep is the pre-flight check before any cleanup.
- A drift-free sweep leaves `openspec/specs/` with new/updated main specs; those
  files belong to the change and are committed as part of it.

## Related

- **LTGT** — search/measure from the git common-dir across all worktrees, never
  a CWD-only view.
- **StS** — stderr is preserved; never send a stream to null.
- `sync-advisor` — per-branch drift measurement (how far behind/diverged).
- `worktree-cleanup` — refuses uncommitted/unpushed worktrees.
- `/opsx-sync` — OpenSpec spec drift sync (same engine).
- **GGT / REL / MPH** — branch model, release cut, and HITL gates that the
  ready PR will pass through.
