---
name: sre-observability-stack
description: >
  Observability — Prometheus, Grafana, Jaeger, OpenTelemetry. Migrated;
  protocol SSOT in assurance liveness.
---

# sre-observability-stack — multi-harness entry (migrated)

> Source: `flutter-boilerplate-monorepo-template/skills/system-reliability-engineering/observability-stack`.
> Protocol SSOT: `toolkits/assurance-toolkit/references/liveness/protocol.md`.
> Template copy retained as shim.

Metrics, tracing, liveness/heartbeat/absence-detection. Feeds the liveness
ladder (received telemetry, not just emitted).

Dart/Flutter OTel conventions (pinned SDK+API pair, OTLP export, LGTM):
`shared/references/conventions/platform/observability/README.md`.
