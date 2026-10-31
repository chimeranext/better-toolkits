# Spec Delta — toolkit/assurance-liveness

## Purpose

Liveness pillar of assurance-toolkit: continuously verify that the system is still alive (readiness) with the observability ladder, independent of PR pace.

## ADDED Requirements

### Requirement: Observability-audit moved, with a liveness ladder

The system SHALL provide `/assurance:observability-audit` from `assurance-toolkit` (shim in the old toolkit), evaluating probe/heartbeat/absence/synthetic as ordered levels.

#### Scenario: The audit distinguishes passes from stopped-passing

- **WHEN** `/assurance:observability-audit` runs on a service with history
- **THEN** the report distinguishes "passes" from "stopped passing" (liveness regression detection) instead of a single flat verdict

#### Scenario: It always runs, not only per PR

- **WHEN** there is no open PR
- **THEN** the liveness signal stays evaluable (schedule/daemon), without depending on the PR gate

### Requirement: Chaos with a steady-state hypothesis and abort criteria

The system SHALL support chaos experiments as versioned CRDs with a measurable hypothesis (SLO: p99, error rate), probes that validate it (HTTP/Prometheus/StatusCheck), a bounded blast radius, and abort criteria with auto-stop. Matrix: Litmus (experiment hub, GitOps workflows, multi-cluster ChaosCenter, MCP server) vs Chaos Mesh (granular pod/network/IO/kernel faults, dashboard, fast start); staging first, prod only with guardrails and on-call notified.

#### Scenario: An experiment with an objective verdict

- **WHEN** an experiment runs with an SLO hypothesis
- **THEN** the verdict comes from the probes, not from "it fell over or it did not"

#### Scenario: Automatic abort

- **WHEN** the error rate exceeds the abort threshold
- **THEN** the experiment stops itself and leaves a record

### Requirement: Chaos with a resilience score (5-step workflow)

The system SHALL run chaos as a workflow: validate steady state → inject with a bounded blast radius → observe impact → verify recovery → score resilience (recovery time, error rate, degradation, cascading). Minimum primitives: pod kill, network partition, CPU stress, node drain; abort conditions plus auto-rollback plus a duration ceiling. The score is deterministic and trendable (reference: kubeqa chaos CLI, Apache-2.0, to evaluate alongside Litmus/Chaos Mesh).

#### Scenario: Scores are comparable across runs

- **WHEN** two identical experiments run on different dates
- **THEN** their resilience scores are comparable and the trend decides whether resilience improved

### Requirement: Cluster health score in 8 dimensions

The system SHALL measure cluster health with a deterministic 0–100 score across 8 dimensions (resources, security, networking, storage, availability, observability, configuration, cost), read-only and agentless (kubeqa health / Popeye sanitizer model). Each finding brings an exact remediation (a patch, not a link to docs). Popeye = read-only sanitization (dead resources, health score); Polaris = dashboard plus admission backstop plus CI. The score is fit to gate and to trend.

#### Scenario: A weak dimension does not hide

- **WHEN** security scores 95 but availability scores 60 (single replica)
- **THEN** the aggregate score reflects it and the gate may require per-dimension minimums, not only the average

### Requirement: Performance baselines feed the SLOs

The system SHALL turn p95/p99 from perf runs into versioned baselines that liveness watches; degradation against the baseline triggers a review. When the tool changes, re-baseline (metrics are not comparable across tools).

#### Scenario: Regression against the baseline

- **WHEN** p99 exceeds baseline plus the configured delta
- **THEN** a performance-regression alert is emitted with the responsible run

### Requirement: Diagnostic playbook plus executable runbooks (fractional-cto taxonomy)

The system SHALL split according to templates 08/09: the **playbook** decides (WHEN/WHY: diagnose vs recover vs escalate tree by symptom class, with stable pattern-IDs in the MDAA/MASWE signature model); the **runbooks** execute (sequential HOW fired by a trigger: read-only diagnose scripts with the Events → stern → k9s → built-ins hierarchy, and recover/restore scripts). Captures by criteria (ProcDump model) instead of a blind capture. Receipts reference playbook pattern-IDs plus runbook output, not prose.

#### Scenario: The playbook decides, the runbook executes

- **WHEN** a Pod fails silently
- **THEN** the playbook picks a branch (diagnose: signal hierarchy in order) and fires the matching runbook; the finding is stored with a reusable pattern-ID

#### Scenario: Prose with no tree and no trigger is not a playbook/runbook

- **WHEN** a diagnostic document has no decision tree and no trigger with steps
- **THEN** it is classified as a post-mortem or a note, not as a toolkit playbook/runbook
