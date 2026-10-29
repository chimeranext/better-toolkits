# /opsx:new — protocol SSOT

Harness-agnostic body. Thin entry: `commands/opsx-new.md`.

Adheres to the official OpenSpec OPSX workflow (`docs/opsx.md` in `Fission-AI/OpenSpec`): the expanded scaffold step.

---

# /opsx:new $ARGUMENTS

**Start a new change scaffold (expanded workflow).** Scaffolds the change directory and waits for direction. Use `/opsx:continue` to create artifacts one at a time, or `/opsx:ff` to fast-forward.

**Exit means:** the change scaffold exists. It does **not** mean planning artifacts are created or anything is merged.

---

## §1 Scaffold

- Create the change directory with its metadata (`.openspec.yaml`).
- Determine schema via precedence: `--schema <name>` → change metadata → project config → default `spec-driven`.

## §2 Hand off

- Report the scaffold and the next available action (/opsx:continue / /opsx:ff / /opsx:propose).

---

## Guardrails (mandatory HITL)

- **Never merges.** Exit = human review handoff; `READY FOR HUMAN REVIEW — NOT MERGE AUTHORIZED`.
- Protocol files in English; anti-boilerplate; no hidden redirects (stderr/stdout to the null device are forbidden per harness `stderr/README.md`).
- No `TICKET-*` IDs — use this repo's native GitHub issues (`Fixes #N`).

## Source

- OpenSpec OPSX workflow: https://github.com/Fission-AI/OpenSpec/blob/main/docs/opsx.md
