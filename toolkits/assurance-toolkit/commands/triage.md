---
description: "PR-stage assurance hub — run per-pillar triage sub-protocols (testing, security, governance; liveness skip by default). PASS/BLOCKED before remote code review."
argument-hint: "[pr|testing|security|liveness|governance] [list|dry-run|scanner|phase2|phase7|manual|pentest-report] [--pr N] [--issue TEAM-N] [--run ID] [--repo org/repo]"
priority: 90
---
# /assurance:triage

Read and follow [`references/triage/protocol.md`](../references/triage/protocol.md) (protocol SSOT).

Default mode: **`pr`** — run all pillars configured for the PR stage. That aggregate
implements the **PR row** in
[`assurance-governance` spec](https://github.com/chimeranext/better-toolkits/blob/main/openspec/changes/add-assurance-toolkit/specs/toolkit/assurance-governance/spec.md)
(tests 100%, security criticals 0, `coverage_delta` ≥ 0 + receipt) via testing →
security → governance pillars. Single-pillar modes are deep dives only.

Mode **`security`** is the findings triage (queue → owner → SLA → receipt).
Follow [`references/security/findings-protocol.md`](../references/security/findings-protocol.md).
Same `$ARGUMENTS` as before (`list`, `dry-run`, scanner, `phase2`, `phase7`,
`manual`, `pentest-report`, `--pr`, `--run`, `--repo`). No separate command.

`$ARGUMENTS` pass through to the selected sub-protocol.
