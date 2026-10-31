# GGT — GitFlow + Trunk-based (doctrina)

## Purpose

Standardize a hybrid model: GitFlow with a long-lived `develop`, plus trunk-based
quality on `main`. Every repo SHALL be auditable against this setup.

## Model

- `develop` — long-lived integration branch; features come from `develop`.
- `main` — production/trunk; only releases land here via merge commit.
- Feature branches: created from `develop`, integrate back to `develop` by
  **rebase** (linear history in `develop`).
- `develop` → `main` (release): **merge commit** (first-parent traceability).

## Repo invariants

1. Default branch is `develop` (integration); `main` exists as the protected
   trunk (configurable; audit flag `--require-develop` asserts `develop` too).
2. `allow_squash_merge: false` (NSQ) and `allow_merge_commit: true`,
   `allow_rebase_merge: true`.
3. Ruleset on `main` (`main-founders-only`): `allowed_merge_methods = ["merge"]`,
   no `required_linear_history`.
4. Ruleset on `develop` when present: no method restriction; PRDS/status checks
   apply.
5. Tooling: rebase is the convention for feature→`develop`; merge commit for
   `develop`→`main`.

## Why `develop` is the default

Feature PRs land on `develop` (rebase). Setting `develop` as the default branch
makes the un-flagged `--base` resolve to `develop` deterministically — no
operator must remember to pass `--base develop`. TLA+ model:
`scripts/tla/branch-default/BranchDefault.tla` (TLC: default=`develop` PASS.
Default=`main` yields a Safety counterexample).

## Audit

`scripts/ci/audit-repo-gitflow.sh --repo <owner/repo> [--require-develop]`
checks invariants 1–4 and reports PASS/FAIL per item.

## Awareness

- `/ready-to-review-mergeable` and `/merge-advisor` SHALL use the branch model to
  select/expect the merge method (merge on `main`, rebase into `develop`).
- `/toolkits-initial-setup` SHALL run a **repo-initial-setup** step that
  provisions this model and runs the audit (split from harness-initial-setup).

## References

- **BrS** branching strategy; **MPH** main protections; **NSQ** no-squash.
