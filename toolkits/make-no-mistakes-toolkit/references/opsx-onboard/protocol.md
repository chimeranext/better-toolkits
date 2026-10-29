# /opsx:onboard — protocol SSOT

Harness-agnostic body. Thin entry: `commands/opsx-onboard.md`.

Adheres to the official OpenSpec OPSX workflow (`docs/opsx.md` in `Fission-AI/OpenSpec`): the expanded guided walkthrough.

---

# /opsx:onboard $ARGUMENTS

**Guided walkthrough of an end-to-end change (expanded workflow).** Leads through the full flow step-by-step (scaffold → planning artifacts → apply → sync → archive), explaining as it goes.

**Exit means:** the user has been walked through one complete change lifecycle. It does **not** mean anything was merged without HITL.

---

## §1 Walk the lifecycle

- Guide through each stage in order, performing the relevant action per stage and pausing for the human as required.
- Use the appropriate sibling commands' semantics at each stage: `/opsx:new` / `propose`, `/opsx:continue` / `ff`, `/opsx:apply`, `/opsx:sync`, `/opsx:archive`.

## §2 HITL at every gate

- At each transition, confirm with the human before proceeding.

---

## Guardrails (mandatory HITL)

- **Never merges.** Exit = human review handoff; `READY FOR HUMAN REVIEW — NOT MERGE AUTHORIZED`.
- Protocol files in English; anti-boilerplate; no hidden redirects (stderr/stdout to the null device are forbidden per harness `stderr/README.md`).
- No `TICKET-*` IDs — use this repo's native GitHub issues (`Fixes #N`).

## Source

- OpenSpec OPSX workflow: https://github.com/Fission-AI/OpenSpec/blob/main/docs/opsx.md
