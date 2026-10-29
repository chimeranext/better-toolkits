# /opsx:archive — protocol SSOT

Harness-agnostic body. Thin entry: `commands/opsx-archive.md`.

Adheres to the official OpenSpec OPSX workflow (`docs/opsx.md` in `Fission-AI/OpenSpec`): the finishing step.

---

# /opsx:archive $ARGUMENTS

**Archive the change when done.** Moves the completed change into the archive. If the change's delta specs have not been synced into main, `archive` prompts to sync specs first.

**Exit means:** the change is archived after human confirmation. It does **not** mean code was merged without HITL.

---

## §1 Confirm completion

- Ensure the change is actually done (tasks complete, implementation reviewed) before archiving.
- If specs have not been synced, offer `/opsx:sync` first.

## §2 Archive

- Move the change directory into the archive location per OpenSpec conventions.
- On ambiguous or unreviewed work: STOP and ask the human.

---

## Guardrails (mandatory HITL)

- **Never merges.** Exit = human review handoff; `READY FOR HUMAN REVIEW — NOT MERGE AUTHORIZED`.
- Protocol files in English; anti-boilerplate; no hidden redirects (stderr/stdout to the null device are forbidden per harness `stderr/README.md`).
- No `TICKET-*` IDs — use this repo's native GitHub issues (`Fixes #N`).

## Source

- OpenSpec OPSX workflow: https://github.com/Fission-AI/OpenSpec/blob/main/docs/opsx.md
