---
description: "Close the worktree ground-truth loop: nothing uncommitted, unpushed, or excluded from a ready-to-review/mergeable PR. Runs scripts/ci/sweep-unstaged.sh (measure + mandatory OpenSpec sync), then remediates DIRTY — commit+push sync output, push commits, gh pr ready on drafts, open PR if missing — and re-sweeps until CLEAN. Use before /opsx-sync handoff, before release cut, or to prove nothing left behind."
argument-hint: "[--json]"
priority: 80
---
# /sweep-unstaged

Read and follow [`references/sweep-unstaged/protocol.md`](../references/sweep-unstaged/protocol.md) (protocol SSOT).

1. Run `scripts/ci/sweep-unstaged.sh` (or `.ps1`) against `git worktree list`.
2. If the engine applied mandatory OpenSpec sync, **commit and push** those
   `openspec/specs/` mutations on the affected branch — they are the change that
   justified the sync.
3. Remediate remaining DIRTY predicates (uncommitted change work, unpushed,
   draft → `gh pr ready`, missing PR → open). Re-run the engine until CLEAN or
   an explicit human blocker.

Exit 0 = CLEAN. Exit 1 = DIRTY with named predicates or an uncleared blocker.
The script alone is not the command; the closed loop is.
