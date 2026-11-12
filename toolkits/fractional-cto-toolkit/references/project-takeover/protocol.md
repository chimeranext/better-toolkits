# Skill `project-takeover` — protocol SSOT

English ASD-STE100 SSOT. Run
`make-no-mistakes-toolkit/references/explain/scripts/ste-lint.py` on this file
before merge. Engagement chat for Costa Rica may use Spanish. Keep filenames and
this protocol in English.

---

# Project takeover pack generator

Run a conversational interview. Classify the path. Ask one question at a time.
Use fixed options when you can list answers as a/b/c/d. Calibrate case risk.
Emit the handover pack under `./fractional-cto/takeover/` only after an explicit
yes.

## Outputs (always four) — slug at the end

| Emitted file | Type | Audience | Toolkit SSOT |
|---|---|---|---|
| `playbook-{slug}.md` | Playbook | CTO | `01-takeover-playbook.md` (bare: `01-takeover-playbook-bare.md`) |
| `client-guide-{slug}.md` | Diátaxis ×4 | Client lead | `02-client-guide.md` (bare: `02-client-guide-bare.md`) |
| `legal-template-delivery-request-{slug}.md` | Legal / signature | Prior developer + lead | `legal-template-delivery-request.md` (bare: `…-bare.md`) |
| `legal-template-breach-notice-{slug}.md` | Legal | Counsel | `legal-template-breach-notice.md` (bare: `…-bare.md`) |

**Bare files** are English outlines. Apprentices use them to see expected shape in
better-toolkits.

**Fill SSOTs** (`02-client-guide.md`, `legal-template-*.md`) use
`{{PLACEHOLDERS}}`. Do not use `[[…]]` for fills. Those marks are Obsidian
wikilinks.

The playbook SSOT is **not** a template. Click-by-click steps belong in runbooks
from `/runbook-authoring` (`diagnose-` / `recover-`).

## Out of scope

- Do not emit SPMP (ISO/IEC/IEEE 16326) or 16085 risk plans. Handover is not
  project governance.
- Do not run a deep risk assessment. That is `/takeover-assessment`.
- Do not emit commercial contracts. Use `/contract-nda`, `/contract-psa`, or
  `/contract-retainer`.
- Do not route the four pack files through `/document-this` or `/document-it`.

**Next step after the pack:** `/contract-psa`. The PSA anchors Milestone 1
Discovery (SPMP + 16085). Remediation governance is PSA work. It is not takeover
work.

## Language rules

- Filenames for SSOT, bare, and emit files stay English.
- Bare files (`*-bare.md`) stay English STE100 (apprentice reference).
- Playbook SSOT (`01-takeover-playbook.md`) stays English STE100. It is not a
  template.
- Emitted client guide and legal files default to Spanish for Costa Rica
  engagements. Keep common technical terms in English.
- Fill SSOTs keep English `{{PLACEHOLDER}}` tokens.
- Emitted `playbook-{slug}.md` follows the engagement language. Keep branches
  §A / §B / §C.

## Output directory

Write all four files under `./fractional-cto/takeover/` in the current working
directory.

---

## HARD-GATE (mandatory)

```
HARD-GATE
Do NOT write, scaffold, or overwrite any of the 4 takeover files until you have
presented the pack plan (Step 3) and the human partner has given an explicit yes.
Asking questions and classifying risk is allowed. Emitting docs is not.
```

Never skip the approval gate. Do not present the plan and write files in the same
message.

---

## Skill flow

### Step 0 — Classify the path (before the first question)

Inspect `./fractional-cto/assessment/` (output of `/takeover-assessment`). State
the path out loud so the human can fix it.

- **Path A — assessment-available:** usable prior assessment exists. Confirm and
  fill gaps. Do not re-ask known facts.
- **Path B — standalone:** no usable assessment. Run the four-question interview.

If A vs B is unclear, choose B. If Path A later shows a broken or contradictory
assessment, switch to B and say so.

Example announcement:

> Path A — assessment-available: found `./fractional-cto/assessment/`. I will
> confirm risk and gaps. I will not redo the full interview.

### Step 1 — Interview (one question per message)

