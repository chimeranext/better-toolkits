# Spec Delta — toolkit/assurance-liveness

## Purpose

Pilar liveness del assurance-toolkit: verificar continuamente que el sistema sigue vivo (readiness) con la escalera de observabilidad, independiente del ritmo de PRs.

## ADDED Requirements

### Requirement: Observability-audit mudado con escalera de liveness

El sistema SHALL proveer `observability-audit` desde `assurance-toolkit` (shim en el toolkit viejo), evaluando probe/heartbeat/absence/synthetic como niveles ordenados.

#### Scenario: Audit distingue pasa de dejó-de-pasar

- **WHEN** se ejecuta `observability-audit` sobre un servicio con historial
- **THEN** el reporte distingue "pasa" de "dejó de pasar" (detección de regresión de liveness) en vez de un solo veredicto plano

#### Scenario: Corre siempre, no solo por PR

- **WHEN** no hay PR abierto
- **THEN** la señal de liveness sigue evaluable (schedule/daemon), sin depender del gate de PR

### Requirement: Chaos con hipótesis de steady-state y abort criteria

El sistema SHALL soportar experimentos de chaos como CRDs versionados con hipótesis medible (SLO: p99, error rate), probes que la validan (HTTP/Prometheus/StatusCheck), blast radius acotado y abort criteria con auto-stop. Matriz: Litmus (hub de experimentos, workflows GitOps, ChaosCenter multi-cluster, MCP server) vs Chaos Mesh (faults granulares pod/network/IO/kernel, dashboard, arranque rápido); staging primero, prod solo con guardrails y on-call avisado.

#### Scenario: Experimento con veredicto objetivo

- **WHEN** corre un experimento con hipótesis SLO
- **THEN** el veredicto sale de las probes, no de "se cayó o no"

#### Scenario: Abort automático

- **WHEN** el error rate supera el abort threshold
- **THEN** el experimento se detiene solo y deja registro

### Requirement: Baselines de performance alimentan los SLOs

El sistema SHALL convertir p95/p99 de los runs de perf en baselines versionadas que liveness vigila; la degradación contra baseline dispara revisión. Al cambiar de herramienta se re-baselinea (las métricas no son comparables entre herramientas).

#### Scenario: Regresión contra baseline

- **WHEN** el p99 supera baseline + delta configurado
- **THEN** se emite alerta de regresión de performance con el run responsable
