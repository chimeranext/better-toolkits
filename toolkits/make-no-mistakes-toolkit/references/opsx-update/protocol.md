# /opsx:update — protocol SSOT

Harness-agnostic body. Thin entry: `commands/opsx-update.md`.

Adheres to the official OpenSpec OPSX workflow (`docs/opsx.md` in `Fission-AI/OpenSpec`): the revision step.

---

# /opsx:update $ARGUMENTS

**Revise a change's planning artifacts and keep them coherent.** Updates the change's existing artifacts in any direction — a design edit may ripple back to the proposal. It **never edits code**. Every edit is confirmed with the user first.

**Exit means:** the artifacts are revised and coherent after human confirmation. It does **not** mean code changed or anything was merged.

---

## §1 Determine update vs. start fresh

- **Update** when: same intent refined, scope narrows, or learning-driven corrections.
- **Start fresh** when: intent fundamentally changed, scope exploded, or the original is completable and the new work stands alone.

## §2 Revise artifacts

- Edit the relevant artifacts; propagate ripple changes to keep them coherent (e.g., a design edit ripples back to the proposal).
- If the change was already implemented, recommend `/opsx:apply` so code catches up with the revised plan.

---

## Guardrails (mandatory HITL)

- **Never merges.** Exit = human review handoff; `READY FOR HUMAN REVIEW — NOT MERGE AUTHORIZED`.
- Every edit confirmed with the human first — do not silently edit.
- Protocol files in English; anti-boilerplate; no hidden redirects (stderr/stdout to the null device are forbidden per harness `stderr/README.md`).
- No `TICKET-*` IDs — use this repo's native GitHub issues (`Fixes #N`).

## Source

- OpenSpec OPSX workflow: https://github.com/Fission-AI/OpenSpec/blob/main/docs/opsx.md
