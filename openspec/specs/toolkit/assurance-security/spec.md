# Spec Delta — toolkit/assurance-security

## Purpose

Security transversal with its own runner in assurance-toolkit: pentesting and finding triage with a cadence and verdicts separate from functional testing.

## ADDED Requirements

### Requirement: Pentest with its own cadence and a separate report

The system SHALL provide `/assurance:pentest-runner` and `/assurance:pentest-playbook-setup` from `assurance-toolkit` (shims in the old toolkit), with a per-release cadence (not per PR) and a security report separate from the test report.

#### Scenario: A release requires a separate security verdict

- **WHEN** a release is evaluated
- **THEN** two independent verdicts are required (tests + security); neither replaces the other

### Requirement: Security finding triage with an SLA

The system SHALL run the queue → owner → SLA → receipt flow as mode `security` of `/assurance:triage` (`/assurance:triage security`), operated by the security owner. It SHALL NOT expose a separate `triage-security-findings` command.

#### Scenario: A finding past its SLA escalates

- **WHEN** a finding exceeds its SLA without remediation
- **THEN** the system marks it escalated and links it to its Linear issue without duplicating it

### Requirement: MASVS → MASWE → MASTG traceability in mobile pentest

The system SHALL map each mobile finding to a MASVS control via a MASWE weakness and an atomic MASTG test (stable IDs, 285 tests / 152 demos in MASTG v2), with a profile from the threat model (MAS-L1 baseline, MAS-L2 sensitive data, MAS-R anti-tamper resilience, MAS-P privacy) and a fix guide via MASTG-BEST. This is the traceability model for receipts.

#### Scenario: A finding is traceable end to end

- **WHEN** the pentest reports a finding
- **THEN** it includes MASVS/MASWE/MASTG IDs and the applicable profile, or it is marked unmapped

### Requirement: Agentic red team with OWASP ASI01–ASI10 + LLM02

The system SHALL evaluate agentic apps against the OWASP Top 10 for Agentic Applications 2026 (ASI01 Goal Hijack, ASI02 Tool Misuse, ASI03 Identity Abuse, ASI04 Supply Chain including compromised MCPs, ASI05 Code Exec, ASI06 Memory Poison, ASI07 Inter-Agent Comms, ASI08 Cascading Failures, ASI09 Human-Agent Trust, ASI10 Rogue Agents) plus LLM02 PII as a cross-cutting concern. Method in 4 phases: Build → Audit (scenario maps per ASI) → Define controls → Monitor and iterate; priorities Foundation (ASI01/02/PII) → Coverage (metrics + audit trail) → Depth (custom) → Extension (GDPR/EU AI Act as policies). Layered defenses (heuristic gateway, inline context-aware SLM guardrails, output controls); SoD (whoever codes the agent does not define its policies); gateway plus code layer. Training-data alignment: each OWASP scenario maps to detection data; validate with OWASP-aligned suites, not generic benchmarks.

#### Scenario: Full coverage, not only prompt injection

- **WHEN** an agent enters scope
- **THEN** the audit covers ASI01–ASI10 with scenario maps (2–3/10 is the documented gap, not the goal)

#### Scenario: Tool scoping stops legitimate exfiltration

- **WHEN** a tool accepts scope parameters (segments, tenants, regions)
- **THEN** the least-scope policy blocks bulk queries even when the permission exists

#### Scenario: Auditable agent graph

- **WHEN** a tool call, planning step, or inter-agent message occurs
- **THEN** it is recorded on the agent graph with detection of anomalous patterns (volumes, escalation sequences)

#### Scenario: Zero PII tolerance

- **WHEN** an output contains contextual PII (name + activity + location with no isolated sensitive field)
- **THEN** the gate detects it (regex is not enough) before it leaves the agent

### Requirement: Automated SAST/DAST/SCA layer

The system SHALL run automated scanning before the manual pentest: SAST (Semgrep), DAST (OWASP ZAP), SCA over the SBOM (Trivy/Grype, Dependency-Track) plus dependency-review on the PR. Criticals block; the rest goes to triage with an SLA.

#### Scenario: High CVE in a transitive dependency

- **WHEN** the SBOM scan finds a high/critical CVE
- **THEN** the gate fails until remediation or an approved exception with an expiry

### Requirement: Signed supply-chain baseline verified at admission

The system SHALL require, per deployable artifact: a canonical SBOM (CycloneDX or SPDX), a keyless Sigstore/cosign signature, SLSA provenance (L2 on Actions, L3 via slsa-github-generator), and fail-closed verification at admission (Kyverno/policy-controller). Generating without gates is a dashboard, not a control.

#### Scenario: An unsigned artifact does not run

- **WHEN** a deploy presents an image without a valid signature or provenance
- **THEN** admission rejects it and the event is audited

### Requirement: Mobile supply chain without source (REA model)

The system SHALL verify mobile artifacts without source code: Flutter apps by Dart snapshot hash, per-ABI digests, and engine provenance (static APK parse); APKs by decompiled manifest, classes, and methods (JADX); firmware/EVM/WASM where it applies. Every finding is reported with evidence plus explicit limitations (what was inspected, what was not), same format as the receipts.

#### Scenario: An APK is verified without source

- **WHEN** a release APK arrives with no repo access
- **THEN** snapshot hash, engine build, and surface (permissions, classes) are checked against the signed baseline, with declared limitations

### Requirement: K8s runtime — detect vs prevent (Falco / KubeArmor / Tetragon)

The system SHALL split runtime into two layers: cluster-wide detection with Falco (eBPF, community ruleset, CNCF graduated → feeds triage/SIEM) and inline prevention on high-value workloads with KubeArmor (least-permissive LSM, CNCF sandbox) or Tetragon (native eBPF with Cilium synergy, syscall kill/block). Rule: Falco detects and alerts, KubeArmor/Tetragon block; do not run two enforcement engines without scoping (audit mode before block; one owner per workload).

#### Scenario: Detection feeds prevention

- **WHEN** Falco alerts a recurring anomalous behavior
- **THEN** the alert produces a KubeArmor/Tetragon policy proposal in audit mode before enforce

### Requirement: Policy engines with a decision matrix (Kyverno / OPA Gatekeeper)

The system SHALL choose the admission engine by matrix: Kyverno (declarative YAML, native mutate/generate, image verification, K8s only — default for K8s-native teams) vs OPA Gatekeeper (Rego, cross-platform reuse on APIs/Terraform/CI, complex programmatic logic). A valid split: Kyverno in-cluster plus standalone OPA outside. Rollout is always audit-first; admission is a backstop, not the only gate (pair with CI-stage scanning).

#### Scenario: A policy blocks at admission with a cause

- **WHEN** a manifest violates a policy in enforce
- **THEN** admission rejects it with the responsible policy and severity, and the event enters the audit trail