1. Ask one question per message. Split deep topics.
2. Prefer fixed options (a/b/c/d) when you can list the answers.
3. If the human already gave a fact, extract it. Do not ask again.
4. Do not ask about SPMP / 16085 here. That lives under `/contract-psa`.

#### Path A — assessment-available

Load from the assessment: project name, risk level, threats, prior-developer
relationship, code ownership, live users when present.

Confirm with one fixed-option question:

> I found your prior assessment.
> - Project: **{NAME}**
> - Risk: **{LEVEL}**
> - Relationship / ownership: **{SUMMARY}**
>
> Does this match?
> - a) Yes — continue with this context
> - b) Adjust — I will say what to change
> - c) Ignore assessment — switch to standalone interview (Path B)

If **b**, ask one adjustment at a time. If **c**, continue as Path B.

When context is complete, state the risk level with a short business reason
(money, time, reputation). Then go to Step 2.

#### Path B — standalone

Ask **one at a time** in this order. Skip answers already given.

**Question 1: Project name** (open)

> What is the project name?

**Question 2: Relationship with the prior developer** (fixed)

> How is the relationship with the prior developer?
> - a) Cooperative — willing to help
> - b) Neutral — answers but is not proactive
> - c) Contentious — does not cooperate. Risk is open
> - d) No contact — the developer is gone

**Question 3: Code ownership** (fixed)

> Where is the code?
> - a) On the client account (client is owner)
> - b) On the prior developer personal account
> - c) Unknown / no access

**Question 4: Live users** (fixed)

> Are real users on the production product?
> - a) Yes
> - b) No

**Simplified risk matrix:**

| Relationship | Code on account of… | Base risk |
|---|---|---|
| Contentious / No contact | Developer / Unknown | **HIGH** |
| Contentious / No contact | Client | **MEDIUM** |
| Neutral | Developer / Unknown | **MEDIUM** |
| Neutral | Client | **LOW** |
| Cooperative | Developer / Unknown | **MEDIUM** |
| Cooperative | Client | **LOW** |

**Modifier:** If production users are live, raise risk one level (LOW→MEDIUM,
MEDIUM→HIGH). HIGH stays HIGH.

State the level with a short reason. Then Step 2.

### Step 2 — Optional scope (only if it changes the pack)

If platforms are still unclear (web / mobile / infra), ask one optional fixed
question. Skip when already known.

> Which surfaces are in scope for the takeover? (multi-select is OK)
> - a) Backend / API / web
> - b) Mobile (Apple Developer / Google Play)
> - c) Infra / cloud accounts
> - d) Not sure — assume typical web+infra. Mark mobile N/A

Use the answer to **drop** playbook branches that do not apply. Do not add
complexity.

### Step 3 — Pack plan + approval gate

Before any write, present a short plan in chat and **STOP**:

> I will generate the handover pack under `./fractional-cto/takeover/`:
>
> 1. `playbook-{slug}.md` — CTO playbook (when/why)
> 2. `client-guide-{slug}.md` — Diátaxis guide for the lead
> 3. `legal-template-delivery-request-{slug}.md` — signed at the meeting
> 4. `legal-template-breach-notice-{slug}.md` — counsel draft if they breach
>
> Calibration: risk **{LEVEL}** · project **{NAME}** · path **{A|B}**
>
> This is operational handover. It is not project governance (SPMP / 16085).
> That starts later with `/contract-psa` (Milestone 1).
>
> Generate the four files now?
> - a) Yes — generate now
> - b) Adjust something first (say what)
> - c) Cancel

Only **a)** (or an unambiguous yes) continues to Step 4. For **b)**, ask one
adjustment at a time. Then show the plan again. For **c)**, stop with no writes.

### Step 4 — Emit the four documents (post-approval only)

Create `./fractional-cto/takeover/` if needed. Emit in sequence from
`${CLAUDE_PLUGIN_ROOT}/references/`. Replace every `{{PLACEHOLDER}}`. Leave no
`{{…}}` in the emit. Point apprentices at bare files. Do **not** copy bare files
to the client folder.

#### 4.1 CTO playbook

1. SSOT: `01-takeover-playbook.md` (apprentice bare: `01-takeover-playbook-bare.md`)
2. Adapt branches §A / §B / §C. Drop N/A rows. Use roles. Never use person names.
   Keep dated callouts as evidence only.
