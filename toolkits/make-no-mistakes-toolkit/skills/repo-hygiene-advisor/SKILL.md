---
name: repo-hygiene-advisor
description: >
  Suggests merged-branch cleanup and delete_branch_on_merge policy when the user
  asks about stale branches, branch clutter, cleaning merged PR branches, or
  repo hygiene after many PRs. Triggers on: "clean branches", "delete merged
  branches", "branch hygiene", "stale branches", "too many branches",
  "delete_branch_on_merge", "prune branches". Does NOT trigger on: git rebase
  team sync (/rebase), Linear issue triage (/hygiene-hooks-setup), or generic
  git branch -d without merged-PR context.
---

# Repo Hygiene Advisor

The user wants **Git branch cleanup** or **merge policy** — not Linear create hooks or team release sync.

## What to recommend

1. **Audit first (always dry-run):**

   ```bash
   ./scripts/repo-hygiene.sh audit
   # or: npx @lapc506/make-no-mistakes repo-hygiene audit
   ```

2. **Enable auto-delete on merge** (prevents future clutter):

   ```bash
   ./scripts/repo-hygiene.sh policy --apply
   ```

3. **Remove stale remote heads** (merged PRs only):

   ```bash
   ./scripts/repo-hygiene.sh prune-remote --apply
   ```

4. **Local cleanup** (optional):

   ```bash
   ./scripts/repo-hygiene.sh prune-local --local-path <repo> --apply
   ```

## Scheduled / auditable runs

Point the user to:

- **Org-wide:** `make-no-mistakes-toolkit` workflow + `REPO_HYGIENE_GH_TOKEN`
- **Per-repo:** `examples/repo-hygiene-consumer-workflow.yml` reusable workflow

Logs land in GitHub Actions **Job summary** + artifact.

## Safety rules

- Never run `--apply` without explicit user OK
- Never delete `main`, `master`, `develop`, `devel`, `stage`
- Never delete open PR head branches
- `/rebase` is the right tool for post-release **team sync**, not bulk merged-branch audit

## Command

> Use `/make-no-mistakes:repo-hygiene` for the full protocol.
