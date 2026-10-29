# /opsx:ff — protocol SSOT

Harness-agnostic body. Thin entry: `commands/opsx-ff.md`.

Adheres to the official OpenSpec OPSX workflow (`docs/opsx.md` in `Fission-AI/OpenSpec`): the expanded fast-forward planner.

---

# /opsx:ff $ARGUMENTS

**Fast-forward planning artifacts (expanded workflow).** Creates all planning artifacts at once. Use when you have a clear picture of what you're building.

**Exit means:** all planning artifacts exist and are coherent. It does **not** mean code changed or anything is merged.

---

## §1 Confirm clarity

- Fast-forward is appropriate when the change's picture is clear. If the idea is still fuzzy, prefer `/opsx:continue` (one at a time) or `/opsx:explore`.

## §2 Create all planning artifacts

- Generate the full planning artifact set in dependency order (proposal → specs → design → tasks for `spec-driven`).
- Respect project config `context`/`rules`.

---

## Guardrails (mandatory HITL)

- **Never merges.** Exit = human review handoff; `READY FOR HUMAN REVIEW — NOT MERGE AUTHORIZED`.
- Protocol files in English; anti-boilerplate; no hidden redirects (stderr/stdout to the null device are forbidden per harness `stderr/README.md`).
- No `TICKET-*` IDs — use this repo's native GitHub issues (`Fixes #N`).

## Source

- OpenSpec OPSX workflow: https://github.com/Fission-AI/OpenSpec/blob/main/docs/opsx.md
