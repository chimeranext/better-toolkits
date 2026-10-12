# Pilar liveness — protocol SSOT

Harness-agnostic body. Thin entry: `commands/observability-audit.md`.
Full behavior contract: `openspec/changes/add-assurance-toolkit/specs/toolkit/assurance-liveness/spec.md`.

## Principio

¿Sigue vivo? Corre siempre (schedule/daemon), no por PR. Distingue "pasa" de "dejó de pasar".

## Escalera

probe → heartbeat → absence → synthetic, en ese orden. `observability-audit` verifica
telemetría recibida (no solo emitida), credencial contra destino vivo, init paths que no
apagan monitoreo en silencio, canales de alerta con tráfico real y dueños, y que cada
alerta demostró poder disparar.

## Chaos (a PoC)

Experimentos como CRDs versionados: hipótesis SLO medible, probes, blast radius acotado,
abort criteria con auto-stop. Matriz Litmus (hub, GitOps, ChaosCenter, MCP) vs Chaos Mesh
(faults granulares, dashboard). Staging primero; prod solo con guardrails. Antithesis
(simulación determinista, properties, replay) en evaluación para sistemas con estado.

## Baselines

p95/p99 de perf → baselines versionadas que liveness vigila. Al cambiar de herramienta,
re-baselinear (métricas no comparables entre herramientas).
