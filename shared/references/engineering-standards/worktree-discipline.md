# WTD — Worktree Discipline (doctrine)

## Sigla

**WTD** — Worktree Discipline.

## Purpose

Reconcile two policies that look opposed but are complementary:
- **Parity** (1 issue = 1 worktree = 1 PR): every worktree exists because an issue and a PR exist. This is an *association* policy — it governs management/logical linkage.
- **Never commit worktrees**: worktree directories are transient, regenerable material. This is a *persistence* policy — it governs version control hygiene.

Both hold at once. Ignoring worktrees in `.gitignore` does NOT weaken parity: the parity lives in the branch + PR association, not in the working-tree directory. The directory is fully rebuildable via `git worktree add .agents/worktrees/<slug> -b <branch>`, so nothing unique is lost by ignoring it.

## Doctrine

### 1. Worktrees are transient, never committed
Worktree directories (`.agents/worktrees/`, `.worktrees/`, `.claude/worktrees/`) SHALL be gitignored in every repo. They are derived checkouts of branches; the branch is the source of truth. Committing them pollutes `git status` and can nest repos (a `.git` inside a tracked dir).

### 2. Parity is an association policy, not a persistence one
"1 issue = 1 worktree = 1 PR" SHALL be maintained as a management invariant: every worktree is created from an issue and feeds exactly one draft PR. This is orthogonal to gitignore. The association is recorded in the branch name and the PR — never inferred from the presence of the directory in git.

### 3. Rebuildability is the justification
A worktree is ignorable because it is rebuildable from its branch. If a worktree ever contains something NOT rebuildable from the branch (a local secret, an uncommitted artifact that must survive), that material must live elsewhere — never rely on the worktree directory being tracked.

### 4. Relationship to other standards
- **BrS** (branching strategy): WTD adds the physical worktree hygiene to BrS's branch/PR policy.
- **Draft PR discipline** (better.md / AGENTS.md): parity + always-open-draft-PR is fully compatible with WTD — the draft PR is the association anchor; the worktree is disposable.
- **CLG** (commit logic groups): each worktree ships its changes as one logical group to its PR.

## Consequence
- Every repo's `.gitignore` SHALL include the worktree dirs.
- `git status` in a repo with active worktrees SHALL show the repos, not a forest of untracked `.agents/`.
- The parity invariant is audited by checking branch→PR association, never by whether `.agents/` appears in git.
