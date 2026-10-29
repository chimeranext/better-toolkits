---
description: Set up the local (developer-machine) side of the assurance gate: git hooks (pre-push/pre-commit), shared hook adapters, and typecheck dependencies. Runs entirely on the developer machine; never touches GitHub settings. Idempotent.
priority: 32
---
# /assurance-local-setup

Read and follow [`references/assurance-local-setup/protocol.md`](../references/assurance-local-setup/protocol.md) (protocol SSOT).

`$ARGUMENTS` is the repo path to configure (default: current directory).

This command sets up only what belongs on the developer's machine: git hooks, hook
adapters and typecheck deps. It never modifies GitHub settings. For the repository/CI
side, use `/assurance-repo-setup`.
