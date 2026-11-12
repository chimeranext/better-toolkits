# Skill `iso31000` — protocol SSOT

## Purpose

Establish or assess **organizational** risk management using ISO 31000:2018
principles, framework, and process. Produce a gap assessment and a risk-analysis
register compatible with ISO 9001:2015 risk/opportunity thinking.

This is **not** the systems/software project risk management plan. For project
risks that satisfy ISO/IEC/IEEE 16326 Clause 7 content, use
`/software-risks-authoring-ieee16085` (consumes the ISO/IEC/IEEE 16085 templates).
16085 §5.2.3 positions 31000 as overarching principles.

## When to use

- Enterprise / operational risk program design or gap assessment.
- ISO 9001 risk-and-opportunity evidence that needs a structured register.
- Board/CRO-facing risk analysis across processes (not a single software SPMP).

## Model (clause citations only)

- **Principles** — value creation/protection; integrated; structured; customized;
  inclusive; dynamic; best available information; human/cultural factors;
  continual improvement.
- **Framework** — leadership/commitment; integration; design; implementation;
  evaluation; improvement.
- **Process** — communication & consultation; scope/context/criteria; risk
  assessment (identify, analyze, evaluate); risk treatment; monitoring & review;
  recording & reporting.

## Method

1. **Scope** the organizational risk program (units, processes, exclusions).
2. **Context** — internal/external issues, interested parties (align Fuentes list).
3. **Criteria** — probability/impact scales and risk appetite/tolerance.
4. **Assess** — populate `templates/analisis-riesgos-iso31000.md` (before/after
   controls, RACI).
5. **Treat** — controls, residual level (KPI), owners.
6. **Monitor** — review cadence; escalate via CRO handover (`risk-to-cro`) when
   engagement ends.
7. **Relate** — if a software project needs lifecycle RM, point to 16085 via the
   SPMP catalog; do not claim 31000 alone satisfies 16326.

## Artifact

- Gap brief vs principles/framework/process
- Risk analysis register (Markdown export of the Excel-shaped schema)
- Optional link into `iso-mss-family.md` for neighboring MSS

## Contract

- Vendor-neutral, client-neutral.
- No copyrighted ISO/NTC/INTECO PDF body text in artifacts.
- Clear separation from 16085 project RM plans.
