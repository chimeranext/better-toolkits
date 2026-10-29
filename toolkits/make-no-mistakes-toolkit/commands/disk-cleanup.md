---
description: "Emergency disk reclamation — deterministic, applies stages 1-4 by default (docker images, worktree node_modules, worktrees via classifier, reconstructible docker volumes) without prompting; --list-only previews. Reports measured before/after, never predictions. Optional target GB as $ARGUMENTS."
priority: 80
---

# /disk-cleanup

Read and follow [`references/disk-cleanup/protocol.md`](../references/disk-cleanup/protocol.md) (protocol SSOT).

`$ARGUMENTS` unchanged from the upstream protocol (optional target GB).
