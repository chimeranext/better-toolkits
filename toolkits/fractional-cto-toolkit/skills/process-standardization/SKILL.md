---
name: process-standardization
description: >
  Turns tribal, undocumented team knowledge into one versioned standard per process.
  Use this skill when the user mentions "standardize a process", "document how we do X",
  "process inventory", "our team does this differently every time", "capture this workflow",
  "nobody knows how this works except one person", "onboarding is inconsistent", "SOP for our
  support/deploy/billing process", or any situation where a fractional CTO needs to surface,
  capture, and version a client's operational processes. This is the FRONT DOOR of the
  process-engineering pipeline — it feeds /automation-triage and /sop-authoring.
  NOT for risk evaluation of a project takeover (that is /takeover-assessment) nor for
  authoring the final SOP document (that is /sop-authoring).
---

# Process Standardization

Surfaces a client's operational processes, decides which ones are worth standardizing first, and
captures the *current* state of each — turning "the way Fer does it" into a versioned standard that
someone else can pick up. This is the entry point of the process-engineering pipeline:

```
process-standardization  →  automation-triage  →  sop-authoring
  (discover + capture)       (decide the how)      (write the SOP)
```

## Language rule

The skill's questions and working notes are in **English**. Generated deliverables follow the
**engagement's working language** — English by default, Spanish for Costa Rica engagements (matching
the contract skills). Confirm with the user if unclear.

## Output directory

All files go in `./fractional-cto/sops/{slug}/` within the current working directory, where `{slug}`
is the process name in kebab-case. This directory is the shared data flow for the whole pipeline —
`/automation-triage` and `/sop-authoring` read from and write to the same place.

## Flujo del skill

### Paso 1 — Process inventory

Interview to surface the candidate processes. Ask ONE question at a time. If the user already
described their operation in the conversation, do not repeat — extract from what they said.

**Question 1: What processes exist?**
> Which repeatable processes does the team run? List them by name — think of anything that happens
> again and again (client onboarding, deploy, incident response, monthly billing, content review).

**Question 2: Score each candidate.**
For every process the user names, capture three signals (1–5 scale):

| Signal | Question | Why it matters |
|---|---|---|
| **Frequency** | How often does this run? | High-frequency pain compounds. |
| **Variability** | Does everyone do it differently? | High variability = quality defects. |
| **Pain** | What breaks when it goes wrong? | High pain = high standardization ROI. |

Priority score = Frequency × Variability × Pain. Rank the list. Recommend standardizing the top 1–3
first — do not try to boil the ocean.

> **DECISION POINT:** confirm with the user which process(es) to standardize now. Everything below
> runs per selected process.

Write the ranked inventory to `./fractional-cto/sops/{slug}/{slug}-inventory.md` (or a shared
`_inventory.md` when covering several processes at once).

### Paso 2 — Capture the current state

For the selected process, capture how it is done *today* — not how it should ideally be done. Two
capture modes (use whichever the user has):

**Mode A — Best-performer walkthrough (tacit knowledge).**
Interview the person who runs the process best. Walk them through it step by step:
> "Take me from the very first trigger to the finished result. What do you do first? What tool? Then
> what? How do you know that step worked? What decides whether you go left or right here?"

Capture each step as: **action → tool → success criterion → decision/branch (if any)**. Push for
real tool names, real numbers, real thresholds.

**Mode B — Import existing docs.**
If the client already has notes, a checklist, a Notion page, or a PDF, read it and restructure it
into the same ordered step list. Flag gaps where the doc is vague ("coordinate with the vendor" is
useless; "email the vendor 14 days out with headcount" is a step).

> **LESSON LEARNED:** the best-performer's process is rarely the documented one. Capture what they
> *actually* do, including the workarounds — that is the real standard.

Write the raw ordered capture to `./fractional-cto/sops/{slug}/{slug}-capture.md`:
a numbered step list, each step tagged with its tool and success criterion, plus a short list of
open questions / gaps discovered during capture.

### Paso 3 — Version the standard

Establish the single-source-of-truth discipline:

1. **One published standard per process.** If two versions exist (a Drive doc and tribal knowledge),
   this capture supersedes both.
2. **Semantic version.** Start at v1.0. Note the version and date at the top of the capture.
3. **Revision-history stub.** Seed the table `sop-authoring` will carry forward.

> **SCALE NOTE:** a two-person team can keep the standard in one markdown file; a 20-person team
> needs an owner-by-role and a review cadence. Match the ceremony to the team size.

### Paso 4 — Handoff

Present the two deliverables and route the user onward:

1. `{slug}-inventory.md` → "Your ranked process backlog — what to standardize and in what order."
2. `{slug}-capture.md` → "The captured current state of `{slug}`, ready to turn into an SOP."

**Suggested next step:**
> "Run `/automation-triage` to decide, step by step, what should stay human vs. what a bot or an AI
> agent can take over. Then `/sop-authoring` writes the final SOP — and an executable version if any
> steps are automatable."

## Notas para el modelo

- This skill does NOT write the final SOP — that is `/sop-authoring`. It produces the *inventory* and
  the *capture*, the raw inputs.
- This skill does NOT decide automation — that is `/automation-triage`. Capture the current state
  faithfully; leave the "should a bot do this?" judgment to the triage step.
- The inventory scoring (Frequency × Variability × Pain) mirrors the risk-matrix discipline in
  `/takeover-assessment`: a structured interview producing a ranked, defensible verdict.
- Capture the process as it IS, not as it SHOULD be. Improvement suggestions go in the open-questions
  list, not silently baked into the steps.
- Use the Acme universe for any illustrative examples (e.g. "AcmeLegal's client-intake process",
  "RapidEats' refund workflow").
