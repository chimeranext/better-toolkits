---
name: playbook-authoring
description: >
  Writes a structured operational playbook — when/why/judgment under uncertainty,
  with a decision tree and options — not a click-by-click execute script. Use this
  skill when the user mentions "write a playbook", "ops playbook", "incident playbook",
  "decision tree", "when to diagnose vs recover", "playbook vs runbook", "which script
  should I run", "escribe un playbook", "árbol de decisión operativo", "playbook de
  incidente", or any situation where a fractional CTO needs a reusable judgment
  document for a class of incidents or ops choices. Sibling of /runbook-authoring
  (execute-under-pressure steps) and /sop-authoring (steady-state company process).
  NOT for sequential recover/deploy procedures (that is /runbook-authoring), NOT for
  recurring business SOPs (that is /sop-authoring), and NOT for authorized security-test
  plans (that is /pentest-playbook-setup).
---

# Playbook Authoring

Turns a class of operational uncertainty — which path to take, when, and why — into a
reusable playbook a lead can use under pressure. Sibling of `/runbook-authoring` and
`/sop-authoring`. This skill writes **judgment**, not an execute script.

```
Playbook = WHEN / WHY / strategy / judgment under uncertainty; narrative + options
           (this skill). Not a click-by-click execute script.
Runbook  = trigger-driven, sequential, testable steps an operator/engineer executes
           (incident, deploy, recovery, scheduled ops). Bus-factor-1. Repo/infra
           context OK.                                            (/runbook-authoring)
SOP      = steady-state recurring COMPANY process; roles not named people; no code
           required to understand.                                (/sop-authoring)
```

A playbook answers *which* runbook or script to run and *when*. A runbook performs
*how* with guardrails. An SOP documents how the company operates a repeatable
business process. Dated post-mortems record one incident; they are not playbooks —
promote the reusable decision tree here, leave the timeline in the post-mortem.

## Language rule

The skill's questions and working notes are in **English**. Generated playbooks follow
the **engagement's working language** — English by default (public-facing ops docs are
usually English), Spanish for Costa Rica engagements. Confirm if unclear.

## Output directory

Resolve `{playbooks-dir}` first, in this order:

1. If a business brain exists (a `business-brain/` folder or a vault root with
   `_procedimientos/` — see `/business-brain-setup`), then
   `{playbooks-dir}` = `<brain-root>/_procedimientos/playbooks/`. Playbooks live with
   the other living procedures.
2. Otherwise, `{playbooks-dir}` = `./fractional-cto/playbooks/`.

## Flujo del skill

### Paso 1 — Routing test (three-way ops taxonomy + docs)

Confirm the thing is actually a playbook. Use the three-way ops taxonomy (playbook /
runbook / SOP) plus the usual product-docs cases:

| If the draft answers… | It is a… | Route it to… |
|---|---|---|
| *When / why* to choose a path under uncertainty; decision tree, options, RACI; links to execute scripts | **Playbook** | continue here |
| Sequential, testable steps an engineer executes (incident, deploy, recover, scheduled ops) | **Runbook** | `/runbook-authoring` |
| How the **company** operates a recurring business process; no code required to understand | **SOP** | `/sop-authoring` |
| A one-off timeline of what happened in a single incident | **Post-mortem** | write a post-mortem; extract reusable judgment into a playbook here |
| *What* to build, for whom, and why | **PDR** (Product Decision Record) | `openspec/changes/{date-slug}/proposal.md` |
| *How* it's built technically (stack, schema, infra, APIs) | **ADR** (Architecture Decision Record) | `openspec/changes/{date-slug}/design.md` |
| How an end user *uses* the finished product | **Product Documentation** | product docs |
| How to security-test a system (authorized engagement) | **Security playbook** | `/pentest-playbook-setup` |

Rule of thumb: if the reader must **choose among branches** before acting, it is a
playbook. If they must **execute numbered steps** after the choice is made, it is a
runbook. If a software engineer is not required to understand it, it is an SOP.
Never treat "playbook" as a synonym for runbook or post-mortem.

### Paso 2 — Confirm the reusable class of problem

Ask (or infer) the class of situation the playbook covers — not one dated ticket.

Capture:

