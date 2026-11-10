# Playbook — Software project takeover / handover

> **Artifact type:** playbook (Markdown). **Not a template.** This file is the
> practice SSOT for when/why/judgment. `/project-takeover` may emit a
> case-specific `playbook-{slug}.md` that *adapts* branches to the engagement.
> It does not fill placeholders in this page.
>
> Sequential execute steps and shell scripts are **runbooks**
> (`/runbook-authoring`). A recurring company process with no engineering
> context required is an **SOP** (`/sop-authoring`).
>
> CTO-facing judgment layer of `/project-takeover`. **Not** an SOP. Legal pack
> and Diátaxis client guide are separate artifacts.

| Field | Value |
|---|---|
| **Class of problem** | Take technical ownership of a software project from a prior developer when cooperation, code ownership, or production risk is unclear |
| **Decision the reader makes** | Which handover branch to run (high / medium / low risk), and whether legal plus security freeze come before any outreach |
| **Who decides** | Fractional CTO / takeover lead |
| **Who executes** | Fractional CTO / takeover lead after the tree picks a branch. Client lead signs legal docs. Counsel sends breach notice only if needed |
| **Stewards** | Fractional CTO practice. Client technical lead |
| **Applies to** | Web, mobile, API, or monorepo projects with a prior individual or vendor developer |

> ⚠ **Reader's summary** — Before you talk to the prior developer, know the
> relationship, where the code lives, and whether production users are live.
> If the prior developer is hostile or missing, or the code sits in their
> personal account with live users, treat risk as **HIGH**. Freeze legal and
> security first. Fork or back up before outreach. Then run the signed delivery
> meeting. Do not start SPMP or ISO/IEC/IEEE 16085 work here. That is PSA
> Milestone 1 after `/contract-psa`.

---

## Artifacts (by layer)

| Layer | File | When |
|---|---|---|
| **Playbook** (this doc) | `references/01-takeover-playbook.md` (bare: `01-takeover-playbook-bare.md`) | Choose high / medium / low branch |
| **Diagnose** | `diagnose-project-takeover.sh` (stub under `references/project-takeover/`) | Read-only probes |
| **Recover** | `recover-project-takeover.sh` (stub under `references/project-takeover/`) | Fork/backup, rotate credentials, move DNS |
| **Bootstrap** | `/takeover-assessment` under `./fractional-cto/assessment/` | Risk context before this tree |
| **Mitigate** | Signed delivery request + credentials on client accounts | Prevent hostage or wipe |
| **Legal (pack)** | `legal-template-delivery-request-{slug}.md`, `legal-template-breach-notice-{slug}.md` | Meeting signature. Counsel on breach |
| **Client guide (Diátaxis ×4)** | `client-guide-{slug}.md` | Explanation, Tutorial, How-to, Reference |

Dated handover notes point *at* this playbook. They do not replace it.

---

## Symptoms

| Probe | Healthy | Broken (typical) |
|---|---|---|
| Prior developer relationship | Cooperative answers in writing | Hostile, silent, or demands extra pay |
| Code ownership | Repo and CI under client org | Repo under personal account or unknown |
| Production users | None, or backups verified under client control | Live users while destroy or wipe risk is open |
| IP / NDA paper | Assignment and NDA on file | Missing or ambiguous IP assignment |

**Conclusion when relationship is hostile or missing AND code is not on client
accounts:** run **§A High risk**. Do not use a friendly handover timeline.

---

## Decision tree (operator)

```text
Takeover required?
├─ Assessment missing?
│    → Run /takeover-assessment or Path B interview in /project-takeover. Then return.
├─ Hostile or no contact, OR code on prior-dev account with live users, OR 2+ high threats?
│    → §A High risk. Legal + security before outreach. See §A.
├─ Neutral prior developer and code on their account, OR one high threat, OR weak IP paper?
│    → §B Medium risk. Firm deadline + negotiated transfer. See §B.
├─ Cooperative prior developer, code on client accounts, clear IP, no high threats?
│    → §C Low risk. Standard handover. See §C.
└─ None match / new threat class
     → Escalate to counsel. Write a new branch after the post-mortem.
```

