# Git merge policy (better-toolkits monorepo)

**Mandatory for this repository and for toolkit docs that describe merging PRs here.**

## Required

- **Merge method:** **merge commit** only (`gh pr merge <N> --merge`).
- Preserve branch commit history on `main` for audit and bisect.
- Prefer copying the PR title/body into the merge commit subject/body when merging by CLI.

## Forbidden

- **`gh pr merge --squash`** on feature/fix/docs PRs in this monorepo.
- **`gh pr merge --rebase`** unless a maintainer explicitly requests it for a one-off hotfix.

## Consumer repos

Startups using make-no-mistakes may set `linear-setup.json` → `defaults.squashMerge` in **their**
repos. That does **not** apply to **chimeranext/better-toolkits** itself.

## Agents and HITL

- `/implement` Phase 4 and `/merge-advisor` MUST surface **`--merge`**, never squash, when the
  target repo is **better-toolkits** (or when org policy says merge commit).
- Violating this policy is a protocol bug — fix the reference, not the PR history.

## GitHub repository settings (maintainers)

On the GitHub repo: disable **Allow squash merging** and **Allow rebase merging**; keep
**Allow merge commits** enabled. Re-run after org-level policy changes.
