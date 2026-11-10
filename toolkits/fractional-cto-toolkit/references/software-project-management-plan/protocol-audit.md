# Skill `software-project-management-plan/audit` — protocol SSOT

## Purpose

Gap-audit an existing SPMP (and its risk companion) against the chosen catalog
templates. Output a findings brief only.

## When to use

- Before approval of a project plan.
- When a client claims “we follow ISO 16326 / 16085”.
- Periodic conformance check during delivery.

## Method

1. **Load** `catalog.md`, `audit-rubric.md`, `iso-16326-spmp-outline.md`.
2. **Confirm** template ids with the user (default SPMP `iso-16326-spmp`, risk
   `iso-16085-risk-management-plan`).
3. **Read** the client plan path the user provides. Do not commit it into the
   toolkit.
4. **Score** each 16326 checklist row → Presente / Parcial / Ausente / N-A
   justificado + evidence pointer.
5. **Score** risk content against 16085 §8.1.2 headings (strategy, context,
   roles, process steps, profile, communication, resources schedule). Score
   treatment plans against §8.2.2 when claimed.
6. **Optional** PMBOK 8 domain overlay via `pmbok8-crosswalk.md`.
7. **Separate** ISO 31000 org claims → hand to `/iso31000` (do not conflate).
8. **Report** gap matrix + severity + suggested owner + next action.

## Artifact

`fractional-cto/risk/spmp-audit-<date>.md` (or brain `plans/` audit note) with:

- Scope (path, template ids, standards cited)
- Score tables
- Findings by severity
- Recommended remediation order

## Contract

- Every finding cites a checklist row and evidence location.
- Short quotes or `not found` only — no wholesale reproduction of client docs.
- Rubric severity rules in `audit-rubric.md` are binding.
- Eval fixture (read-only): VainillaCode `business-brain` EVP SPMP on `main` —
  **never modify** `plans/2026-11-05-plan-proyecto-evp.md` during audit.
