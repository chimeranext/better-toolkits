---
description: Triage security scan findings (pentest playbook + CI) into owned backlog items. Accepts scanner, phase, PR, or run as $ARGUMENTS. Backlog SSOT is the tracker issue body — no duplicate brief files.
argument-hint: "[list|dry-run|scanner|phase2|phase7|manual|pentest-report] [--pr N] [--run ID] [--repo org/repo]"
priority: 25
---
# /triage-security-findings — MOVED (shim)

> **DEPRECATION WARNING:** this command moved to `/assurance:triage-security-findings`
> (assurance-toolkit, transversal security). This file is a thin shim and will be removed
> in a future minor. Behavior is unchanged (cola → dueño → SLA → receipt, security-owned) — follow the new SSOT:
> [`references/security/protocol.md`](../../assurance-toolkit/references/security/protocol.md).
