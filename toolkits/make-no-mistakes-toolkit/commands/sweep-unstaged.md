---
description: "Validate ground truth: nothing uncommitted, unpushed, or excluded from a ready-to-review/mergeable PR across every worktree. Reads git worktree list (all checkouts), flags uncommitted/unpushed/PR-less work, never mutates. Use to prove 'nothing left behind' before a draft PR push, before /opsx-sync, or before a release cut."
argument-hint: "[--json]"
priority: 80
---
# /sweep-unstaged

Read and follow [`references/sweep-unstaged/protocol.md`](../references/sweep-unstaged/protocol.md) (protocol SSOT). The command runs `scripts/ci/sweep-unstaged.sh` against the repository ground truth (`git worktree list`). Exit 0 = CLEAN. Exit 1 = DIRTY (report names the failing predicates).
