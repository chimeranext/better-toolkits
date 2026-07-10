# Runbook — {{TITLE}}

> **Trigger:** {{WHAT_FIRES_THIS}} · **Tier:** {{incident | operational}} · **Owner role:** {{ROLE}}
> **Applies to:** {{STACK / ENV SCOPE}}

> ⚠ **Reader's summary** — the whole runbook in one breath: what event fires it, what
> the procedure does, the one thing that most often goes wrong, and how you know it
> worked. A reader on-call at 3 AM should be able to act from this paragraph alone.

<!--
A runbook answers an EVENT ("the release is ready", "oomd is killing apps", "the nightly
scan failed"). An SOP answers a steady-state PROCESS ("how we onboard a client"). If this
has no trigger, it is probably an SOP → use /sop-authoring. Two runbook shapes below;
delete the one you are not using.
-->

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

### Verification & health checks
How you confirm the run succeeded (smoke checks, dashboards, expected metrics).

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