3. Write: `./fractional-cto/takeover/playbook-{slug}.md`
4. Run the 3 AM lead test. Link
   `references/project-takeover/diagnose-project-takeover.sh`,
   `recover-project-takeover.sh`, and `project-takeover-runbook.md`.

#### 4.2 Client guide — Diátaxis ×4

1. Fill SSOT: `02-client-guide.md` (bare: `02-client-guide-bare.md`)
2. Fill `{{PROJECT_NAME}}`, `{{RISK_BLOCK}}`, `{{TIMELINE_BLOCK}}`
3. Tone: HIGH urgent-calm. MEDIUM professional. LOW routine. Keep FAQ out of
   How-to. Drop N/A rows.
4. Write: `./fractional-cto/takeover/client-guide-{slug}.md`

#### 4.3 Formal delivery request

1. Fill SSOT: `legal-template-delivery-request.md` (bare: `…-bare.md`)
2. Firm deadlines. Legal clause by risk (LOW / MEDIUM / HIGH. Default Costa Rica).
3. Signature block for both parties. Do not reveal CTO strategy (fork / secrets).
4. Write: `./fractional-cto/takeover/legal-template-delivery-request-{slug}.md`

#### 4.4 Breach notice (counsel)

Always emit (even LOW). Only counsel sends it after a signed-deadline breach.

1. Fill SSOT: `legal-template-breach-notice.md` (bare: `…-bare.md`)
2. Keep the DRAFT disclaimer. Keep `[COUNSEL: …]` markers. Default jurisdiction:
   Costa Rica.
3. Write: `./fractional-cto/takeover/legal-template-breach-notice-{slug}.md`

### Step 5 — Maintenance plan, then transition plan

The questionnaire is finished. The four files are written. Invoke the next two skills in this order. Do not start them during the questions.

1. Invoke `/maintenance-plan-ieee14764`. It writes `./fractional-cto/takeover/maintenance-plan-{slug}.md` (ISO/IEC/IEEE 14764:2022).
2. When that file exists, invoke `/transition-plan-ieee12207`. It writes `./fractional-cto/takeover/transition-plan-{slug}.md` (ISO/IEC/IEEE 12207:2026).

This skill does not write those two files itself.

### Step 6 — Post-emit confirmation

1. `playbook-{slug}.md` → CTO playbook
2. `client-guide-{slug}.md` → client lead
3. `legal-template-delivery-request-{slug}.md` → meeting / signature
4. `legal-template-breach-notice-{slug}.md` → counsel on breach

**Sequence:** lead reads the guide. CTO picks the branch and runs recover
**before** the meeting. Sign the delivery request. On breach, counsel uses the
breach notice.

**Required close line:**

> Handover pack is ready. To formalize remediation and project governance
> (SPMP 16326 + 16085 risks in Milestone 1), use `/contract-psa`. This pack does
> not replace that step.

---

## Notes for the model

- Classify the path before the first question. Announce it.
- One question per message. Prefer fixed options when you can list answers as
  a/b/c/d.
- HARD-GATE: without an explicit yes to the Step 3 plan, write zero files.
- This skill does not deep-assess risk. That is `/takeover-assessment`.
- This skill does not emit SPMP or 16085. `/contract-psa` anchors Milestone 1.
- After the questionnaire and the four files, invoke `/maintenance-plan-ieee14764`, then `/transition-plan-ieee12207`. This skill does not write those two plans.
  Fill authors are `/software-project-management-plan-authoring-ieee16326` and
  `/software-risks-authoring-ieee16085`.
- This skill does not emit contracts. Use `/contract-nda`, `/contract-psa`,
  `/contract-retainer`.
- Always include a legal clause in the delivery request (Approach B).
- Always emit the breach notice. Even for low risk.
- English filenames. Slug at the end of emits. Do not copy bare files to the
  client.
- Playbook SSOT is not a template. Adapt by dropping unused branches. Do not
  invent placeholders or click-by-click steps.
- If the human already stated facts, reuse them. Do not re-ask.
- Playbook tone: direct judgment under uncertainty. Not a script.
- Apply the 3 AM lead test before you close Step 4.1.
