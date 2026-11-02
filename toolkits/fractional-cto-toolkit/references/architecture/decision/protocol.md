# Skill `decision` — protocol SSOT

## Purpose

Record significant architecture decisions as Architecture Decision Records (ADRs)
with explicit framing — context, decision drivers, considered options, the
decision, and consequences — so choices are auditable, communicable, and
reversible.

Grounded in the CTO-role references: MIT (architecture), Splunk (product/platform
leadership), Devox (architecture). ADR shape follows the Nygard ADR format.

## When to use

- Any significant architecture choice: new system, platform, integration,
  data model, security posture, or a change to an existing decision.
- Revisiting or superseding a past decision (status transition).
- Onboarding stakeholders who need to understand why the architecture is what it
  is.

## Method

1. **Frame the decision.** State the problem, the constraints, and the
   stakeholders whose interests the decision affects.
2. **Identify decision drivers** — the non-negotiable requirements that the
   decision must satisfy (cost, latency, compliance, team skills, time).
3. **List the options** actually considered. If only one option exists, say so
   and record why others were out of scope.
4. **Record the tradeoffs** for each option: pros and cons, cost, risk, and how
   each driver is met.
5. **Write the decision** and its consequences:
   - Positive consequences — what the decision enables.
   - Negative consequences — what it costs or forecloses, and what would trigger
     revisiting it.
6. **Manage status:** `proposed` → `accepted` → optionally `superseded` (link to
   the ADR that supersedes).

## ADR template

```
# ADR-<NNN>: <title>

Status: proposed | accepted | superseded
Date: <date>
Context: <problem, constraints, stakeholders>
Decision drivers: <non-negotiable requirements>
Options considered: <list, with tradeoffs>
Decision: <the choice>
Consequences: <positive and negative, with revisit triggers>
```

## Artifact

A versioned ADR set in a well-known location (for example,
`./fractional-cto/architecture/adr/`), one file per decision, linked from the
relevant documentation.

## Contract

- Every significant architecture decision produces an ADR; a decision without a
  recorded rationale is not considered made.
- Options are real alternatives, not strawmen; the chosen option is compared on
  the same criteria as the others.
- ADRs are stored with the codebase or engagement workspace and reviewed when a
  decision is revisited.
