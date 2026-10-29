# /opsx:bulk-archive — protocol SSOT

Harness-agnostic body. Thin entry: `commands/opsx-bulk-archive.md`.

Adheres to the official OpenSpec OPSX workflow (`docs/opsx.md` in `Fission-AI/OpenSpec`): the expanded batch finish step.

---

# /opsx:bulk-archive $ARGUMENTS

**Archive multiple completed changes (expanded workflow).** Like `/opsx:archive` but for several completed changes at once. For each change, confirm it is done and offer to sync specs before archiving.

**Exit means:** the listed changes are archived after human confirmation. It does **not** mean code was merged without HITL.

---

## §1 Enumerate candidates

- Identify the completed changes eligible for archiving. If none are complete, say so and do not archive.

## §2 Per-change flow

- For each: confirm completion → offer `/opsx:sync` for un-synced specs → archive.

---

## Guardrails (mandatory HITL)

- **Never merges.** Exit = human review handoff; `READY FOR HUMAN REVIEW — NOT MERGE AUTHORIZED`.
- Protocol files in English; anti-boilerplate; no hidden redirects (stderr/stdout to the null device are forbidden per harness `stderr/README.md`).
- No `TICKET-*` IDs — use this repo's native GitHub issues (`Fixes #N`).

## Source

- OpenSpec OPSX workflow: https://github.com/Fission-AI/OpenSpec/blob/main/docs/opsx.md
