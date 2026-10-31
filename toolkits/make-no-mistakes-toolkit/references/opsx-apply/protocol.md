# /opsx:apply — protocol SSOT

Harness-agnostic body. Thin entry: `commands/opsx-apply.md`.

Adheres to the official OpenSpec OPSX workflow (`docs/opsx.md` in `Fission-AI/OpenSpec`): the fluid implementation step.

---

# /opsx:apply $ARGUMENTS

**Implement tasks, updating artifacts as needed.** Works through the change's `tasks.md`, checking tasks off as you go. If an artifact proves wrong while implementing, fix the artifact first, then continue.

**Exit means:** implementation is handed to a human for review — code may have changed, but nothing is merged without HITL.

---

## §1 Select the change

- If `$ARGUMENTS` includes a change name, use it. Otherwise infer from the conversation; prompt the user to choose if it can't tell.

## §2 Implement tasks

- Read `tasks.md`; process tasks in order, checking each off as you complete it.
- If implementation reveals the design/spec is off: fix the artifact (design/spec/`), then continue — the fluid loop of `/opsx:update` + `/opsx:apply`.

## §3 Update artifacts as you learn

- Do not treat specs/design as frozen; update them when the codebase reveals the plan was wrong.
- If the change's *intent* changed fundamentally, recommend starting fresh instead of patching.

---

## §4 Version policy (SemVer)

When the change touches any versioned artifact, follow the **SemVer** policy
(`shared/references/engineering-standards/semver.md`), generic to any repo:

- Keep the version in one canonical manifest; derived catalogs are generated.
- Before declaring ready, ensure the version is **strictly greater** than the
  default branch (`main`) at the moment it will land.
- If a concurrent change claimed the same version, rebase and re-bump
  (patch+1) instead of "picking a side".
- Let the merge queue enforce it (combined-head check); do not rely on local-only
  gates.

## Guardrails (mandatory HITL)

- **Never merges.** Exit = human review handoff; `READY FOR HUMAN REVIEW — NOT MERGE AUTHORIZED`.
- Protocol files in English; anti-boilerplate; no hidden redirects (stderr/stdout to the null device are forbidden per harness `stderr/README.md`).
- No embedded secrets; use `/secret-use`.
- No `TICKET-*` IDs — use this repo's native GitHub issues (`Fixes #N`).

## Source

- OpenSpec OPSX workflow: https://github.com/Fission-AI/OpenSpec/blob/main/docs/opsx.md
