# Proposal — Machine-readable policies (policies.yml) + propagated enforcement

## Problem

Org/studio policy (e.g. **merge method = merge commit, squash forbidden**) currently
lives only as prose (`docs/git-merge-policy.md`, playbooks). Prose cannot be
enforced. As a result, 7 consumer repos still set `defaults.squashMerge: true` in
`linear-setup.json`, contradicting the policy, and there is no machine-readable
source of truth, no automatic propagation to each monorepo, and no audit that
detects drift between the policy and the actual enforcement state.

## Proposed change

Introduce a **machine-readable policy source of truth** and a **multi-layer
enforcement + drift audit**, modeled on Group Policies (central policy → propagated
to each "OU" = monorepo → audited):

1. **`shared/references/policies/policies.yml`** + **`policies.schema.json`** (JSON
   Schema) as the SSOT for org policies (merge method, linear history, etc.).
2. **Propagation by the GitHub App** via GitHub Actions: a `propagate-policies`
   workflow in the policy repo (better-toolkits) fires on `policies.yml` change and
   dispatches `repository_dispatch` to each consumer monorepo; each consumer runs an
   `apply-policies.sh` that materializes the policy into `linear-setup.json`,
   rulesets, and hooks.
3. **Startup-agnostic audit**: a `/audit-policies` builder (and a CI workflow) that
   reads the local `policies.yml` and compares it against the actual state
   (`linear-setup.json`, GitHub rulesets, installed hooks) to report drift.

## Out of scope

- Fixing the 7 repos' `squashMerge` values today (follow-up after infra lands).
- Granting app permissions (manual GitHub App permission config is documented, not
  automated).
- Non-merge policies (only the merge policy is formalized first).

## Constraints

- `policies.yml` is the single source of truth; prose docs reference it.
- The audit is startup-agnostic (works from Claude/OpenCode/Cursor).
- No secrets in `policies.yml`; enforcement reads env/`{env:}` only.
