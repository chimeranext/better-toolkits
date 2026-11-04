---
description: Post-merge pipeline overview. It maps the operational flow from read-only gates through execution, verification, review, and closure. It references the commands that participate.
argument-hint: "[pipe-chart]"
priority: 70
---
# Post-merge operational pipeline — complete diagram

Sequential flow: read-only gates → execution → verification → review → closure.
This file is a visual reference block only.
The operational SSOT lives in `references/sweep-pending-opsx/protocol.md`.

```mermaid
flowchart TD
  start(["/goodmorning / inventory"])
  RU["/sweep-unstaged"]
  G1{CLEAN?}
  SP0["/sweep-pending-opsx --json"]
  G2{pending > 0?}
  APL["/opsx-apply <change-id>"]
  SP1["/sweep-pending-opsx (re-check)"]
  OS1["/opsx-sync (spec drift)" ]
  OL["/opsx-living <feature>"]
  RTRM["/ready-to-review-mergeable #N"]
  MA["/merge-advisor"]
  HITL1{HITL human?}
  MERGE["human merge"]
  AR["/opsx-archive (pending tasks x)"]
  PL["/pending-left"]
  DF["§5b /dogfood — RTRM gate"]
  EX(["/exit — session close"])
  EXP["/opsx-explore (new change)"]
  LDR["/linear-daily — morning briefing"]
  SUB["/subagents-opencode — subordinate delegation (subordinate-delegate.md + evidence)" ]

  start --> LDR
  LDR --> EXP
  EXP --> PROP0["/opsx-propose"]
  PROP0 --> SP0
  SP0 --> G2
  G2 -->|yes| APL
  G2 -->|no (clean + archive-ready)| AR
  G2 -->|spec_drift| OS1
  APL --> SP1
  SP1 --> OS1
  OS1 --> OL
  OL --> RTRM
  RTRM --> MA
  MA --> HITL1
  HITL1 -->|yes| MERGE
  HITL1 -->|adjust / pending| SP0
  MERGE --> AR
  MERGE --> PL
  AR --> PL
  PL --> DF
  DF --> EX
  SUB --> G1
```

## Parity invariants

**Parity invariant: 1 issue = 1 change = 1 worktree = 1 PR.**
The pipeline preserves a one-to-one mapping.
One issue maps to one change.
One change maps to one worktree.
One worktree maps to one PR.

## Index (post-split)

| Document | Content |
| --- | --- |
| [pipeline-overview.md](pipeline-overview.md) | This file: diagram, parity invariants, index |
| [pipeline-commands.md](pipeline-commands.md) | Command table with SSOT homes |
| [pipeline-rendering.md](pipeline-rendering.md) | How to render with Pele or Mintlify |
