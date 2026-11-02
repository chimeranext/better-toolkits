---
name: worktree-cleanup
description: >
  Reclaims disk from git worktrees — and refuses every one that still holds
  work. Runs a deterministic classifier that measures uncommitted changes,
  unpushed commits, lock state and three independent kinds of merge evidence
  (ancestry, patch-equivalence, and a merged PR, which is the one that survives
  a squash merge). Dry-run by default; deleting takes an explicit flag.
  Triggers on: "my worktrees are eating disk", "clean up merged worktrees",
  "delete old worktrees", "reclaim node_modules", "how much space are my
  worktrees using", "prune worktrees", "which worktrees can I delete",
  "disk is full and I have 40 worktrees".
  Does NOT trigger on: creating a worktree, `git worktree add`, moving work
  between worktrees, or a request to delete a specific BRANCH (deleting refs is
  not what this does — it removes directories and leaves every ref alone).
---

# worktree-cleanup

Read and follow [`protocol.md`](../../references/worktree-cleanup/protocol.md) (protocol SSOT). Frontmatter triggers unchanged.

Claude Code slash path for the docker-inclusive reclaim: `/make-no-mistakes:disk-cleanup` (delegates stages 2–3 to this classifier).
