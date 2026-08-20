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
