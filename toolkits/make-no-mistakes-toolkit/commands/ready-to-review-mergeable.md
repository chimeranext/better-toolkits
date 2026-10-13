---
description: "Issue ID required — implement through Phase 3.12 (skip 9–10), assurance:triage pr, execute remote review until gate green, local review only if remote unavailable, human handoff. Never merges."
argument-hint: "<ISSUE-123 [ISSUE-456 ...]> [--confidence 4.0] [overrides]"
priority: 85
---
# /ready-to-review-mergeable

Read and follow [`references/ready-to-review-mergeable/protocol.md`](../references/ready-to-review-mergeable/protocol.md) (protocol SSOT). Use the **Normative order** and **§3a–3c** sections — remote review is **executed** (§3b) and **gated** (§3c) before §5, not optional when bots are available.

`$ARGUMENTS` must include at least one tracker issue ID. No branch-only mode.
