---
description: Post-merge pipeline overview. It maps the operational flow from read-only gates through execution, verification, review, and closure. It references the commands that participate.
argument-hint: "[pipe-chart]"
priority: 70
---

# Post-merge operational pipeline — complete diagram

Sequential flow: read-only gates → execution → verification → review → closure.
This file is a visual reference block only.
The operational SSOT lives in `references/sweep-pending-opsx/protocol.md`.
It also lives in `docs/multi-harness-ssot.md`.

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

## Position of the additional commands

The table lists commands and their SSOT homes.

| Command | New this round? | Existing SSOT? | Status |
| --- | --- | --- | --- |
| `/goodmorning` | no (already exists) | `commands/goodmorning.md` | referenced in flow |
| `/sweep-unstaged` | no | `commands/sweep-unstaged.md` + `references/sweep-unstaged/protocol.md` + `docs/how-to/engineering-standards/SWEEP.md` | referenced in flow |
| `/sweep-pending-opsx` | **yes** (engine + thin entry + protocol) | `commands/sweep-pending-opsx.md`, `skills/sweep-pending-opsx/SKILL.md`, `references/sweep-pending-opsx/protocol.md` | Created. `SSS` verified. Catalog in sync. |
| `/pending-left` | no | `commands/pending-left.md` + `references/pending-left/protocol.md` | referenced in flow |
| `/exit` | no (no file, user session close) | documented in this file (final flow) | available to user |
| `/dogfood` | no (RTRM gate) | `references/ready-to-review-mergeable/protocol.md` (§5b) + `docs/how-to/engineering-standards/SWEEP.md` (integration) | gate verified (`restrictions-check` exit 0, `APPROVE 5/5` in `/tmp/hd3.log`) |
| `/opsx-apply` | no | `commands/opsx-apply.md` + `references/opsx-apply/protocol.md` | referenced in flow |
| `/opsx-sync` | no | `commands/opsx-sync.md` + `references/opsx-sync/protocol.md` | referenced in flow |
| `/opsx-archive` | no | `commands/opsx-archive.md` + `references/opsx-archive/protocol.md` | referenced in flow |
| `/ready-to-review-mergeable` | no (RTRM) | `references/ready-to-review-mergeable/protocol.md` + `commands/ready-to-review-mergeable.md` | referenced in flow. The `flowchart TD` protocol covers all. |
| `/merge-advisor` | no | `commands/merge-advisor.md` + `references/merge-advisor/protocol.md` | referenced in flow |
| `/linear-daily` | **yes** (SKILL.md + examples.md) | `skills/linear-daily/` to create in toolkit. `commands/` holds no specific file. The source repo `SKILL.md` is the protocol SSOT. Debanding lives in `docs/multi-harness-ssot.md`. | created |
| `/subagents-opencode` | **yes** (delegate list + subordinate evidence + progress ledger + agent `sweep-ver` in pane `w9:pM`, `herdr agent start` exit 0, `idle` confirmed) | `skills/subagents-opencode/progress.md` is the SSOT ledger. `subordinate-delegate.md` lists the dependency chain. `subordinate-subagent-evidence.md` records PASS/FAIL/BLOCKED evidence with physical file references. | Delegation complete. The subagent reports but does not write the evidence file. The controller writes it. `progress.md` records delegation version 1. Worktree `.agents/worktrees/archive-spec-drift` used. Controller commit `b71060b5`. No-Brand verified via grep, zero hits. SSS verified. StS verified. Pipeline position verified. work-in-progress-state recorded. Worktree target real. parallel-safe false. Exit-gate is a physical file. No ruling pending. |

## How to use this file with Pele or Mintlify

- **Pele** (`npm install pele`): `import { render } from 'pele'; const { svg } = render(diagramText); document.querySelector('#pipeline').innerHTML = svg;`
  The file opens in any Markdown editor.
  The `mermaid` block renders through Pele.
  It needs no `Mintlify`.
  `Mintlify` renders `mermaid` natively when the user uses it as the docs framework.
  This file works in both contexts without change.
  The `mermaid` block must stay valid.
  The `flowchart TD` syntax with double quotes for nodes holding `/` meets `mermaid-github` D0-D6.
  `docs-diagrams/mermaid-github.md` verifies this.
- **Mintlify**: Include the file.
  The `mermaid` block renders automatically.
  It needs no extra configuration.
  `Mintlify` supports native `mermaid`.

## Note on `/worktree-cleanup`

`/worktree-cleanup` did not run this round.
Eleven worktrees stayed intact.
We listed them in `/tmp/prog.md` only.
This verifies `work-in-progress-state`.
The user must invoke it manually when ready.
The protocol `worktree-cleanup/protocol.md` exists.
The command `worktree-cleanup` exists.
No behavior changed.
