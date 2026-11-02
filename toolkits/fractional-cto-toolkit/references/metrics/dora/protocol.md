# Skill `dora` — protocol SSOT

## Purpose

Define and compute the four DORA metrics — deployment frequency, lead time for
changes, change failure rate, and time to restore service — from delivery
pipeline data, frame them against public benchmarks, and report trends.

Grounded in the DORA research program (dora.dev) and the reliability metrics
references in Splunk's CTO guidance.

## The four metrics

| Metric | Definition |
| --- | --- |
| **Deployment frequency** | How often the team ships changes to production. |
| **Lead time for changes** | Time from code committed to it running in production. |
| **Change failure rate** | Percentage of deployments that cause a failure in production. |
| **Time to restore service** (MTTR) | Time from the start of a production failure to service restored. |

Measure the **system**, not individuals. DORA metrics describe the delivery
capability of a team or service, not a person's performance.

## Method

1. **Instrument the delivery pipeline.** Collect the data at the source: commit
   records, deployment events, and incident/rollback records. Prefer a
   tracking system over manual spreadsheets; if the data is not available,
   say so and fix the instrumentation first.
2. **Define measurement windows** (weekly/monthly rolling windows) and units
   (per service, per team) before computing anything.
3. **Compute the four metrics** per window.
   - Time to restore: use the time the service was actually degraded, not the
     time the incident ticket stayed open.
   - Change failure rate: count deployments that required rollback, hotfix, or
     caused a customer-facing incident.
4. **Frame against benchmarks.** DORA publishes performance profiles
   (elite/high/medium/low). Use them as context, not as a target for
   comparison across companies with different contexts.
5. **Report trends and context.** Show direction over time and note what changed
   (process, team, architecture) so the numbers can be interpreted.

## Artifact

A DORA baseline report per service/team: the four values, the trend, the
benchmark context, and the interpretation. Store it in the engagement metrics
workspace (for example, `./fractional-cto/metrics/`).

## Contract

- Metrics are computed from delivery data with explicit windows; no fabricated
  or estimated values.
- Anti-gaming: time to restore is measured from service degradation, and change
  failure rate counts real failed deployments — measures are defined so they
  cannot be gamed by process theater.
- Results are reported with context and trends; a single snapshot in isolation
  is not a finding.
