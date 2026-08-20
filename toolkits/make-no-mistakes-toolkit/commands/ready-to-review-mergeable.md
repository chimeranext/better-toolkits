---
description: "Drive issues to bot-approved, mergeable PRs (confidence-gated reviewer loop) — or, with no issue IDs, leave the current branch PR-ready. Never merges."
argument-hint: "<ISSUE-123 [ISSUE-456 ...]> [--confidence 4.0] | [overrides / upstream PR URLs]"
priority: 85
---
# /ready-to-review-mergeable

Read and follow [`references/ready-to-review-mergeable/protocol.md`](../references/ready-to-review-mergeable/protocol.md) (protocol SSOT). Behavior is unchanged — only structure moved for multi-harness reuse.

`$ARGUMENTS` are unchanged from the pre-split command.
