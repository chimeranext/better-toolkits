# Design — Machine-readable policies + propagated enforcement

## Architecture (Group-Policies-style)

```
better-toolkits (policy repo)                 consumer monorepo (OU)
─────────────────────────────────             ───────────────────────────
policies.yml (SSOT, machine-readable)   ──►  policies.yml (copied)
policies.schema.json                          apply-policies.sh (materializes)
propagate-policies.sh ── dispatch ──►         audit (drift report)
rgithub/workflows/propagate-policies.yml        .github/workflows/apply-policies.yml
```

## 1. Policy SSOT (`shared/references/policies/`)

`policies.yml`:
```yaml
version: 1
merge:
  method: merge            # forbidden: squash, rebase
  linear_history: true
  enforced_by:
    - github-ruleset
    - no-squash-hook
    - audit-ci
```

`policies.schema.json` validates it (draft-07). The schema is the contract
`apply-policies.sh` and the audit use.

## 2. Propagation by the GitHub App (GitHub Actions)

**Policy repo workflow** — `.github/workflows/propagate-policies.yml`:
```yaml
on:
  push:
    paths: ["shared/references/policies/policies.yml"]
```
Job: checkout → run `propagate-policies.sh` → for each consumer repo, send
`repository_dispatch` with `event_type: policies-updated` and the policy payload.

**Consumer workflow** — `.github/workflows/apply-policies.yml` (added by the
setup to each monorepo):
```yaml
on:
  repository_dispatch:
    types: [policies-updated]
```
Job: checkout → run `apply-policies.sh` (reads the propagated `policies.yml`) →
if drift, commit + open a PR (`auto/policies`) and open the issue if blocked.

`apply-policies.sh` materializes:
- `linear-setup.json` → `defaults.squashMerge` = `false` (or per policy).
- GitHub ruleset (via `gh api` + app token): merge method `merge`,
  `required_linear_history`, `non_fast_forward`.
- Local hooks (no-squash, stderr) already installed by the setup.

## 3. Audit (startup-agnostic)

`/audit-policies` (a command in the toolkit) + CI job:
1. Load `policies.yml` local.
2. Read actual state: `linear-setup.json`, `gh api rulesets`, hooks presence.
3. Emit per-check `OK` / `GAP` / `no-enforced`.
4. Exit non-zero on any `GAP`.

## Permissions (documented, not automated)

The GitHub App must have (manual, in github.com):
- `contents: write`, `pull-requests: write` (for apply/PRs).
- `repository_administration: read` (to read/verify rulesets; the repo-level
  endpoint only needs this, not `admin:org`).

## Files to add

- `shared/references/policies/policies.yml`
- `shared/references/policies/policies.schema.json`
- `shared/references/policies/README.md`
- `shared/references/policies/propagate-policies.sh`
- `shared/references/policies/apply-policies.sh`
- `shared/references/policies/audit-policies.sh`
- `.github/workflows/propagate-policies.yml` (policy repo)
- `shared/bootstrap/scripts/setup-policies.sh` (installs `apply-policies.sh` +
  `apply-policies.yml` into consumer repos during `/toolkits-initial-setup`)
- `/audit-policies` command (references `audit-policies.sh`)
