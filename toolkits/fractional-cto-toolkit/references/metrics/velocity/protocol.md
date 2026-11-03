# Skill `velocity` — protocol SSOT

## Purpose

Analyze engineering velocity with flow metrics — throughput, cycle time, lead
time, work in progress (WIP), and flow efficiency — and identify bottlenecks in
the delivery system.

Grounded in flow-based delivery analysis (Kanban/flow metrics) and Splunk's
engineering velocity guidance.

## The metrics

| Metric | Definition |
| --- | --- |
| **Throughput** | Number of work items completed per period. |
| **Cycle time** | Time from work starting to work finished. |
| **Lead time** | Time from request (or commitment) to delivery. |
| **WIP** | Work items started but not finished. |
| **Flow efficiency** | Active working time ÷ total elapsed time (lower is usually symptom of waiting). |

## Method

1. **Define the unit of work** (feature, story, PR, task) and the start/end
   points (commitment → done) before measuring.
2. **Measure the flow metrics** per unit of work and per stage.
3. **Visualize the flow** with a cumulative flow diagram (CFD) to see where
   work accumulates — the growing band is the bottleneck.
4. **Find the constraint.** Use Little's Law intuition: throughput is capped by
   the constraint stage. Improving non-constraint stages does not raise
   throughput.
5. **Focus the recommendation** on the bottleneck: reduce WIP at the
   constraint, unblock it, or add capacity there.
6. **Report trends and context** — velocity is interpreted over time, not as a
   single number; connect it to delivery predictability (planned vs actual).

## Artifact

A velocity analysis report: flow metrics per stage, a CFD view, the identified
bottleneck, and focused recommendations.

## Contract

- Velocity is a property of the system, not of individuals; never rank people
  with these metrics.
- The unit of work and measurement boundaries are fixed before analysis; they
  do not change between analyses.
- Recommendations target the constraint stage; generic "work faster" advice is
  out of scope.
