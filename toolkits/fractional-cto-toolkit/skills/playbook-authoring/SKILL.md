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
  plans (that is /assurance:pentest-playbook-setup).
---

# Playbook authoring

English ASD-STE100 skill body. Turns a class of operational uncertainty into a
reusable playbook. A lead uses it under pressure. This skill writes **judgment**.
It does not write an execute script.

Sibling skills:

- `/runbook-authoring` — how to execute after the choice
- `/sop-authoring` — steady company process with no engineering context

```
Playbook = WHEN / WHY / judgment under uncertainty. Narrative + options.
Runbook  = trigger-driven sequential steps. Bus-factor-1. Repo/infra OK.
SOP      = recurring company process. Roles, not named people. No code required.
```

A playbook answers which runbook or script to run and when. A runbook performs
how with guardrails. An SOP documents how the company runs a repeatable business
process. Dated post-mortems record one incident. They are not playbooks. Promote
the reusable decision tree here. Leave the timeline in the post-mortem.

## Language rule

Skill questions and working notes stay in **English**. Generated playbooks follow
the engagement language. Default English for public ops docs. Spanish for Costa
Rica engagements. Ask if unclear.

## Output directory

Resolve `{playbooks-dir}` in this order:

1. If a business brain exists (`business-brain/` or a vault with `_procedimientos/`),
   use `<brain-root>/_procedimientos/playbooks/`.
2. Otherwise use `./fractional-cto/playbooks/`.

## Skill flow

### Step 1 — Routing test

Confirm the artifact is a playbook. Use
[`references/authoring-taxonomy.md`](../../references/authoring-taxonomy.md).

Rule of thumb:

- Reader must choose among branches first → **playbook**
- Reader must run numbered steps after the choice → **runbook**
- No software engineer needed to understand it → **SOP**

Never treat "playbook" as a synonym for runbook or post-mortem.

If the type is unclear, run `/document-this` before you continue.

### Step 2 — Confirm the reusable class of problem

Ask or infer the class of situation. Do not bind the playbook to one dated ticket.

Capture:

- **Trigger class** — family of symptoms
- **Decision** — diagnose vs recover vs escalate vs wait for mitigation
- **Linked execute artifacts** — diagnose script, recover script, optional bootstrap,
  optional mitigate guard
- **Roles** — who decides, who executes, who receives notice. Roles, not people

If no execute artifact exists yet, say so. Offer `/runbook-authoring` for the how
after this playbook names the branches. Do not invent a full runbook here.

### Step 3 — Author the playbook

1. Read `${CLAUDE_PLUGIN_ROOT}/references/09-playbook-template.md`.
2. Fill it. Keep this discipline:
   - **Artifact-type callout** — this page is a playbook (when/why). Scripts belong
     in runbooks.
   - **Header + reader's summary** — a lead who reads nothing else can pick a branch.
   - **Artifact table by layer** — playbook, diagnose, recover, bootstrap, mitigate.
     Names: `playbook-{slug}.md`, `diagnose-{slug}.sh`, `recover-{slug}.sh`.
     Do not name a playbook `runbook-*.md`.
   - **Symptoms table** — healthy vs broken. Enough to choose a branch. No full
     diagnose script paste.
   - **Decision tree** — present tense. Each leaf points to a section or runbook.
   - **Option sections (§A, §B, …)** — when it applies, what it means, short
     read-only hints, then a runbook pointer. No click-by-click recover script.
   - **Verification gate** — sustained healthy signal. Not "command exited 0".
   - **Out of scope** — related follow-ups that are a different class.
   - **Owners by role**, not by person.
   - **Dated callouts** as branch evidence (`> Seen YYYY-MM-DD: …`). Not a
     post-mortem substitute.
   - **Playbooks do not replace scripts.** Link a stub. Send execute work to
     `/runbook-authoring`.
   - **Mitigation is the goal.** After a durable guard exists, manual recover
     becomes break-glass. The playbook stays for new root causes.
   - **Bilingual** (EN + ES) when the operating team is bilingual.
3. Write to `{playbooks-dir}/{slug}/playbook-{slug}.md`.

### Step 4 — Quality checklist + 3 AM lead test

Run the **3 AM lead test**. Could an on-call lead who never saw this system pick
the right branch from the decision tree and reader's summary alone? Then hand
execute work to the linked runbook?

If not, close the gaps. Usual gaps: missing branch, weak symptoms, unnamed roles,
or commands that belong in a runbook.

A playbook fails the test if it is secretly a runbook (numbered steps, no tree)
or secretly a post-mortem (one date, no reusable branches).

### Step 5 — Confirmation

Present the deliverables:

1. `playbook-{slug}.md` → when/why and which path to take
2. Linked `diagnose-{slug}.sh` / `recover-{slug}.sh` (if present) → execute after
   the tree picks a branch. Author or update with `/runbook-authoring`
3. Post-mortem pointer (if this class already fired) → dated narrative stays there.
   Reusable judgment lives here

**Suggested next step:**

> After the next real firing, fold the new branch or the wrong-path lesson back
> into the decision tree. A playbook improves every time someone almost chose the
> wrong option.

## Notes for the model

- `/playbook-authoring` (judgment), `/runbook-authoring` (execute), and
  `/sop-authoring` (company process) are siblings. The routing test separates them.
- `/assurance:pentest-playbook-setup` is a security-test plan. It is not an ops playbook.
- Do not invent hostnames, vendor tickets, chat channels, or employee names.
  Use the Acme universe for examples.
- Prefer linking versioned diagnose/recover scripts over pasting probe blocks
  into chat. The playbook names them. The runbook owns the commands.
