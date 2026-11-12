<!--
  Bare outline: expected shape of an engagement playbook emit
  (playbook-{{SLUG}}.md). Practice SSOT with full judgment tree:
  01-takeover-playbook.md (not a template). This bare is for apprentices.
-->

# Playbook — Software project takeover / handover

> Artifact type: playbook. When/why/judgment. Not an SOP. Not a runbook.

| Field | Value |
|---|---|
| Class of problem | <!-- Fill --> |
| Decision the reader makes | High / medium / low branch. Legal+security before outreach? |
| Who decides | Fractional CTO / takeover lead |
| Who executes | Takeover lead. Client lead signs legal. Counsel on breach only |
| Applies to | <!-- Fill stack / project class --> |

> Reader's summary — <!-- One short paragraph: freeze order, fork before outreach, PSA later. -->

---

## Artifacts by layer

| Layer | File | When |
|---|---|---|
| Playbook | `playbook-{{SLUG}}.md` | Choose branch |
| Diagnose | `diagnose-project-takeover.sh` | Read-only probes |
| Recover | `recover-project-takeover.sh` | State change |
| Client guide | `client-guide-{{SLUG}}.md` | Lead Diátaxis pack |
| Legal | `legal-template-delivery-request-{{SLUG}}.md` | Signing meeting |
| Legal | `legal-template-breach-notice-{{SLUG}}.md` | Breach only |

---

## Symptoms

| Probe | Healthy | Broken |
|---|---|---|
| Prior developer relationship | | |
| Code ownership | | |
| Production users | | |
| IP / NDA paper | | |

---

## Decision tree

```text
Takeover required?
├─ Assessment missing? → /takeover-assessment or Path B. Return.
├─ High? → §A
├─ Medium? → §B
├─ Low? → §C
└─ New class → counsel. Add branch after post-mortem.
```

---

## §A High risk

**When:** <!-- Fill -->

### Next

```text
→ recover before outreach
→ signed delivery request
→ security freeze
→ client guide (urgent calm tone)
→ /contract-psa after pack
```

---

## §B Medium risk

**When:** <!-- Fill -->

### Next

```text
→ firm deadline + fork still before sole custody
→ /contract-psa after pack
```

---

## §C Low risk

**When:** <!-- Fill -->

### Next

```text
→ standard delivery + light clause
→ still emit breach-notice template unused
→ /contract-psa after pack
```

---

## Verification gate

<!-- Sustained: client owns git+deploy. Prior access revoked or time-boxed.
     Signed request or written ack. Wipe risk not on personal account. -->

---

## Out of scope

| Symptom | Action |
|---|---|
| SPMP / 16085 | `/contract-psa` Milestone 1 |
| Org GRC | `/iso31000` |
| Live outage | IR runbooks |
| Recurring HR process | `/sop-authoring` |
