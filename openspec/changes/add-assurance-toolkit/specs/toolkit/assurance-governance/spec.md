# Spec Delta — toolkit/assurance-governance

## Purpose

Evidence governance for assurance-toolkit: outcome-based metrics, per-stage gates, and traceable receipts that turn test runs into defensible release decisions.

## ADDED Requirements

### Requirement: Outcome-based metrics (DORA / DER / MTTD)

The system SHALL measure outcomes, not activity: DORA (deployment frequency, lead time, change fail rate, failed deployment recovery time, rework rate) plus DER/DRE, MTTD/MTTR, and flaky rate. The test-results ↔ tracker join uses `found_env` and `commit_sha` (Sentry/PagerDuty/rollbacks enter with `found_env=production` automatically); a 14-day attribution window and `unattributed` defects as their own signal. Anti-gaming: ratios and trends, no individual targets, coverage as a diagnostic (Goodhart).

#### Scenario: Escape is computable without manual work

- **WHEN** a production defect arrives through any channel
- **THEN** it is labeled and the release DER/DRE is recalculated on its own

#### Scenario: Flaky backlog rises, escape is suspect

- **WHEN** the flake quarantine grows
- **THEN** the dashboard marks escape risk (coverage in debt), not only annoyance

### Requirement: Per-stage gates, fast ones first

The system SHALL define gates per stage: commit (lint, unit, coverage of the change), PR (tests 100%, security criticals 0, `coverage_delta` ≥ 0), release (e2e pass, p95, DER under threshold, `can-i-deploy` where it applies). Cheap and fast first; each gate prevents a failure class that was seen or feared; flaky = defect (quarantine, fix, or remove).

#### Scenario: A red gate stops with a linked cause

- **WHEN** a gate fails
- **THEN** promotion is blocked with a direct link to the evidence that failed it

### Requirement: Traceable receipts (phase 7, slot filled)

The system SHALL emit one receipt per verdict (tests, liveness, security): what ran, where, against which baseline, with which IDs (Linear, MASWE/MASTG, contract), and under which version (SemVer plus conventional commits, required in every repo via commitlint and automated releases). The `transversals/receipts/` slot stops being empty and is the auditable format of the release.

#### Scenario: A release is reconstructable

- **WHEN** the evidence for a release is requested
- **THEN** the receipts reconstruct what was verified, with what result, and who signed it

### Requirement: Gate pipeline with GitOps patterns (ArgoCD)

The system SHALL order gates as sync waves (infra/CRDs first, app after), with PreSync hooks (prior verification), Sync, and PostSync (later validation plus deletion policies); `ignoreDifferences` as a known baseline (what is known does not block, what is new does — same pattern as the Schemathesis baseline); health assessment as the liveness verdict; App of Apps to govern fleets. Recorded gap: the book's CI chapter was missing in the early release — do not invent its content.

#### Scenario: Infra verifies first

- **WHEN** a deploy includes infra plus app
- **THEN** the infra wave passes its gate before the app is touched

#### Scenario: A known baseline does not block

- **WHEN** the diff matches registered `ignoreDifferences` / baseline
- **THEN** it does not block; if it is new, it blocks or enters the baseline as a known change

### Requirement: K8s pre-flight — every troubleshooting-guide failure is a gate

The system SHALL turn the failure catalog (Ultimate K8s Troubleshooting Guide) into pre-deploy gates: requests/limits present and sane (Polaris/kube-linter, the "most common error"), probes defined, image/secrets exist, the HPA metric exists, least-privilege RBAC plus security contexts reviewed on the PR, quotas against the namespace, post-deploy service-discovery smoke (PostSync hook).

#### Scenario: A manifest without probes does not advance

- **WHEN** a Deployment does not declare liveness/readiness
- **THEN** the gate stops it with the guide chapter that failure produces

### Requirement: Layered pre-flight with one owner per finding (kubernetes.qa matrices)

The system SHALL order pre-flight in layers: kubeconform first (schema plus CRDs; kubeval deprecated, forbidden in new pipelines) → kube-score (PR gate best-practice: probes, limits, securityContext) → Trivy (images plus misconfig plus secrets plus SBOM) → Checkov (cross-IaC policy) plus kubeaudit (narrow security-only audit); Kubescape for multi-framework posture (NSA/CISA, MITRE, CIS, SOC2) plus RBAC; kube-bench for authoritative CIS on nodes (Job); kube-hunter excluded from the pipeline (unmaintained 2022, labs only). Anti-duplicate rule: one owner per finding type plus a single severity schema. Trivy is the OSS default; Snyk (Code SAST plus fix PRs) only if its dev workflow is in use.

#### Scenario: Layers without double-reporting

- **WHEN** kube-score and Trivy flag the same securityContext
- **THEN** only the configured owner reports; the other silences the duplicate rule

### Requirement: Gates with an exit contract and per-env thresholds (kubeqa gates pattern)

The system SHALL implement gates with exit codes (0 pass / 1 fail / 2 warnings-only), severity thresholds per environment (dev: critical, prod: warning), audit-first rollout (baseline, then progressive tighten), 5 layers (manifest, image, YAML policy without Rego, CIS compliance pre-check, diff against what is running), and admission pairs (Kyverno/Gatekeeper) as a backstop, not as the only gate.

#### Scenario: Prod is stricter than dev without duplicating config

- **WHEN** the same gate runs in dev and prod
- **THEN** prod fails on warning and dev only on critical, with versioned per-namespace overrides
