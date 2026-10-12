---
description: Triage security scan findings (pentest playbook + CI) into owned backlog items. Accepts scanner, phase, PR, or run as $ARGUMENTS. Backlog SSOT is the tracker issue body — no duplicate brief files.
argument-hint: "[list|dry-run|scanner|phase2|phase7|manual|pentest-report] [--pr N] [--run ID] [--repo org/repo]"
priority: 25
---
# /triage-security-findings

PR-stage router: [`/assurance:triage`](triage.md) → [`references/security/triage.md`](../references/security/triage.md).

Read and follow [`references/security/protocol.md`](../references/security/protocol.md) (protocol SSOT). Migrated from make-no-mistakes-toolkit; behavior unchanged (cola → dueño → SLA → receipt, security-owned).

`$ARGUMENTS` are unchanged from the pre-move command.
