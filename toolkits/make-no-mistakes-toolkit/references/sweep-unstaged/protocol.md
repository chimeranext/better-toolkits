# /sweep-unstaged — protocol SSOT

Harness-agnostic body. Thin entry: `commands/sweep-unstaged.md`.

---

# /sweep-unstaged — close the ground-truth loop

A ground-truth sweep over every worktree of the repository. The CLEAN invariant
is: **nothing** uncommitted, **nothing** unpushed, and **nothing** excluded from
an open, non-draft, mergeable PR. OpenSpec delta-drift is a fourth failure mode:
when detected, the sweep **must** sync, and those sync mutations **must** land
on the branch (commit + push) because they are the change that justified the
sync. Leaving synced specs uncommitted is a protocol bug, not a deferred chore.

## Roles (script vs command)

| Layer | Artifact | Duty |
| --- | --- | --- |
| **Engine (script)** | `scripts/ci/sweep-unstaged.sh` / `.ps1` | Enumerate worktrees, measure predicates, run mandatory OpenSpec sync via `opsx-sync-apply`. Reports CLEAN/DIRTY. Does not invent commit messages or call `gh`. |
| **Command (agent)** | this protocol via `commands/sweep-unstaged.md` | Run the engine, then **remediate** every DIRTY predicate that the CLEAN invariant requires — including commit + push of sync output and undrafting an open draft PR on the branch. Re-run the engine until CLEAN or until a human blocker remains (e.g. merge conflicts). |

The script is the sensor + sync applicator. The slash command is the closed loop.
An agent that runs only the script and stops on DIRTY after a successful sync
has not executed `/sweep-unstaged`.

## Invariant

**Exit CLEAN means:** every worktree is committed, pushed, and covered by an
open, non-draft, mergeable PR; and OpenSpec main specs match deltas (no drift).
It does not mean approval, merge, or issue Done.

**Sync implication:** mandatory sync rewrites `openspec/specs/`. Those files
belong to the active change on that worktree. They must be committed on that
branch and pushed to the PR that covers it. Sync without commit/push violates
this invariant in the same breath it claims to enforce it.

## Why

Local files, stashes, and unpushed commits are invisible to reviewers. A PR
becomes reviewable only after a full push of the work that the branch claims.
OpenSpec drift is worse when "fixed" in the working tree but never shipped: the
next agent sees DIRTY `uncommitted` and may stash or discard the only copy of
the synced specs. Draft PRs hide the same work from review queues; CLEAN
therefore requires non-draft coverage, so undraft is part of closing the loop
when an open draft already exists for the branch.

## Implementations

Only two engine artifacts exist. Both are thin wrappers over the same shared
sync engine.

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
| `--json` | engine emits one JSON object per worktree (no prose) |

## Pipeline (always)

### 1. Enumerate worktrees

`git worktree list --porcelain` — this is the ground truth, not the CWD
(LTGT). The sweep covers every checkout: the main tree and every `.agents/
worktrees/*` / `.worktrees/*`.

### 2. Per worktree, measure four predicates

| Predicate | Measured by | Flags |
| --- | --- | --- |
| **uncommitted** | `git status --porcelain` non-empty (untracked included) | work with no other copy |
| **unpushed** | `git rev-list --count origin/<branch>..HEAD` > 0, or no origin/<branch> | work not on the remote |
| **PR coverage** | `gh pr list --head <branch>` open, non-draft, `mergeable=MERGEABLE` | work excluded from review |
| **OpenSpec drift** | for each `<change>/specs/**/spec.md`, the equivalent main spec must exist and match (`cmp`) | delta not reflected in main specs |

### 3. Engine verdict + mandatory sync

- **CLEAN** — all predicates pass for every worktree, no drift. Engine exit 0.
- **DIRTY** — any worktree fails any predicate. Engine exit 1. The report names
  the failing predicates.
