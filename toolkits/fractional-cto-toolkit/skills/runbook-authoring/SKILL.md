---
name: runbook-authoring
description: >
  Writes a structured runbook — the procedure to respond to a specific triggering event
  or operational task — and emits an executable version when steps are automatable. Use
  this skill when the user mentions "write a runbook", "incident runbook", "recovery
  runbook", "release runbook", "deploy runbook", "on-call procedure", "responder a este
  incidente", "runbook de release", "escribe un runbook", "make this runbook executable",
  or any situation where a fractional CTO needs a trigger-driven, testable operational
  procedure. Sibling of /sop-authoring: an SOP documents a steady-state repeatable
  process; a runbook answers an EVENT. NOT for steady-state processes (that is
  /sop-authoring) nor for security playbooks (that is /pentest-playbook-setup).
---

# Runbook Authoring

Turns a triggering event — an incident, an alert, a release, a scheduled ops task — into a
rigorous runbook someone (or an agent) can execute under pressure. Sibling of
`/sop-authoring`: same executable discipline, different shape.

```
SOP      = how a team operates a STEADY-STATE repeatable process   (/sop-authoring)
Runbook  = the procedure to respond to a TRIGGERING EVENT/task      (this skill)
```

## Language rule

The skill's questions and working notes are in **English**. Generated runbooks follow the
**engagement's working language** — English by default (public-facing ops docs are
usually English), Spanish for Costa Rica engagements. Confirm if unclear.

## Output directory

Resolve `{runbooks-dir}` first, in this order:

1. If a business brain exists (a `business-brain/` folder or a vault root with
   `_procedimientos/` — see `/business-brain-setup`), then
   `{runbooks-dir}` = `<brain-root>/_procedimientos/runbooks/`. Operational runbooks are
   part of a business's living procedures; that is their home.
2. Otherwise, `{runbooks-dir}` = `./fractional-cto/runbooks/`.

## Flujo del skill

### Paso 1 — Routing test (SOP vs runbook)

Confirm the thing is actually a runbook. A runbook has a **trigger**; an SOP does not.

| If the draft answers… | It is a… | Route it to… |
|---|---|---|
| "when EVENT X fires, do these steps" (incident, alert, release, cron) | **Runbook** | continue here |
| "how we operate process X in steady state" | **Operational SOP** | `/sop-authoring` |
| "how to test the security of a system" | **Security playbook** | `/pentest-playbook-setup` |
| *What* to build / *how* it's built technically | Decision record | ADR / product doc |

If it has no trigger, it is probably an SOP — say so and route to `/sop-authoring`.

### Paso 2 — Pick the runbook shape

| Shape | When | Backbone |
|---|---|---|
| **A — Incident / recovery** | responds to a failure/alert | trigger → diagnose → root cause → fix → verify → rollback → lessons |
| **B — Operational / triggered** | a release, deploy, scheduled ops task | when-it-runs → roles → gated steps → verify → rollback/abort |

Ask which applies (or infer from the trigger). Use the matching half of the template;
delete the other.

### Paso 3 — Author the runbook

1. Read the template: `${CLAUDE_PLUGIN_ROOT}/references/08-runbook-template.md`.
2. Fill the chosen shape. Writing discipline:
   - **Lead with the reader's summary** (the `⚠` blockquote) — the whole runbook in one
     breath, actionable by someone on-call who reads nothing else.
   - **Name owners by role, not person**, so the runbook survives turnover.
   - **Verbatim commands with expected output as comments** — never paraphrase a command.
   - **Diagnosis is read-only**; the fix/procedure is where state changes.
   - **Every irreversible or outward-facing step carries a gate** (`[APPROVAL REQUIRED]`
     for deploy-to-prod, publish, delete).
   - **Honest confidence levels** in root cause; say which popular advice is wrong.
   - **A rollback always exists** — if there's a point-of-no-return, name it explicitly.
3. Write to `{runbooks-dir}/{slug}/{slug}-runbook.md`.

### Paso 4 — Paired scripts (incident/recovery shape)

For shape A, ship the paired-script pattern alongside the doc:

- `diagnose-{slug}.sh` — read-only, no sudo; exit `0`=no match, `1`=detected, `2`=doesn't
  apply. Pasteable into a support chat; detects the signature without changing anything.
- `repair-{slug}.sh` (or `fix-`) — the actual fix. Idempotent; `set -euo pipefail`;
  backs up before any destructive change; supports `NONINTERACTIVE=1`; escalates to sudo
  only for the specific commands that need it. Re-running after success is a no-op.
- `revert-{slug}.sh` — for multi-step changes, undoes using the artifacts the fix created.

Script conventions: `#!/usr/bin/env bash`, ANSI `log/ok/warn/fail` helpers, a "Guardrails"
section 1 (refuse wrong context, check deps), a header block stating purpose / idempotency
/ sudo needs / reboot-logout side effects. Pass `shellcheck -S warning` clean.

### Paso 5 — Executable form (when automatable)

If the procedure has automatable steps, ALSO emit `{slug}-runbook.skill.md`:
frontmatter (`name`, `description` with the **trigger**, `required_tools`) + the numbered
steps with their gate markers. The markdown is authoritative; human gates are structural
(an agent runtime pauses at them). If every step needs a human, skip this and say so.

### Paso 6 — Quality checklist + 3 AM test

Run the **3 AM test**: "could an on-call engineer who has never seen this system execute
this runbook correctly at 3 AM from the reader's summary + steps alone?" If not, the gaps
are the usual ones — unnamed owners, paraphrased commands, a missing rollback, no way to
confirm success. Fix them before finishing.

### Paso 7 — Confirmación

Present the deliverables and how to use them:

1. `{slug}-runbook.md` → "The runbook — human-readable source of truth for this event."
2. `diagnose/repair/revert-{slug}.sh` (shape A) → "Paste diagnose into a chat to confirm
   the signature; repair applies the idempotent fix; revert undoes it."
3. `{slug}-runbook.skill.md` (if emitted) → "The runnable version — an LLM runtime executes
   it, pausing at the approval gates."

**Suggested next step:**
> "Keep it living: after the next real firing, fold what you learned back into the root
> cause and the debugging-lessons section — a runbook improves every time it runs."

## Notas para el modelo

- `/sop-authoring` (process) and this (event) are siblings and share the executable-form
  discipline and the business-brain home; the routing test is what separates them.
- Do not fabricate automation for steps that are genuinely manual.
- The incident shape values the *failed attempts*, not just the working fix — the trail is
  what makes the runbook re-usable when the same failure appears elsewhere.
- Use the Acme universe for examples (e.g. "AcmePay deploy runbook", "RapidEats oomd
  recovery runbook").
