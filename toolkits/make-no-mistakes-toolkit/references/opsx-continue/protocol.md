# /opsx:continue — protocol SSOT

Harness-agnostic body. Thin entry: `commands/opsx-continue.md`.

Adheres to the official OpenSpec OPSX workflow (`docs/opsx.md` in `Fission-AI/OpenSpec`): the expanded incremental builder.

---

# /opsx:continue $ARGUMENTS

**Create the next artifact one at a time (expanded workflow).** Shows what's ready to create based on dependencies, then creates one artifact. Use repeatedly to build up a change incrementally.

**Exit means:** one artifact is created and the next unlocked step is shown. It does **not** mean the change is complete or anything is merged.

---

## §1 Determine current state

- Query the change's artifact state (e.g., `openspec status --change <name> --json`).
- Identify the first artifact whose dependencies are all done (`READY`); skip `BLOCKED` ones.

## §2 Create one artifact

- Generate the single ready artifact, following its template and any injected project `context`/`rules`.
- Report what the new artifact unlocks.

---

## Guardrails (mandatory HITL)

- **Never merges.** Exit = human review handoff or artifact transition; `READY FOR HUMAN REVIEW — NOT MERGE AUTHORIZED`.
- Protocol files in English; anti-boilerplate; no hidden redirects (stderr/stdout to the null device are forbidden per harness `stderr/README.md`).
- No `TICKET-*` IDs — use this repo's native GitHub issues (`Fixes #N`).

## Source

- OpenSpec OPSX workflow: https://github.com/Fission-AI/OpenSpec/blob/main/docs/opsx.md
