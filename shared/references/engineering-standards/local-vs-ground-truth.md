# LTGT — Local Truth is not Ground Truth (doctrina)

## Purpose

Define how agents search and conclude truth in a multi-worktree monorepo. A
command run from one working directory (CWD) sees only the **local truth** of
that checkout. The **ground truth** is the whole repository: every worktree,
every branch, and the git object store. Treating local truth as ground truth
produces false negatives ("file does not exist") and wrong verdicts.

## Doctrine

1. **A CWD is a view, not the repo.** `git rev-parse --show-toplevel` returns
   the current worktree root, not the repository root. Each worktree checks out
   a different branch. A file can exist in HEAD, in another worktree, or in a
   branch that is not checked out anywhere.
2. **Ground truth = git + all worktrees.** The authoritative sources are:
   - `git rev-parse --git-common-dir` (the shared `.git` directory),
   - `git worktree list` (every checkout),
   - `git ls-files` (tracked files in HEAD),
   - refs (branches/tags reachable objects).
3. **Hidden paths are the default blind spot.** Worktrees live under `.agents/`
   or `.worktrees/` (dot-prefixed). glob/grep/search tools skip hidden entries
   by default. A search that does not pass `--hidden` does not see the
   worktrees — it cannot conclude absence.
4. **Search rule:** to find anything repo-wide, start from the common `.git`
   parent (the top-level) and search **all** worktrees **with hidden entries
   included**. Never conclude "does not exist" from a single CWD scan without
   `--hidden` and without checking `git ls-files` / `git worktree list`.

## Application

- When asked "does X exist?" or when checking a claim, enumerate first:
  `git worktree list` and `git rev-parse --git-common-dir`.
- Search uses `grep -r --hidden` / `find` over all worktree roots, or
  `git grep` (which reads tracked files independently of CWD).
- Never report absence or a `NOT VERIFIABLE` verdict from a non-hidden CWD-only
  scan. Report which search scope you used.

## Why

Observed failure: `/verify-evidence` appeared "missing" because it exists only
on the worktree branch, in a hidden `.agents/` path, while the search ran from
the main checkout without `--hidden`. The standard prevents that class of error.

## References

- **GGT** (gitflow/trunk), **WTD** (worktree discipline), **TFM** (formal
  verification — verdicts depend on the evidence scope), **MPH** (HITL).
- Search command reference: `git worktree list`, `git rev-parse --git-common-dir`,
  `git ls-files`, `git grep`.
