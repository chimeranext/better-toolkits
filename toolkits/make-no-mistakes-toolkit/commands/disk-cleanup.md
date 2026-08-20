---
description: Reclaim disk space in ascending order of risk — docker images first, then worktree node_modules and worktrees via the worktree classifier, with docker volumes listed but never deleted. Reports what was actually freed, measured before/after, never what a tool predicted. Accepts an optional target in GB as $ARGUMENTS.
priority: 80
---

# /disk-cleanup

Read and follow [`references/disk-cleanup/protocol.md`](../references/disk-cleanup/protocol.md) (protocol SSOT).

`$ARGUMENTS` unchanged from the upstream protocol (optional target GB).
