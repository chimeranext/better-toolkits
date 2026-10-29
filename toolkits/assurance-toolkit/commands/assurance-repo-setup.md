---
description: Generate and ensure the repository-side assurance gate: .mega-linter.yml, CI workflows, shared tsconfig base, and (if permitted) the ruleset required_status_checks plus the internal-audits evidence repo. Requires admin on the remote to enforce; otherwise reports no-enforced/GAP. Idempotent. Accepts a repo path as $ARGUMENTS.
priority: 30
---
# /assurance-repo-setup

Read and follow [`references/assurance-repo-setup/protocol.md`](../references/assurance-repo-setup/protocol.md) (protocol SSOT).

`$ARGUMENTS` is the repo path to configure (default: current directory).

This command generates the gate templates and ensures the ruleset required status check
and the evidence repo. It does not run the linters (that is CI) and it does not touch
the developer machine. For local-only setup, use `/assurance-local-setup`.
