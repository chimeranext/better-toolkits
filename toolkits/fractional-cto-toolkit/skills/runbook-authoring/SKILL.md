---
name: runbook-authoring
description: >
  Writes a structured runbook — the procedure to respond to a specific triggering event
  or operational task — and emits an executable version when steps are automatable. Use
  this skill when the user mentions "write a runbook", "incident runbook", "recovery
  runbook", "release runbook", "deploy runbook", "on-call procedure", "responder a este
  incidente", "runbook de release", "escribe un runbook", "make this runbook executable",
  or any situation where a fractional CTO needs a trigger-driven, testable operational
  procedure. Sibling of /playbook-authoring (when/why/judgment) and /sop-authoring
  (steady-state company process). A runbook answers HOW to execute after the path is
  chosen. NOT for decision-tree playbooks (that is /playbook-authoring), NOT for
  steady-state processes (that is /sop-authoring), and NOT for security-test plans
  (that is /pentest-playbook-setup).
---

# Runbook Authoring

Turns a triggering event — an incident, an alert, a release, a scheduled ops task — into a
rigorous runbook someone (or an agent) can execute under pressure. Sibling of
`/playbook-authoring` and `/sop-authoring`.

```
Playbook = WHEN / WHY / judgment under uncertainty; decision tree + options
           — not a click-by-click execute script.               (/playbook-authoring)
Runbook  = trigger-driven, sequential, testable steps an operator/engineer
           executes (incident, deploy, recovery, scheduled ops). Bus-factor-1.
           Repo/infra context OK.                               (this skill)
SOP      = steady-state recurring COMPANY process; roles not named people;
           no code required to understand.                      (/sop-authoring)
```

The dividing line is **execute vs decide vs company process**, not merely "process vs
event". A playbook ("public timeout while origin is healthy — diagnose vs recover vs
escalate") chooses a branch. A runbook ("cut a production release", "run the recover
script for this signature") is the numbered how, written **bus-factor-1**. An SOP
("how Ops launches an event") needs no engineering context. Do not treat "playbook"
as a runbook or a post-mortem.

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

### Paso 1 — Routing test (three-way ops taxonomy + docs)

Confirm the thing is actually a runbook. Use the three-way ops taxonomy (playbook /
runbook / SOP) plus the usual product-docs cases:

| If the draft answers… | It is a… | Route it to… |
|---|---|---|
| Sequential, testable steps an engineer executes (release, deploy, incident, recover) | **Runbook** | continue here |
| *When / why* to choose a path under uncertainty; decision tree, options, RACI | **Playbook** | `/playbook-authoring` |
| How the **company** operates a recurring business process; no code required to understand | **SOP** | `/sop-authoring` |
| A one-off timeline of what happened in a single incident | **Post-mortem** | write a post-mortem; extract reusable judgment with `/playbook-authoring` |
| *What* to build, for whom, and why | **PDR** (Product Decision Record) | `openspec/changes/{date-slug}/proposal.md` |
| *How* it's built technically (stack, schema, infra, APIs) | **ADR** (Architecture Decision Record) | `openspec/changes/{date-slug}/design.md` |
| How an end user *uses* the finished product | **Product Documentation** | product docs |
| How to security-test a system (authorized engagement) | **Security playbook** | `/pentest-playbook-setup` |

Rule of thumb: if a **software engineer must understand it to execute it**, it is a
runbook, not an SOP. If they must **choose among branches** first, it is a playbook —
stop and route to `/playbook-authoring`. Never treat "playbook" as a synonym for
runbook or post-mortem.

### Paso 2 — Pick the runbook shape

| Shape | When | Backbone |
|---|---|---|
| **A — Incident / recovery** | responds to a failure/alert | trigger → diagnose → root cause → fix → verify → rollback → lessons |
| **B — Operational / triggered** | a release, deploy, scheduled ops task | when-it-runs → roles → gated steps → verify → rollback/abort |

Ask which applies (or infer from the trigger). Use the matching half of the template;
delete the other.

### Paso 3 — Author the runbook

1. Read the template: `${CLAUDE_PLUGIN_ROOT}/references/08-runbook-template.md`.
2. Fill the chosen shape. Writing discipline (the DNA of a real runbook):
   - **Header table + reader's summary** — the whole runbook actionable in one breath by
     someone on-call who reads nothing else.
   - **Bus-factor-1 framing, stated explicitly**, plus the maxim *"if a step disagrees
     with reality, reality wins — fix the page."* A runbook is a living document.
   - **A "read this first" mental-model section** — the one invariant that, if
     misunderstood, causes the incident this runbook exists to prevent (the "rule zero":
     e.g. "merging is not deploying"). Put it before any step.
   - **Name owners by role, not person**; the goal is to make the procedure a *team*
     capability, not tribal knowledge in one head.
   - **Verbatim commands with expected output as comments** — never paraphrase a command.
   - **Diagnosis is read-only**; the fix/procedure is where state changes.
   - **Every irreversible or outward-facing step carries a gate** (`[APPROVAL REQUIRED]`
     for deploy-to-prod, publish, delete).
   - **Verification proves it took effect** — verify the live revision/version in the
     target environment, not that a command exited 0. "Fixed on staging" ≠ "live in prod".
   - **Dated real-incident callouts** (`> Real incident (YYYY-MM-DD, vX.Y.Z): …`) — the
     highest-value content; they encode a failure the reader would otherwise repeat.
   - **Honest confidence levels** in root cause; say which popular advice is wrong.
   - **A rollback always exists** — if there's a point-of-no-return, name it explicitly.
   - **Bilingual** (EN + ES) when the operating team is bilingual.
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

- `/playbook-authoring` (judgment), this skill (execute), and `/sop-authoring`
  (company process) are siblings and share the business-brain home; the routing
  test is what separates them. This skill and `/sop-authoring` also share the
  executable-form discipline.
- Do not fabricate automation for steps that are genuinely manual.
- The incident shape values the *failed attempts*, not just the working fix — the trail is
  what makes the runbook re-usable when the same failure appears elsewhere.
- Use the Acme universe for examples (e.g. "AcmePay deploy runbook", "RapidEats oomd
  recovery runbook").
