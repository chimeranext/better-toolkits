---
description: "Emergency disk reclamation — deterministic, always runs stages 1-3 in order (docker images, worktree node_modules, worktrees via classifier) without prompting; docker volumes listed but never deleted. Reports measured before/after, never predictions. Optional target GB as $ARGUMENTS."
priority: 80
---

# /disk-cleanup

Read and follow [`references/disk-cleanup/protocol.md`](../references/disk-cleanup/protocol.md) (protocol SSOT).

`$ARGUMENTS` unchanged from the upstream protocol (optional target GB).
