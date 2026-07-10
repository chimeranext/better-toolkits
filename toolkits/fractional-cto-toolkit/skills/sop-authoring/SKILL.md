---
name: sop-authoring
description: >
  Writes a structured Operational SOP from a captured process, and emits an executable version when
  any step is automatable. Use this skill when the user mentions "write an SOP", "standard operating
  procedure", "operational procedure", "document this process properly", "turn this into an SOP",
  "make this SOP executable", "runnable SOP", "SOP as an agent", or any situation where a fractional
  CTO needs to produce a rigorous, testable operating procedure. This is the OUTPUT stage of the
  process-engineering pipeline — it consumes /process-standardization captures and /automation-triage
  verdicts. NOT for the takeover-specific SOPs (that is /project-takeover) nor for contracts.
---

# SOP Authoring

Turns a captured process into a rigorous Operational SOP using a structured template, calibrated to
the process's maturity. When `/automation-triage` marked steps as RPA- or AI-automatable, it also
emits a runnable executable SOP with human-approval gates. Final stage of the pipeline:

```
process-standardization  →  automation-triage  →  sop-authoring
  (discover + capture)       (decide the how)      (write the SOP + executable form)
```

## Language rule

The skill's questions and working notes are in **English**. Generated SOPs follow the **engagement's
working language** — English by default, Spanish for Costa Rica engagements (matching the contract
skills). Confirm if unclear.

## Output directory

Resolve the pipeline directory `{sops-dir}` first, in this order:

1. If a business brain exists in the working directory (a `business-brain/` folder, or a vault
   root with `_procedimientos/` — see `/business-brain-setup`), then
   `{sops-dir}` = `<brain-root>/_procedimientos/`. SOPs that belong to a business LIVE in its
   business brain; that folder is their canonical home.
2. Otherwise (no brain yet, e.g. a client engagement without one),
   `{sops-dir}` = `./fractional-cto/sops/`.

## Flujo del skill

### Paso 1 — Routing test

Before writing, confirm the thing is actually an Operational SOP. An SOP documents *how a team
operates a repeatable process*, no code required to understand it. Route away anything that is not:

| If the draft is really about… | It is a… | Route it to… |
|---|---|---|
| The steps an operator follows to run a process | **Operational SOP** | continue here |
| *What* to build, for whom, and why | Build Decision | product decision record |
| *How* it is built technically (stack, schema, infra, APIs) | Tech Decision | architecture decision record |
| How an end user *uses* the finished product | User Guide | product documentation |

If it fails the routing test, tell the user which type it actually is and stop — do not force a
non-process into the SOP template.

### Paso 2 — Depth by maturity

Ask (or infer) the process's stage; it decides which sections are required:

| Stage | Required sections | `TBD` allowed? |
|---|---|---|
| **Draft / proposed** | Header, 1 Purpose, 2 Scope, 3 Audience, 6 Process (outline), 11 Revision History | Yes, freely |
| **In rollout** | + 5 Roles; Process fully documented | Edge cases only |
| **Active production** | All sections; no `TBD` in the procedure | No |

This calibration mirrors how `/project-takeover` scales document detail to risk level — here it
scales to process maturity.

### Paso 3 — Author the SOP

1. Read the template: `${CLAUDE_PLUGIN_ROOT}/references/05-operational-sop-template.md`
2. Load inputs if present: `{slug}-capture.md` (the steps) and `{slug}-triage.md` (the verdicts).
3. Fill each required section. Apply the template's writing discipline:
   - **Name owners by role, not person** ("Head of Support", not "Fer") so the SOP survives turnover.
   - **Real tool names, real numbers, real thresholds** — days of lead time, dollar amounts, volumes.
   - **Sequential, testable steps** — Step 4 executable only after Step 3.
   - **Tables** for anything with more than three parallel items (roles, phases, tools).
   - **Callouts** for what the reader must not miss: `> DECISION POINT`, `> SCALE NOTE`,
     `> LESSON LEARNED`.
   - In **Section 6**, structure phases with **Owner / Duration / Gate to next phase**.
4. Write to `{sops-dir}/{slug}/{slug}-sop.md`.

### Paso 4 — Executable mode (when automatable)

If `{slug}-triage.md` contains any `RPA` or `AI agent` / `Human + AI` verdict, ALSO emit a runnable
executable SOP:

1. Read the template: `${CLAUDE_PLUGIN_ROOT}/references/06-executable-sop-skill-template.md`
2. Build the frontmatter: `name`, a `description` with the run trigger, and `required_tools` —
   the MCP tools the RPA/AI steps call.
3. Turn the procedure into numbered executable steps, attaching gate markers by verdict:
   - `Human` / `Human + AI` step → `[APPROVAL REQUIRED]`; outward-facing or irreversible actions
     (sends email, moves money, deletes data) → `[PRE-APPROVAL REQUIRED]`.
   - `RPA — attended` → runs with a human trigger; `RPA — unattended` / `AI agent` → no gate.
   - Conditional steps → `[OPTIONAL]`.
4. State in the doc that the markdown is authoritative (edit steps = change behavior) and that human
   gates are structural. Reference the JSONL run log.
5. Write to `{sops-dir}/{slug}/{slug}-sop.skill.md`.

If every verdict is `Human`, skip this step — a purely human process needs no executable form. Say so.

### Paso 5 — Quality checklist + bus test

Before finishing, run the checklist from the template (routing / structure / content / cross-reference)
and the **bus test**: "if I got hit by a bus tomorrow, could a teammate read this SOP and run the
process?" If no, add detail — vague steps, unnamed owners, and missing thresholds are the usual gaps.

### Paso 6 — Confirmación

Present the deliverables and how to use them:

1. `{slug}-sop.md` → "The operational SOP — the human-readable source of truth."
2. `{slug}-sop.skill.md` (if emitted) → "The runnable version — an LLM runtime executes it, pausing at
   the approval gates. The markdown is authoritative; edit the steps to change behavior."

**Suggested next step:**
> "Keep the SOP a living document: bump the version when the process changes, and re-run
> `/automation-triage` when a step's volume or tooling shifts enough to change its verdict."

## Notas para el modelo

- This skill is the general-purpose SOP engine. `/project-takeover` is a *specialized* SOP producer
  (project handovers) — this one handles any operational process.
- The executable form is only emitted when triage says a step is automatable. Do not fabricate
  automation for a process that is genuinely all-human.
- The SOP is the source of truth for *what exists today*; keep improvement ideas in the open-questions
  list, not silently baked into the steps.
- Personalization is about ELIMINATING sections that do not apply at the current maturity, not adding
  unnecessary complexity — same discipline `/project-takeover` uses when pruning its templates.
- Use the Acme universe for examples (e.g. "AcmeLegal client-intake SOP", "RapidEats refund SOP").
