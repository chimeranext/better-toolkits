---
description: "Audit the machine-readable org policy (policies.yml) against the actual enforcement state in the current repo (linear-setup.json, rulesets, hooks). Startup-agnostic. Reports OK/GAP/no-enforced."
argument-hint: ""
priority: 75
---
# /audit-policies

Read and run [`shared/references/policies/audit-policies.sh`](../../../shared/references/policies/audit-policies.sh) (SSOT).

Compares the org policy (`policies.yml`) against reality:

1. `linear-setup.json` → `defaults.squashMerge` vs `merge.method`.
2. GitHub ruleset (best effort, via `gh api` + `GH_TOKEN`).
3. `no-squash` hook presence.

Exit 0 = no drift; exit 1 = at least one `GAP`.