- **Trigger class** — the family of symptoms (e.g. "public edge timeout while origin is healthy").
- **Decision the reader must make** — diagnose vs recover vs escalate vs wait for mitigation.
- **Linked execute artifacts** — diagnose script, recover/repair script, optional
  bootstrap prerequisite, optional mitigate/guard that should make manual recover rare.
- **Roles** — who decides, who executes, who is informed. Roles, not named people.

If there is no execute artifact yet, say so and offer `/runbook-authoring` for the
*how* after this playbook names the branches. Do not invent a full runbook here.

### Paso 3 — Author the playbook

1. Read the template: `${CLAUDE_PLUGIN_ROOT}/references/09-playbook-template.md`.
2. Fill it. Writing discipline (the DNA of a real playbook):
   - **Artifact-type callout** — state this page is a playbook (when/why). Scripts and
     numbered recover steps belong in runbooks.
   - **Header + reader's summary** — a lead who reads nothing else can pick a branch.
   - **Artifact table by layer** — playbook (this doc) · diagnose (read-only) ·
     recover/repair (state change) · bootstrap (prerequisite) · mitigate (prevent
     recurrence). Filename pattern: `playbook-{slug}.md`, `diagnose-{slug}.sh`,
     `recover-{slug}.sh` (or `repair-`). Do not name a new markdown `runbook-*.md`
     when it is actually a playbook.
   - **Symptoms table** — healthy vs broken probes, just enough to *choose a branch*.
     Do not paste a full diagnose script.
   - **Decision tree** — the heart. Present-tense. Each leaf points at a section or
     a runbook, not a wall of commands.
   - **Option sections (§A, §B, …)** — *when this branch applies*, what it means,
     short read-only hints, then a pointer to the runbook/script. Short diagnose
     hints are OK; a click-by-click recover script is not.
   - **Verification gate** — how you know the *chosen path* succeeded (sustained
     healthy signal), not that a command exited 0.
   - **Out of scope** — follow-ups that look related but are a different class.
   - **Name owners by role, not person.**
   - **Dated incident callouts** as evidence for a branch (`> Seen YYYY-MM-DD: …`),
     not as a substitute post-mortem.
   - **Playbooks do not replace scripts.** If the how is missing, link a stub and
     send the execute work to `/runbook-authoring`.
   - **Mitigation is the goal** — after a durable guard exists, manual recover
     should become break-glass. The playbook stays for new root causes.
   - **Bilingual** (EN + ES) when the operating team is bilingual.
3. Write to `{playbooks-dir}/{slug}/playbook-{slug}.md`.

### Paso 4 — Quality checklist + 3 AM lead test

Run the **3 AM lead test**: "could an on-call lead who has never seen this system
pick the right branch from the decision tree + reader's summary alone, then hand
the execute work to the linked runbook?" If not, the gaps are usually a missing
branch, symptoms that do not discriminate, unnamed roles, or commands that belong
in a runbook. Fix them before finishing.

A playbook fails the test if it is secretly a runbook (numbered execute steps with
no decision tree) or secretly a post-mortem (one date, no reusable branches).

### Paso 5 — Confirmación

Present the deliverables and how to use them:

1. `playbook-{slug}.md` → "The playbook — when/why and which path to take."
2. Linked `diagnose-{slug}.sh` / `recover-{slug}.sh` (if they exist) → "The runbooks
   — execute after the tree picks a branch. Author or update them with
   `/runbook-authoring`."
3. Post-mortem pointer (if this class already fired once) → "The dated narrative
   stays in the post-mortem; reusable judgment lives here."

**Suggested next step:**
> "After the next real firing, fold the new branch or the wrong-path lesson back
> into the decision tree — a playbook improves every time someone almost chose
> the wrong option."

## Notas para el modelo

- `/playbook-authoring` (judgment), `/runbook-authoring` (execute), and
  `/sop-authoring` (company process) are siblings. The routing test is what
  separates them.
- `/pentest-playbook-setup` is a **security-test plan**, not an ops playbook.
  Do not fold pentest methodology into this template.
- Do not invent hostnames, vendor tickets, chat channels, or employee names.
  Use the Acme universe for examples (e.g. "AcmePay public-edge timeout playbook",
  "RapidEats checkout-queue playbook").
- Prefer linking versioned diagnose/recover scripts over pasting probe blocks
  into chat. The playbook names them; the runbook owns the commands.
