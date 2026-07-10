# Runbook — {{TITLE}}

| Field | Value |
|---|---|
| **Process** | {{WHAT_THIS_DOES}} |
| **Trigger** | {{WHAT_FIRES_THIS}} — an incident, an alert, a release, a scheduled task |
| **Who can run it** | {{ROLE}} — a *role*, not a person; the point is to make this a team capability |
| **Stewards** | {{OWNING_ROLES}} |
| **Command / entrypoint** | {{SLASH_COMMAND_OR_SCRIPT}} (if any) |
| **Channels** | announce: {{CHANNEL}} · incidents: {{CHANNEL}} |
| **Applies to** | {{STACK / ENV SCOPE}} |

> ⚠ **Reader's summary** — the whole runbook in one breath: what fires it, what the
> procedure does, the one thing that most often goes wrong, and how you know it worked.
> A reader on-call at 3 AM with none of the tribal context should be able to act from
> this paragraph alone.

> **Bus-factor-1.** Written assuming the reader operates this alone, with zero tribal
> context. **If a step here disagrees with lived reality, reality wins — fix the page.**

<!--
A runbook is the TECHNICAL/engineering-operations counterpart of an SOP: a procedure for
release / deploy / incident response that needs repo/infra context to execute. An SOP is a
BUSINESS process anyone non-technical can run ("how we onboard a client") — no code. If the
draft needs no engineering context and is a steady-state business process → /sop-authoring.
Two runbook shapes below; delete the one you are not using.
-->

---

## Read this first — the mental model

<!-- The foundational thing the reader must internalize before any step. Common examples:
the branch model for a release runbook, or a "rule zero: merging is not deploying" for a
deploy runbook. State the one invariant that, if misunderstood, causes the incident this
runbook exists to prevent. -->

> **{{RULE_ZERO}}** — the single most-misunderstood invariant of this system, stated up
> front (e.g. "merging is not deploying: prod only changes on a manual dispatch from main").

---

## A) Incident / recovery runbook

### Trigger & symptom
The alert/error that fires this, in present tense. Paste the exact log line or symptom
the reader will see.

### Diagnosis — confirm this is the failure you hit
```bash
# read-only commands that prove the signature, with verbatim output as comments
{{DIAGNOSE_COMMANDS}}
```
> Ship this as a `diagnose-{{slug}}.sh` (read-only, no sudo; exit 0=no match, 1=detected,
> 2=doesn't apply) so it can be pasted into a support chat.

### Root cause
Layer by layer (`### Part 1 — …`), with the evidence trail. Distinguish high/medium/low
confidence honestly. Say which popular advice is wrong and why, if relevant.

### The fix
Prose first, then the numbered steps `repair-{{slug}}.sh` performs. Idempotent; backs up
before any destructive change; supports `NONINTERACTIVE=1`.

### Verification
```bash
# commands that confirm the fix, expected output as comments
{{VERIFY_COMMANDS}}
```

### Rollback
Explicit commands to undo, referencing `revert-{{slug}}.sh` if present.

### Tradeoffs & known constraints · Debugging lessons
Edge cases not fixed; transferable insights written to apply beyond this runbook.

---

## B) Operational / triggered runbook (release, deploy, scheduled ops)

### When this runs
The trigger (a release cut, a cron, a scaling event) and the preconditions that must hold
before starting.

### Roles
| Role | Responsibility in this run |
|---|---|
| {{ROLE}} | {{what they own}} |

### Procedure
Sequential steps; step N executable only after N-1. Each risky/outward step carries a gate:

1. **{{Step}}** — command/action · **Gate:** `[APPROVAL REQUIRED]` for irreversible or
   outward-facing actions (deploy to prod, publish, delete); none for read-only/automated.
2. …

> Mark automatable steps for the executable form. Human-approval gates are structural —
> an agent runtime pauses at them.

### Verification & health checks — prove it took effect
How you confirm the run *actually took effect in the target environment*, not just that
the command exited 0. "Merged" / "fixed on staging" is not "live in prod" — verify the
live revision/version, not the intent. Smoke checks, dashboards, the exact query that
proves the new state.

> **Real incident ({{DATE}}, {{VERSION}}).** {{What went wrong, why, and the one-line
> lesson}}. Real-incident callouts dated with a version are the most valuable part of a
> runbook — they encode a failure the reader would otherwise repeat.

### Rollback / abort
The exact steps to revert this run safely, and the point-of-no-return if any.

---

## Executable form (optional)

When steps are automatable, emit a runnable `{{slug}}-runbook.skill.md` with frontmatter
(`name`, `description` with the trigger, `required_tools`) and the numbered steps carrying
their gate markers — same executable discipline as `/sop-authoring`. The markdown is
authoritative: editing a step changes behavior.

## Related
- Sibling runbooks (adjacent layers/stages) with one line on when to use which.
- Upstream references (vendor docs, man pages, issue trackers) cited — and refuted where
  wrong.
- The SOP this runbook operationalizes, if any (`/sop-authoring`).
