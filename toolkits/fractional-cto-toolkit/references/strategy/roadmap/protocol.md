# Skill `roadmap` — protocol SSOT

## Purpose

Turn a business strategy into a technology roadmap: a phased plan of engineering
initiatives that deliver the capabilities the business needs, when it needs
them, with owners and measures.

Grounded in the CTO-role references: MIT CTO Program (roadmapping, portfolio,
R&D), Devox (Visionary), amazingCTO.

## When to use

- Strategic planning cycles (annual/quarterly).
- Start of a CTO engagement, when the mandate includes setting the technology
  direction.
- Prioritizing a large backlog of initiatives against business outcomes.

## Method

1. **Extract business outcomes.** Read the business strategy and list the
   outcomes the company needs (revenue, cost, risk, compliance, experience),
   each with a target date.
2. **Map to capabilities.** For each outcome, identify the business capabilities
   required, then the technology capabilities that enable them.
3. **Gap analysis.** Compare current technology capabilities (from the current
   architecture and recent audits) against the target set. The gaps are the
   roadmap's raw material.
4. **Organize into horizons** (MIT horizon model):
   - **H1 — now (0–6 months):** protect and optimize today; incremental
     improvements, reliability, compliance.
   - **H2 — next (6–18 months):** build the capabilities that differentiate the
     business.
   - **H3 — later (18–36 months):** explore and prepare transformative bets;
     fewer, riskier initiatives.
5. **Assign themes and initiatives.** Group initiatives into themes (for
   example, platform reliability, data platform, customer experience). Each
   initiative states its business outcome, capability it delivers, dependencies,
   owner role, and measure of success.
6. **Balance the plan.** Limit concurrent work per horizon; ensure the roadmap
   is achievable with the available team and budget. Flag tradeoffs explicitly.

## Artifact

A roadmap document with horizons, themes, initiatives, capabilities, owner
roles, dependencies, and measures — presented as a table plus a short narrative.
Store it in the engagement workspace (for example, under `./fractional-cto/roadmap/`).

## Contract

- Every initiative traces to a listed business outcome; if it cannot, it is
  removed or explicitly parked.
- No horizon carries more initiatives than the team can realistically execute
  (reference: WIP limits in the velocity skill).
- The roadmap is refreshed on a cadence (quarterly default); assumptions and
  dates are made explicit so they can be challenged.
- The roadmap feeds the portfolio skill (budget/allocation) and the R&D
  alignment skill (innovation pipeline).
