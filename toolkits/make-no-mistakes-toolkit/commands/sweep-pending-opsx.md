---
description: "Startup-agnostic OpenSpec pipeline command — read-only sweep of changes with incomplete /opsx-apply checklists; exit = human handoff of which change to run next. Never edits tasks/specs/changes (SSOT invariant)."
argument-hint: "[--json]"
priority: 74
---
# /opsx:sweep-pending-opsx

Read and follow [`references/sweep-pending-opsx/protocol.md`](../references/sweep-pending-opsx/protocol.md)
(protocol SSOT — English, anti-boilerplate, anti-hidden-redirects, no embedded secrets; adheres to OpenSpec OPSX).

Engine: `scripts/ci/sweep-pending-opsx.sh`.

The sweep **follows** `/sweep-unstaged` and **precedes** any `/opsx-apply` so the
agent chooses the next change with pending work that has already been verified
to have a green repo (unstaged/unpushed clean per the /sweep-unstaged gate).