---

## Prerequisites

1. **Bootstrap:** `./fractional-cto/assessment/` from `/takeover-assessment`, or the
   Path B answers from `/project-takeover` (relationship, ownership, live users).
2. **Diagnose** (read-only): confirm org ownership of git, cloud, DNS, and data.
   Author probes with `/runbook-authoring` if missing.
3. **Do not** open SPMP / 16085 fill here. After the pack ships, run `/contract-psa`
   (Milestone 1 Discovery).

---

## §A — High risk

**When this branch applies:** hostile or no-contact prior developer. Or code on
their personal account with live users. Or missing IP assignment with sensitive
data. Or two or more high-probability threats (destroy, retain, exfiltrate,
sabotage, data theft, disrupt, extort).

### Meaning

The prior developer can still destroy, hold, or leak the system. Outreach without
a fork or backup and without legal paper raises that chance. Speed is days, not
weeks.

### Next

```text
→ recover-project-takeover.sh   (fork/backup BEFORE outreach. Dry-run first)
→ Legal checklist + signed delivery request (pack)
→ Security freeze (credential rotation, access revoke) before broad notice
→ Client guide with urgent but calm tone
→ After pack: /contract-psa (Hito 1 SPMP + 16085) — not part of this playbook
```

> DECISION POINT: Who signs the delivery request for the client, and who holds
> counsel contact if the breach-notice path opens?

---

## §B — Medium risk

**When this branch applies:** neutral prior developer with code on their account.
Or IP contract exists but is ambiguous. Or live users without verified backups.
Or exactly one high-probability threat.

### Meaning

Cooperation is possible but incomplete. You need a firm written deadline and
proof of transfer. Timeline is about one to two weeks.

### Next

```text
→ Negotiate transfer window in the delivery request
→ Fork/backup still before trusting sole custody
→ Moderate legal clause in the signed request
→ Client guide: professional tone, clear milestones
→ After pack: /contract-psa
```

---

## §C — Low risk

**When this branch applies:** cooperative prior developer. Code already on client
accounts (or transfer confirmed). Clear IP assignment. No high-probability threats.

### Meaning

Standard handover. Still document access and rotate shared secrets. Timeline is
about two to three weeks.

### Next

```text
→ Standard delivery request + light legal clause
→ Access inventory and knowledge transfer sessions
→ Client guide: calm, routine tone
→ Breach-notice template still emitted (unused unless breach)
→ After pack: /contract-psa
```

---

## Verification gate

**Pass:**

1. Client org owns the canonical git remote and deploy credentials.
2. The takeover lead revokes or time-boxes prior developer access.
3. The client lead signs the delivery request, or (low risk) both sides write and
   acknowledge the transfer.
4. Production destroy or wipe is no longer in one person’s personal account.

Not enough: “we had a friendly call” or “they promised to send a zip.”

---

## Out of scope (separate follow-ups)

| Symptom | Why it is not this playbook | Action |
|---|---|---|
| Need SPMP / ISO/IEC/IEEE 16085 plans | Project governance after commercial close | `/contract-psa` Hito 1 → `/software-project-management-plan/authoring` + `/software-risks-authoring-16085` |
| Org-wide risk register | Enterprise GRC, not project handover | `/iso31000` |
| Incident while production is already on fire | Different class (live outage) | `/runbook-authoring` / IR playbooks |
| Recurring company hiring or offboarding process | Steady-state HR/ops, not a project event | `/sop-authoring` |

---

## Related

- `/project-takeover` — conversational pack (adapts this playbook + client guide + legal).
- `/takeover-assessment` — bootstrap threat context.
- `/contract-psa` — remediation engagement and Milestone 1 governance.
- `/playbook-authoring` / `/runbook-authoring` — improve diagnose/recover scripts for this slug.
- `/document-this` — dispatcher. This page is already typed as a playbook.
