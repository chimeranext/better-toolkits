# Skill `metrics-to-vpeng` — protocol SSOT

## Purpose

Transfer ownership of the engineering metrics workstream from the fractional
CTO to the client's VP Engineering (or equivalent engineering leader). The goal
is that the metrics keep meaning the same thing, keep being computed from the
same sources, and keep having an owner after the CTO steps back.

Grounded in the CTO-role references (Splunk reliability/velocity/team-health
metrics, DORA) and the organic-executive handover flow: definitions and data
sources are delivered to the permanent owner with explicit acceptance.

## What is handed over

1. **Metric definitions.** The complete metric dictionary (see `metrics/*`):
   - DORA (deployment frequency, lead time, change failure rate, time to
     restore).
   - Reliability (SLO/SLI, availability, error budgets).
   - Velocity and team health.
   - Executive reporting KPIs.
   Each metric entry states: definition, measurement window, unit, and the
   anti-gaming rule that keeps it honest.
2. **Data sources and instrumentation.** Where each metric is computed from
   (CI/CD events, incident records, observability platform), including any
   known gaps or manual steps.
3. **Baselines and trends.** Current values, the trend direction, and the
   context that explains movement (process, team, architecture changes).
4. **Dashboards and reports.** What exists, who views it, and the cadence.
5. **Open items.** Instrumentation gaps, metric-quality issues, and decisions
   that are pending, each with owner and urgency.

## To whom

The VP Engineering (or the named engineering leader who owns delivery and
reliability). Confirm the recipient by name and role.

## Delivery mechanism

1. **Assemble the handover packet** in the engagement workspace (for example,
   `./fractional-cto/handover/metrics-to-vpeng/<date>/`): metric dictionary,
   data-source map, baseline report, dashboard inventory, open-item register.
2. **Hold a briefing session** walking through the definitions, the data
   sources, and the open gaps, so the VP can challenge the numbers and the
   definitions.
3. **Obtain explicit acceptance.** The VP acknowledges the dictionary and states
   which metrics and dashboards they own. Unaccepted items stay with the CTO.
4. **Transfer access** to dashboards, data sources, and reports; revoke
   CTO-only access.
5. **Re-confirm after a transition period** that the metrics continue to be
   produced and used without the CTO.

## Contract

- Every metric has a definition, a data source, and an accepted owner; a
  dashboard without a definition is not handed over.
- Baselines and trends are included so the new owner can detect drift without
  starting from zero.
- Open instrumentation gaps are transferred with owners and urgencies.
- The metric dictionary is the single source of truth; it is not duplicated
  across documents.
