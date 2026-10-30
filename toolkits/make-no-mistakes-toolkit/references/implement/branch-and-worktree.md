Every issue gets a fresh branch and worktree. No exceptions.

## Mandatory Rule: Always New Branch + Worktree

**Every issue gets a FRESH branch and its own worktree. No exceptions.**

- NEVER work in the main working tree for implementation. The main tree stays on `{baseBranch}`, clean.
- NEVER reuse an existing branch. Always create a new one, even if a previous attempt exists.
- If a branch with the same name already exists, delete it first: `git branch -D {branch-name}` (and its worktree if any).
- The branch type prefix (`feat/`, `fix/`, `chore/`, `test/`, `docs/`, `refactor/`) is determined from the Linear issue:
  1. Check issue labels: `Bug` → `fix/`, `Feature` → `feat/`, `Testing` → `test/`, `Infra` → `chore/`, `Documentation` → `docs/`
  2. Check issue title prefix: "Fix ..." → `fix/`, "Add ..." → `feat/`, etc.
  3. Default: `feat/` if no clear signal

**Branch naming**: `{type}/{issue-id}-{short-description}` (e.g., `feat/APP-1234-course-content-serializer`)

## Parity: 1 issue = 1 branch = 1 worktree = 1 PR

Each issue owns exactly one branch, one worktree, and one PR:

- **1 issue → 1 branch** — never share a branch between issues, never reuse a branch.
- **1 branch → 1 worktree** — the branch lives in its own worktree
  (`.agents/worktrees/<slug>`), never in the main tree.
- **1 branch → 1 PR** — exactly one open PR per branch/issue. Do not open a second
  PR for the same work.

## Push discipline (draft PR)

- **Always start by opening a draft PR** — the first commit goes to a draft PR
  (never accumulated locally in the dark).
- **Always push intermediate commits to the draft PR** — commits must be reflected in
  the PR as they are made so they can be audited externally. Never hold commits only
  locally.
- **Push to the PR's branch** (the branch that feeds the PR) — never to `main` /
  canonical. If the PR is Ready-to-Merge and a fix push is needed, run
  `/local-pr-review` before that push.

## Symlink build artifacts across worktrees (disk + rebuild)

Shared, regenerable build artifacts (`node_modules`, `dist/`, `build/`, `target/`,
`.cache/`) are **symlinked** to the main checkout so worktrees do not duplicate
them — saves disk and speeds up recompilation.

```bash
# after creating a worktree, link its node_modules to the main checkout
ln -s "$(git rev-parse --git-common-dir)/../../node_modules" <worktree>/node_modules
# or, concretely:
ln -s /path/to/main-checkout/node_modules .agents/worktrees/<slug>/node_modules
```

Rules:
- Symlink only **regenerable** artifacts (never source, never tracked files; git
  ignores these paths anyway).
- If the worktree needs a different dependency set (rare), break the symlink and
  run `npm ci` locally instead.
- The `disk-cleanup` stage 2 skips `node_modules` that are symlinks (by design).
