---
description: "PR-stage assurance hub — run per-pillar triage sub-protocols (testing, security, governance; liveness skip by default). PASS/BLOCKED before remote code review."
argument-hint: "[pr|testing|security|liveness|governance] [--pr N] [--issue TEAM-N]"
priority: 90
---
# /assurance:triage

Read and follow [`references/triage/protocol.md`](../references/triage/protocol.md) (protocol SSOT).

Default mode: **`pr`** — run all pillars configured for the PR stage.

Security backlog triage: sub-protocol delegates to
[`/assurance:triage-security-findings`](triage-security-findings.md) when CI
reports findings that need owned issues.

`$ARGUMENTS` pass through to sub-protocols and to `triage-security-findings` when invoked.
