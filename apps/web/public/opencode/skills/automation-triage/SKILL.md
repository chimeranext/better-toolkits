---
name: automation-triage
description: >
  Decides, step by step, how a process should run: human, RPA (robotic process automation),
  AI agent, or a hybrid. Use this skill when the user mentions "should we automate this",
  "RPA vs AI", "what can a bot do vs a person", "automation strategy", "can AI do this step",
  "attended vs unattended", "where do we add AI", "automate our workflow", or any situation where a
  fractional CTO needs to advise on the execution model of a captured process. Sits in the middle of
  the process-engineering pipeline: it reads a capture from /process-standardization and produces the
  per-step verdict that parameterizes the SOP written by /sop-authoring.
  NOT for evaluating takeover risk (that is /takeover-assessment) nor for writing the SOP document
  (that is /sop-authoring).
---

# Automation Triage

Takes a captured process and routes each step to the right execution model — keeping humans where
judgment matters, handing rule-based drudgery to RPA, and giving genuinely ambiguous work to an AI
agent. The output is a per-step verdict that becomes the execution model of the SOP:

```
process-standardization  →  automation-triage  →  sop-authoring
  (discover + capture)       (decide the how)      (write the SOP)
```

## Language rule

The skill's questions and working notes are in **English**. Generated deliverables follow the
**engagement's working language** — English by default, Spanish for Costa Rica engagements. The
per-step *rationale* must be legible to a non-technical executive: cost, error rate, brittleness,
maintenance — not RPA jargon.

## Output directory

Resolve the pipeline directory `{sops-dir}` first, in this order:

1. If a business brain exists in the working directory (a `business-brain/` folder, or a vault
   root with `_procedimientos/` — see `/business-brain-setup`), then
   `{sops-dir}` = `<brain-root>/_procedimientos/`. SOPs that belong to a business LIVE in its
   business brain; that folder is their canonical home.
2. Otherwise (no brain yet, e.g. a client engagement without one),
   `{sops-dir}` = `./fractional-cto/sops/`.

## Flujo del skill

### Paso 1 — Obtener el proceso

Two paths, mirroring `/project-takeover`:

**Path A (preferred): capture available.**
Check for `{sops-dir}/{slug}/{slug}-capture.md` from `/process-standardization`. If it
exists, load the ordered step list and confirm with the user:
> "I found your captured process for **{slug}** — {N} steps. Triaging each one. Correct?"

**Path B (standalone): no capture.**
Run a condensed interview. Ask the user to list the process steps, and for each: what triggers it,
what tool it touches, and how often it runs.

### Paso 2 — Triage each step

Score every step on four axes, then read the verdict off the matrix.

| Axis | Question | Low ↔ High |
|---|---|---|
| **Volume / frequency** | How often does this step run? | rarely ↔ constantly |
| **Rule-determinism** | Is the logic fixed rules, or does it need interpretation? | judgment ↔ deterministic |
| **Judgment / ambiguity** | Does it need creativity, strategy, or reading a messy situation? | none ↔ high |
| **System / UI stability** | Do the tools/screens it touches change often? | volatile ↔ stable |

**Verdict rules:**

| Condition | Verdict |
|---|---|
| High volume · deterministic · low judgment · **stable** systems | **RPA — unattended** (bot runs alone) |
| High volume · deterministic · low judgment · needs a human trigger/checkpoint | **RPA — attended** (bot + human in real time) |
| Deterministic core but with ambiguous inputs or exceptions | **Hybrid** (RPA for the rote part, human/AI for exceptions) |
| Ambiguous, unstructured, or interpretation-heavy — but not high-stakes judgment | **AI agent** (plans, decides, adapts) |
| AI does the draft, a human approves/decides | **Human + AI** (AI proposes, human disposes) |
| Strategy, creativity, high-stakes judgment, or relationship work | **Human** (keep it) |

> **DECISION POINT:** where a step sits between two verdicts, default to the one with the human closer
> to the loop. It is cheaper to remove a human gate later than to recover from an unattended bot that
> ran wrong 10,000 times.

Produce a per-step verdict table.

### Paso 3 — Executive rationale

For each non-human verdict, write a one-line rationale a non-technical decision-maker can act on. Use
business terms:

- **Why this and not a person:** [cost / speed / error-rate gain].
- **Why RPA and not AI (or vice versa):** RPA mimics fixed clicks and keystrokes cheaply but is
  *brittle* — it breaks when a screen changes. AI handles ambiguity and adapts but costs more per run
  and needs guardrails. Reserve humans for judgment, creativity, and relationships.

Frame the whole thing as an **incremental transformation**, not a big-bang: which one step to
automate first (highest volume × most deterministic), then the next. This staged framing is how a
manual process becomes AI-assisted one step at a time.

### Paso 4 — Risk callouts

Flag the traps before they bite:

> **SCALE NOTE:** RPA bots are brittle. A vendor UI change silently breaks an unattended bot; budget
> for monitoring and IT maintenance from day one, or the "automation" becomes a hidden outage.

> **LESSON LEARNED:** never make a step unattended until it has run attended long enough to trust it.
> Attended → hybrid → unattended is the safe promotion path.

Note any step where automating it would remove a human check that catches expensive mistakes — those
stay `Human + AI` even if technically automatable.

### Paso 5 — Handoff

Write the verdict to `{sops-dir}/{slug}/{slug}-triage.md`: the per-step verdict table, the
executive rationale, the risk callouts, and a recommended automation sequence (what to do first).

**Suggested next step:**
> "Run `/sop-authoring` to write the SOP. Steps you triaged as RPA or AI become the executable
> version of the SOP (`{slug}-sop.skill.md`) with approval gates; human steps stay in the written
> procedure."

## Notas para el modelo

- This skill does NOT write the SOP — it produces the *verdict* that parameterizes it. `/sop-authoring`
  turns RPA/AI verdicts into executable steps with gates and human verdicts into written procedure.
- The four-axis matrix reuses the methodological pattern of `/takeover-assessment`'s risk matrix: a
  structured, defensible verdict from scored inputs.
- Bias toward keeping the human close to the loop when uncertain. Automation that runs wrong at scale
  is more expensive than a human bottleneck.
- Map verdicts to the gate markers used by the executable SOP template: `Human` / `Human + AI` →
  `[APPROVAL REQUIRED]` or `[PRE-APPROVAL REQUIRED]`; `RPA — unattended` / `AI agent` → no gate.
- Keep the rationale executive-legible. If a sentence needs an RPA glossary to parse, rewrite it.
- Use the Acme universe for examples (e.g. "RapidEats refund step: high volume, deterministic → RPA
  unattended; dispute-escalation step: ambiguous → Human + AI").
