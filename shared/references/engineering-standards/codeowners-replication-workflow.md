# CODEOWNERS replication — org admin App workflow

Implements MPH point 8: the `CODEOWNERS` policy is a canonical SSOT in the
governance repo and is replicated to every target repository by an organization
GitHub App. Startup-agnostic; the concrete App slug and repo names below are
illustrative placeholders (`acme-studio`), not a real org.

## Architecture

```
acme-studio/org-gate
  └─ .github/CODEOWNERS          ← SSOT canónico (template: `* @{{ORG}}/founders`)
        │
        ▼  acme-studio-org-admin-tool (App: contents:write, administration:write)
        ├─ acme-studio/better-toolkits/.github/CODEOWNERS   (mirror)
        ├─ acme-studio/<client-monorepo>/.github/CODEOWNERS  (mirror)
        └─ ... (all org repos)
```

## Step 1 — Source (read SSOT)

Read `.github/CODEOWNERS` from the governance repo. It uses `{{ORG}}` as a
template token for the organization name, so one canonical file resolves for
every target org (the studio org and each client org).

```
* @{{ORG}}/founders
```

## Step 2 — Validation (fail-closed)

Before writing to any repo:

- Resolve `{{ORG}}` → the target organization name.
- Verify the team exists: `gh api /orgs/{org}/teams/founders`.
- If the team is missing → **abort**, report, do NOT write a broken file.

## Step 3 — Push (target classification)

For each target repository:

| Default branch protection | Action |
|---|---|
| Unprotected | Direct commit via App (`contents: write`) |
| Review-gated (ruleset) | Open a PR (same contents scope); do NOT bypass the ruleset |

The App always respects the target repo's own gate. It never uses admin write to
bypass a review requirement.

## Step 4 — Drift (write only on change)

Compare the target's current `CODEOWNERS` against the derived content. Write only
when they differ. No empty commits, no churn.

## Logging / audit

Every write (direct or PR) records: source SHA, target repo, branch, actor (the
App), timestamp. This satisfies MPH doctrine point 5 (audit trail).

## Idempotence

Running the workflow repeatedly converges: a repo with the correct mirror is
skipped (drift = none), so re-runs are no-ops.

## Related

- MPH doctrine points 7 and 8 (`main-protections-hitl.md`).
- `sync-*-from-shared.sh` — the same "shared → vendored mirrors" pattern at the
  toolkit level; this workflow generalizes it to org-wide policy files.
