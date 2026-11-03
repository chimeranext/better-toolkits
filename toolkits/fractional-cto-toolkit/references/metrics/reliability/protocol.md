# Skill `reliability` — protocol SSOT

## Purpose

Define service-level indicators (SLIs), service-level objectives (SLOs), and
availability targets with error budgets, and specify how reliability is
measured and reported.

Grounded in the SRE reliability approach (Google SRE workbook) and Splunk's
reliability reporting guidance.

## Definitions

- **SLI (Service-Level Indicator)** — the measurement of a property of the
  service that matters to users (availability, latency, correctness, durability).
- **SLO (Service-Level Objective)** — the target value for an SLI over a
  window (for example, 99.9% availability per 30 days).
- **SLA (Service-Level Agreement)** — the contractual commitment to an external
  party; usually stricter than the SLO and carries consequences.
- **Error budget** — the budget of unreliability a team can spend: 100% − SLO.
  A 99.9% SLO gives a 0.1% error budget per window.

## Method

1. **Choose SLIs from real user journeys.** The SLI must reflect what users
   experience (requests that matter, from the user's point of view), not every
   internal operation.
2. **Set SLOs the team can hold.** Start from the user journey, then pick a
   target that is ambitious but achievable. An SLO nobody can meet is not a
   target, it is a failure budget.
3. **Attach error budgets.** Track budget burn; when the budget is nearly
   spent, the team freezes risky changes and invests in reliability.
4. **Define how availability is reported:** the SLI definition, measurement
   source, and window. Availability = good events / total events over the
   window.
5. **Separate SLO from SLA** — document what is internal (SLO) versus
   contractual (SLA) and the consequences of each.

## Artifact

An SLO specification table: per service, the SLI definition, the SLO target,
the window, the error budget, and the reporting source.

## Contract

- SLIs reflect user journeys; a metric no user experiences is not an SLI.
- SLOs are set deliberately, with an owner and a review cadence.
- The error budget is the decision currency: when it is nearly exhausted, the
  response is to slow changes, not to move the target.