- **Mandatory sync** — if drift was detected in any worktree, the engine runs
  `opsx-sync-apply.sh --root <wt>` for every drifted worktree before printing
  its final verdict. Engine failure stops the sweep with exit 1. After a
  successful sync, `openspec/specs/` is mutated → the worktree is now
  **uncommitted** until the command layer remediates.

### 4. Command-layer remediation (required when DIRTY)

For each DIRTY worktree, the agent closes the predicates in this order:

1. **OpenSpec sync output (and only that, when the dirt is sync-caused)** —
   `git add` the synced `openspec/specs/` paths the engine wrote, commit under
   **CvC** (`shared/references/engineering-standards/conventional-commits.md`)
   like any other intermediate commit, then `git push` to `origin/<branch>`.
   Do not fold unrelated dirty files into that commit; park or leave them and
   report them as a separate DIRTY cause. Typical subject when the commit is
   only the mandatory sync:

   ```
   chore(openspec): sync main specs from change deltas
   ```

   Choose another allowed CvC `type(scope)` only when the synced paths are not
   accurately a chore (e.g. the change itself is `docs` and the sync is that
   docs landing). Never invent a non-CvC subject for “sweep specialness.”
2. **Other uncommitted work that belongs to the branch's change** — commit +
   push under normal commit rules for that repo. Do not invent scope.
3. **Unpushed commits** — `git push -u` as needed so `origin/<branch>` contains
   HEAD.
4. **Draft PR on this branch** — if an open PR exists and `isDraft=true`, run
   `gh pr ready <n>` (with the repo's worktree-gate env if the harness requires
   it). Draft is not coverage.
5. **Missing PR** — open a PR for the branch (draft only if the human asked for
   draft; otherwise ready-to-review). Opening is remediation for `pr=?`, not an
   optional follow-up.
6. **Re-run the engine** — until CLEAN, or until a blocker the agent cannot
   clear remains (mergeable conflicts, missing auth, hooks rejecting the
   commit). Report blockers explicitly; do not claim CLEAN.

## What the engine does NOT do

- Does not commit, push, undraft, open PRs, merge, or rebase (those are the
  **command** layer above).
- Does not treat a draft PR as coverage.
- Does not mark issues Done or approve reviews.

## What the command MUST do

- Run the engine.
- After mandatory sync: commit + push the synced main specs on that worktree's
  branch before finishing.
- Clear `uncommitted` / `unpushed` / draft / missing-PR predicates per §4.
- Re-sweep until CLEAN or an explicit human blocker.

## Reporting

Plain mode prints one block per worktree (branch, origin-branch, uncommitted,
unpushed, PR number/draft/mergeable, openspec drift detail, verdict) and a final
SWEEP verdict. `--json` prints one JSON object per worktree for machine
consumption. Stderr is never discarded; a combined log is the expected capture.
When the command remediates, it logs each commit/push/`gh pr ready` so the
human can see what closed the loop.

## Integration

- `/sweep-unstaged` **measures, syncs, and closes the ship loop** for the
  predicates it defines. `/opsx-sync` remains the on-demand sync entry; when
  the sweep runs sync, it still owns the subsequent commit + push.
- `worktree-cleanup` refuses worktrees with uncommitted/unpushed work. This
  sweep is the pre-flight that must reach CLEAN before cleanup.
- A successful sync leaves `openspec/specs/` updated; those files are part of
  the change and must appear on the remote branch / PR.

## Related

- **LTGT** — search/measure from the git common-dir across all worktrees, never
  a CWD-only view.
- **StS** — stderr is preserved; never send a stream to null.
- `sync-advisor` — per-branch drift measurement (how far behind/diverged).
- `worktree-cleanup` — refuses uncommitted/unpushed worktrees.
- `/opsx-sync` — OpenSpec spec drift sync (same engine); does not replace the
  sweep's commit+push duty after mandatory sync.
- **GGT / REL / MPH** — branch model, release cut, and HITL gates that the
  ready PR will pass through.
