---
name: merge-advisor
description: >
  Computes the ORDER in which a set of open PRs should be merged so that each one
  is still mergeable when its turn arrives, then ALWAYS asks HITL (AskUserQuestion
  or Cursor equivalent) whether to execute that plan — no --execute flag. Measures
  pairwise file collisions, latent conflicts, base-anchored artifacts, and CI
  queue capacity; re-measures after each merge. Use when the user asks "in what
  order do I merge these", "which PR goes first", "how do I avoid conflicts
  merging all of these", "will merging this break the others", or has a backlog
  of open PRs against one base. Do NOT trigger for: reviewing a single PR,
  checking whether one branch is behind (that is sync-advisor), or listing PR
  status (that is review-open-prs).
---

# merge-advisor

Read and follow [`skill-protocol.md`](../../references/merge-advisor/skill-protocol.md) (protocol SSOT). Frontmatter triggers unchanged.
