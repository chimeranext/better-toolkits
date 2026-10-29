# /opsx:verify — protocol SSOT

Harness-agnostic body. Thin entry: `commands/opsx-verify.md`.

Adheres to the official OpenSpec OPSX workflow (`docs/opsx.md` in `Fission-AI/OpenSpec`): the expanded validation step.

---

# /opsx:verify $ARGUMENTS

**Validate implementation against artifacts (expanded workflow).** Checks that the implementation matches the change's artifacts (specs/design/tasks) and reports gaps.

**Exit means:** a verification report is produced. It does **not** mean code changed, specs edited, or anything merged.

---

## §1 Compare implementation to artifacts

- Check each task/requirement in the artifacts against the actual code state.
- Report PASS / PARTIAL / FAIL per item, with evidence and `file:line` references.

## §2 Surface gaps

- Flag discrepancies between plan and implementation; recommend the appropriate next action (fix artifact via `/opsx:update`, or finish implementation via `/opsx:apply`).

---

## Guardrails (mandatory HITL)

- **Never merges.** Exit = human review handoff; `READY FOR HUMAN REVIEW — NOT MERGE AUTHORIZED`.
- Protocol files in English; anti-boilerplate; no hidden redirects (stderr/stdout to the null device are forbidden per harness `stderr/README.md`).
- No `TICKET-*` IDs — use this repo's native GitHub issues (`Fixes #N`).

## Source

- OpenSpec OPSX workflow: https://github.com/Fission-AI/OpenSpec/blob/main/docs/opsx.md
