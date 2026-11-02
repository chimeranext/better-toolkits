# Skill `stack-evaluation` — protocol SSOT

## Purpose

Assess technology stack options objectively against weighted criteria and
publish the tradeoffs, so a stack choice is a decision the business can
understand and defend.

Grounded in the CTO-role references: MIT (architecture), Splunk (product/platform
leadership), Devox (architecture).

## When to use

- Selecting a stack for a new product or platform.
- Reviewing an existing stack (renewal, scaling pressure, talent changes).
- Comparing a build vs vendor product choice at the stack level (see also the
  portfolio skill for build/buy/partner).

## Method

1. **Define criteria with weights**, agreed with stakeholders before scoring:
   - Functional fit — how well the stack serves the required capabilities.
   - Operational cost — run rate, licensing, infrastructure, support.
   - Risk — maturity, stability, security track record, compliance support.
   - Talent availability — can the team (and the market) hire for this stack.
   - Vendor lock-in — exit cost, portability, open standards.
   - Ecosystem health — community, maintenance cadence, longevity.
2. **Shortlist** realistic candidates; drop obviously unsuitable options with a
   recorded reason.
3. **Score every candidate on the same weighted criteria.** Do not score only
   the favorite; a fair comparison is the point.
4. **Capture tradeoffs:** for the winner, state what was given up and under
   what conditions the runner-up would win.
5. **Recommend and record.** Publish the scorecard with the recommendation and
   write the choice as an ADR (see the decision skill).

## Artifact

An evaluation scorecard/matrix (criteria × candidates, weighted score) plus a
recommendation with tradeoffs.

## Contract

- Criteria weights are agreed before scoring; they are not moved to make a
  preferred candidate win.
- All shortlisted candidates appear in the scorecard; no single-criterion
  decisions.
- The recommendation is recorded as an ADR and kept with the engagement
  artifacts.
