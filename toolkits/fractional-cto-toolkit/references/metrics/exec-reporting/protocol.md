# Skill `exec-reporting` — protocol SSOT

## Purpose

Create executive dashboards and metric narratives that convert engineering
metrics into decisions for non-technical stakeholders: a small set of KPIs
tied to business outcomes, with trends and recommendations.

Grounded in Splunk's executive reporting guidance and CTO-role reporting
practice.

## Method

1. **Start from the business question.** What decision is the audience facing
   (invest, pause, change course, hire)? The report exists to support that
   decision.
2. **Select 5–7 KPIs max**, each traceable to a business outcome:
   - Delivery performance (DORA: deployment frequency, lead time, change
     failure rate, time to restore).
   - Reliability (SLO attainment, error budget spend).
   - Cost and efficiency (unit cost per transaction/user, infrastructure
     spend trend).
   - Team health (retention, engagement trend) when it matters to the decision.
3. **Show trends, not snapshots.** A number without a trend supports no
   decision. Use 3–6 month trends and note the context that moved them.
4. **Write the narrative.** The story the numbers tell: what improved, what
   degraded, the likely causes, and the recommended action. Omit vanity metrics
   (for example, lines of code, raw commit counts).
5. **Design the dashboard** for the audience: headlines and callouts first,
   drill-downs later; every metric has a tooltip/note explaining what it means
   and where it comes from.

## Artifact

An executive dashboard (one page) plus a narrative brief: findings, causes, and
recommendations. Store in the engagement reporting workspace.

## Contract

- Every KPI ties to a business outcome; a metric that cannot be tied to a
  decision does not belong on the executive report.
- The narrative states the recommendation, not just the numbers.
- The data sources and definitions are recorded so the report can be
  reproduced and trusted.
