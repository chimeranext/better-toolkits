---
description: Command table for the post-merge pipeline — the SSOT home of each command that participates in the flow.
argument-hint: ""
priority: 69
---
# Pipeline commands — SSOT homes

The pipeline overview (see `pipeline-overview.md`) references commands.
This table lists each command and its SSOT home.

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
