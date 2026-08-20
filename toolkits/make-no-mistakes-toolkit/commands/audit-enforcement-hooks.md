---
description: >
  Audit Cure-4 enforcement-hook coverage AND efficacy — does a gate exist for
  each structural rule, and does that gate actually bind? Covers presence gaps
  (findHookCoverageGaps) and vacuous-gate shapes 2/4–7 (findHookEfficacyGaps).
  Emits findings, OpenSpec remediation, Bilingual Linear issues, and cure
  scaffolds. Accepts a target path as $ARGUMENTS.
---

# /audit-enforcement-hooks

Read and follow [`references/detectors/enforcement-hooks.md`](../references/detectors/enforcement-hooks.md) (ENF detector SSOT).

Trigger the **`audit-engine`** skill with the `enforcement-hooks` (`ENF`) detector profile against $ARGUMENTS (default: current repo).

Deterministic verification uses **two** verifiers:

- `findHookCoverageGaps` (`src/audit/verifiers/enforcement-hooks.ts`) — does a gate exist? (shapes 1 & 3)
- `findHookEfficacyGaps` (`src/audit/verifiers/enforcement-hooks-efficacy.ts`) — does the gate bind? (shapes 2 & 4–7)

`$ARGUMENTS` = target path (optional).

## Usage

```
/audit-enforcement-hooks [path]
```
