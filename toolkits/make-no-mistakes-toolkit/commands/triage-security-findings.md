---
description: Triage security scan findings (pentest playbook + CI) into owned backlog items. Accepts scanner, phase, PR, or run as $ARGUMENTS. Backlog SSOT is the tracker issue body — no duplicate brief files.
argument-hint: "[list|dry-run|scanner|phase2|phase7|manual|pentest-report] [--pr N] [--run ID] [--repo org/repo]"
priority: 25
---
# /triage-security-findings

Read and follow [`references/triage-security-findings/protocol.md`](../references/triage-security-findings/protocol.md) (protocol SSOT). Behavior is unchanged — only structure moved for multi-harness reuse.

`$ARGUMENTS` are unchanged from the pre-split command.
