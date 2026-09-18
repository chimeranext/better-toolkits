# Playbook — {{TITLE}}

> **Artifact type:** playbook (Markdown). When/why/judgment. Sequential execute
> steps and shell scripts are **runbooks** — see `/playbook-authoring` vs
> `/runbook-authoring`. A recurring company process with no engineering context
> required is an **SOP** (`/sop-authoring`).

| Field | Value |
|---|---|
| **Class of problem** | {{WHAT_UNCERTAINTY_THIS_COVERS}} |
| **Decision the reader makes** | {{DIAGNOSE_VS_RECOVER_VS_ESCALATE}} |
| **Who decides** | {{ROLE}} — a *role*, not a person |
| **Who executes** | {{ROLE}} after the tree picks a branch |
| **Stewards** | {{OWNING_ROLES}} |
| **Applies to** | {{STACK / ENV SCOPE}} |

> ⚠ **Reader's summary** — the whole playbook in one breath: the class of
> symptom, the one decision that matters, the usual wrong turn, and how you
> know the chosen path worked. A lead on-call at 3 AM should pick a branch
> from this paragraph + the tree, then open the linked runbook.

<!--
A playbook is the WHEN/WHY counterpart of a runbook. It does not replace
diagnose/recover scripts. If the draft is numbered execute steps with no
decision tree → /runbook-authoring. If it is a dated single-incident narrative
→ write a post-mortem and extract reusable branches here.
-->

---

## Artifacts (by layer)

| Layer | File | When |
|---|---|---|
| **Playbook** (this doc) | `playbook-{{slug}}.md` | Decide diagnose vs recover vs escalate |
| **Diagnose** | `diagnose-{{slug}}.sh` | Read-only probes — confirm the signature |
| **Recover** | `recover-{{slug}}.sh` (or `repair-`) | Restore service now (break-glass) |
| **Bootstrap** | `{{prerequisite-script}}` | Missing context before diagnose/recover |
| **Mitigate** | `{{guard-or-ci-job}}` | Prevent the same root cause — goal: no repeat manual recover |

Dated incident notes / post-mortems point *at* this playbook; they do not replace it.

---

## Symptoms

| Probe | Healthy | Broken (typical) |
|---|---|---|
| {{PUBLIC_OR_USER_VISIBLE_CHECK}} | {{OK}} | {{FAIL}} |
| {{ORIGIN_OR_IN_CLUSTER_CHECK}} | {{OK}} | {{MAY_STILL_BE_OK}} |
| {{DEPENDENCY_CHECK}} | {{OK}} | {{FAIL}} |

**Conclusion when {{DISCRIMINATOR}}:** {{WHAT_THAT_MEANS}} — not {{THE_USUAL_WRONG_GUESS}}.

Keep this table short enough to *choose a branch*. Full probe blocks belong in
`diagnose-{{slug}}.sh`.

---

## Decision tree (operator)

```text
{{PRIMARY_SYMPTOM}}?
├─ {{CHECK_A}}
│    → {{BRANCH_A}}. See §A.
├─ {{CHECK_B}}
│    → {{BRANCH_B}}. See §B.
├─ {{CHECK_C}}
│    → {{BRANCH_C}}. See §C.
└─ {{NONE_MATCH}}
     → Escalate / write a new branch after the post-mortem.
```

---

## Prerequisites

Context the decision-maker needs (access, env selector, sibling checkout). Not
the recover script.

1. **Diagnose** (read-only): `./diagnose-{{slug}}.sh` — author via `/runbook-authoring`.
2. **Recover** (dry-run first): `./recover-{{slug}}.sh --dry-run` then the real run.

---

## §A — {{BRANCH_A_NAME}}

**When this branch applies:** {{DISCRIMINATING_SIGNAL}}.

> Seen {{YYYY-MM-DD}}: {{one-line evidence that this branch is real}}.

### Meaning

{{What is actually broken, in one paragraph. Honest confidence.}}

### Next

Hand off to the recover/diagnose runbook. Do **not** paste a full execute script
here — link it.

```text
→ diagnose-{{slug}}.sh   (read-only confirm)
→ recover-{{slug}}.sh    (state change; dry-run first)
```

---

## §B — {{BRANCH_B_NAME}}

**When this branch applies:** {{DISCRIMINATING_SIGNAL}}.

### Meaning

{{...}}

### Next

{{pointer to the matching runbook or escalate path}}

---

## §C — {{BRANCH_C_NAME}}

**When this branch applies:** {{DISCRIMINATING_SIGNAL}}.

### Meaning

{{...}}

### Next

{{pointer}}

---

## Verification gate

How you know the *chosen path* worked — a sustained healthy signal in the
environment users hit, not "the script exited 0".

**Pass:** {{SUSTAINED_HEALTHY_SIGNAL}}.

---

## Out of scope (separate follow-ups)

| Symptom | Why it is not this playbook | Action |
|---|---|---|
| {{LOOKS_RELATED}} | {{DIFFERENT_CLASS}} | {{OTHER_DOC_OR_TICKET}} |

---

## Related

- Diagnose / recover runbooks for this slug (`/runbook-authoring`).
- The SOP this class of work sits under, if any (`/sop-authoring`).
- Post-mortem(s) that fed this tree — dated, one incident each.
- Mitigation / guard that should make §recover rare.
