# Liveness pillar — protocol SSOT

Harness-agnostic body. Thin entry: `commands/observability-audit.md`.
Full behavior contract: `openspec/changes/add-assurance-toolkit/specs/toolkit/assurance-liveness/spec.md`.

## Principle

Is it still alive? Runs always (schedule/daemon), not per PR. Distinguishes "passing" from "stopped passing".

## Ladder

probe → heartbeat → absence → synthetic, in that order. `observability-audit` verifies
received telemetry (not just emitted), credential against a live destination, init paths that
do not silently disable monitoring, alert channels with real traffic and owners, and that each
alert proved it can fire.

## Chaos (a PoC)

Experiments as versioned CRDs: measurable SLO hypothesis, probes, bounded blast radius,
abort criteria with auto-stop. Litmus matrix (hub, GitOps, ChaosCenter, MCP) vs Chaos Mesh
(granular faults, dashboard). Staging first; prod only with guardrails. Antithesis
(deterministic simulation, properties, replay) under evaluation for stateful systems.

## Baselines

perf p95/p99 → versioned baselines that liveness watches. When changing tools,
re-baseline (metrics are not comparable across tools).

## Migrated skills (flutter-boilerplate-monorepo-template, reinterpreted)

- **flutter-error-tracking**: Sentry/Crashlytics + breadcrumbs + source maps; errors as an MTTD signal.
- **sre-observability-stack**: Prometheus/Grafana/Jaeger/OTel; liveness, heartbeat, absence-detection.
- **sre-alerting-incident-management**: PagerDuty/Opsgenie, on-call, monitoring-as-code; each alert with an owner and linked runbook.
- **sre-chaos-engineering**: Litmus, failure injection, game days (principlesofchaos); feeds the Litmus vs Chaos Mesh PoC.
- **sre-database-reliability (liveness)**: replication lag and failover readiness as signals; drills in testing.

## Playbook + runbooks (fractional-cto taxonomy 08/09)

The **playbook** decides (diagnose/recover/escalate tree, pattern-IDs MDAA/MASWE);
the **runbooks** execute (diagnose read-only with Events → stern → k9s, recover/restore).
Prose without a tree or trigger = post-mortem, not a playbook/runbook.

## Liveness loop

```mermaid
flowchart TD
    P[probe] --> H[heartbeat]
    H --> A[absence detection]
    A --> S[synthetic]
    S --> C{chaos: steady-state?}
    C -->|yes| I[inject with blast-radius]
    C -->|no| W[abort: do not experiment on an incident]
    I --> O[observe: error rate, p99, cascading]
    O --> R[verify recovery]
    R --> SC[resilience score + baseline SLO]
    SC --> C
```

## References

- K8s troubleshooting: `FINAL_The Ultimate Kubernetes Throubleshooting Guide_26.03.2026.pdf` (Documentos, local) — signals Events → stern → k9s
- K8s Book (Poulton 2024, local): Deployments, RBAC (ch14), threat modeling (ch16)
- Chaos: https://litmuschaos.io/ · https://chaos-mesh.org/ · https://kubernetes.qa/features/chaos/ · Antithesis https://antithesis.com/ (deterministic simulation, under evaluation)
- Health: https://kubernetes.qa/features/health/ (8 dimensions, deterministic score)
- Sysinternals: https://learn.microsoft.com/en-us/sysinternals/resources/troubleshooting-book (ProcDump by criteria, "Unexplained" cases)
- MDAA Diagnomicon (Vostokov, local): stable pattern-IDs for diagnostics
