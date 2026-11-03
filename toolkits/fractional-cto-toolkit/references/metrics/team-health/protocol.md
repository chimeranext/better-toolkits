# Skill `team-health` — protocol SSOT

## Purpose

Measure team health KPIs — morale and engagement, retention, predictability,
quality culture, bus factor, workload balance, review turnaround — combining
objective signals with a lightweight periodic health survey, and turn each
signal into an action.

Grounded in Splunk's team health guidance and CTO-role references (amazingCTO).

## Dimensions and signals

| Dimension | Example signals |
| --- | --- |
| **Morale / engagement** | Periodic health survey (5-point), turnover intent, participation in team events. |
| **Retention** | Churn rate, tenure distribution, exit reasons. |
| **Predictability** | Plan vs actual delivery, estimation drift trend. |
| **Quality culture** | Defect escape rate, rework share, code review engagement. |
| **Bus factor** | Number of people who can absorb a critical area (knowledge spread). |
| **Workload balance** | WIP per person, overtime/on-call load, distribution of critical work. |
| **Review turnaround** | Time to first review, time in review. |

## Method

1. **Collect objective signals** from existing systems (delivery data, review
   data, HR/retention data where available). Do not invent new bureaucracy for
   signals that already exist.
2. **Run a lightweight, periodic health survey** (short, anonymous, same
   questions each time) to capture the subjective dimensions — morale,
   psychological safety proxies, workload perception.
3. **Combine signals into a scorecard** with a per-dimension trend over time.
   A single snapshot is not a finding.
4. **Identify the weakest dimensions** and pair each with an action and an
   owner. Health metrics exist to improve the team, not to evaluate its members.
5. **Report with context.** Changes in team composition, scope, and company
   events explain the numbers; include them.

## Artifact

A team health scorecard with per-dimension levels and trends, plus a short
action list (action → owner → date).

## Contract

- Health metrics are used to improve the team, never to rank or penalize
  individuals.
- The survey is periodic, anonymous, and stable across periods so trends are
  comparable.
- Every weak signal produces at least one action; data without action is not a
  deliverable.
