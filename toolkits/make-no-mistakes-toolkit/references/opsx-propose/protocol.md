# /opsx:propose — protocol SSOT

Harness-agnostic body. Thin entry: `commands/opsx-propose.md`.

Adheres to the official OpenSpec OPSX workflow (`docs/opsx.md` in `Fission-AI/OpenSpec`): the default quick path for starting a change.

---

# /opsx:propose $ARGUMENTS

**Create a change and generate planning artifacts in one step.** This is the default path for kicking off an OpenSpec change: it scaffolds the change and produces the planning artifacts (proposal → specs → design → tasks for the `spec-driven` schema) before implementation.

**Exit means:** the change exists with its planning artifacts created and coherent. It does **not** mean code changed, specs merged into main, or anything archived.

---

## §1 Determine the change

- If `$ARGUMENTS` includes a change name, use it; otherwise infer from the conversation and prompt the user to choose if it can't tell.
- Schema precedence (highest → lowest): `--schema <name>` flag → change metadata (`.openspec.yaml`) → project config (`openspec/config.yaml`) → default `spec-driven`.

## §2 Create planning artifacts

- For the default `spec-driven` schema, generate: `proposal.md` → `specs/**/*.md` → `design.md` → `tasks.md`.
- Create artifacts in dependency order (proposal first; tasks last).
- Respect project config `context` (injected into artifact instructions) and `rules` (per-artifact rules).

## §3 Do NOT implement

- `/opsx:propose` only plans. It never writes application code.
- Transition to `/opsx:apply` when planning is complete.

---

## Guardrails (mandatory HITL)

- **Never merges.** Exit = human review handoff or artifact transition; `READY FOR HUMAN REVIEW — NOT MERGE AUTHORIZED`.
- Protocol files in English; anti-boilerplate; no hidden redirects (stderr/stdout to the null device are forbidden per harness `stderr/README.md`).
- No embedded secrets; use `/secret-use`.
- No `TICKET-*` IDs — use this repo's native GitHub issues (`Fixes #N`).

## Anti-triggers

- Do not apply (that is `/opsx:apply`).
- Do not merge specs into main (that is `/opsx:sync`).
- Do not archive (that is `/opsx:archive`).

## Source

- OpenSpec OPSX workflow: https://github.com/Fission-AI/OpenSpec/blob/main/docs/opsx.md
