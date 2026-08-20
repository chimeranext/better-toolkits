---
name: sync-advisor
description: >
  Measures how far a checkout has drifted from its base ref and routes to the
  smallest sync that closes the gap — a plain pull, a single-branch rebase, or
  the team-wide /make-no-mistakes:rebase. Reports which governed files changed,
  so the answer is "you are missing these three hook fixes", not just "you are
  N commits behind". Read-only: it measures and recommends, it never syncs.
  Triggers on: "am I up to date", "is my branch behind", "how far behind am I",
  "do I need to pull", "is my checkout stale", "what changed on develop",
  "sync with develop", "sync with release", "post-release sync",
  "rebase all branches", "team rebase", "my worktrees are behind",
  "did I miss anything from develop".
  Does NOT trigger on: interactive rebase ("git rebase -i", "squash these
  commits"), cherry-pick, resolving a named merge conflict, or a request to
  actually perform the team sync (that is /make-no-mistakes:rebase itself).
---

# sync-advisor

Read and follow [`protocol.md`](../../references/sync-advisor/protocol.md) (protocol SSOT). Frontmatter triggers unchanged.
