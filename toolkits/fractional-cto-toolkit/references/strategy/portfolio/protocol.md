# Skill `portfolio` — protocol SSOT

## Purpose

Manage the technology investment portfolio the way a financial portfolio is
managed: allocate limited resources across initiatives, balance risk and
reward, and make explicit build/buy/partner/retire decisions.

Grounded in the CTO-role references: MIT CTO Program (portfolio management,
R&D strategy), amazingCTO.

## When to use

- Periodic portfolio reviews (quarterly default).
- Budget allocation decisions.
- Deciding whether to build in-house, buy, partner, or retire an investment.

## Method

1. **Inventory.** List every technology initiative and its current spend
   (people, licenses, infrastructure, vendors).
2. **Classify each initiative:**
   - **Run** — keep the business operating (maintenance, compliance).
   - **Grow** — improve existing capabilities and economics.
   - **Transform** — new capabilities that change the business model.
   Balance across the three; a healthy portfolio is not all-transform.
3. **Score each initiative** on: business value, cost, technical and market
   risk, strategic alignment, and dependencies.
4. **Allocate.** Distribute budget and attention across the portfolio so the
   mix matches the strategy and risk appetite. Avoid over-concentration in a
   single bet.
5. **Decide build/buy/partner/retire** with explicit criteria:
   - **Build** when the capability is strategic and differentiating.
   - **Buy** when it is a commodity and the market offering is proven.
   - **Partner** when speed matters and the capability is not core.
   - **Retire** when value is low and cost/risk is high.
6. **Review on a cadence.** Track portfolio changes, revisit scores as
   assumptions change, and record decisions (see the decision skill for ADRs).

## Artifact

A portfolio view (table or dashboard) with classification, scores, allocation,
and decisions, plus a short rationale for each build/buy/partner/retire choice.

## Contract

- The portfolio is evaluated as a system; no initiative is decided in
  isolation from the rest of the portfolio.
- Every spend decision states value, risk, and strategic alignment.
- Decisions are recorded and versioned so they can be revisited.
