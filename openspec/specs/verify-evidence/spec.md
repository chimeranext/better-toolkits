# Spec Delta

## Purpose

Verifies a claim against the real, observable evidence using the vendored
verification tools (Graphify, Open Ontologies, Specula), returning a verdict
with an auditable evidence chain.

## ADDED Requirements

### Requirement: Tool selection by claim type
The `/verify-evidence` skill SHALL route a claim to the appropriate tool based
on what the claim asserts.

#### Scenario: Code-structure claim → Graphify
- **WHEN** the claim is about code structure, existence, relationships, or
  architecture
- **THEN** the skill SHALL use Graphify (`graphify query/explain/path`)
- **AND** SHALL report edges as `EXTRACTED` (observed) or `INFERRED` (derived)

#### Scenario: Reasoning/consistency claim → Open Ontologies
- **WHEN** the claim is about logical consistency, entailment, or semantic
  consequence
- **THEN** the skill SHALL use Open Ontologies
- **AND** SHALL include a re-verifiable certificate (`oo-cert`) in the evidence

#### Scenario: Invariant/behavior claim → Specula
- **WHEN** the claim is about a behavioral invariant, concurrency, or a property
  that must hold across states
- **THEN** the skill SHALL use Specula (TLA+ model checking)
- **AND** SHALL report the model-check result and any counterexample path

### Requirement: Real verification, never inference
The skill SHALL execute the actual tool against the actual artifact (the repo,
the ontology, the model) — it SHALL NOT return a presumed result or an inference
dressed as a result.

#### Scenario: Observed output is captured
- **WHEN** a tool is run
- **THEN** the skill SHALL capture the real command and its real output
- **AND** SHALL label the evidence `observado` (per the Genchi Genbutsu rules)

### Requirement: Verdict with evidence chain
The skill SHALL produce a verdict — `PASS` / `FAIL` / `NOT VERIFIABLE` — with
the evidence chain formatted per `evidence-explicit-attribution` (observed vs
expected, method of observation, freshness, claim-type labels).

#### Scenario: Verdict is tied to evidence
- **WHEN** the skill emits a verdict
- **THEN** the verdict SHALL be accompanied by the evidence chain that supports it
- **AND** a `NOT VERIFIABLE` verdict SHALL state exactly what could not be
  verified and why (missing tool, missing artifact, insufficient scope)

### Requirement: Integration with /ishikawa
When `/ishikawa` identifies a root cause whose fix depends on a verifiable claim,
the analysis SHALL be able to invoke `/verify-evidence` to prove that claim.

#### Scenario: ishikawa delegates proof to verify-evidence
- **WHEN** an ishikawa countermeasure depends on a falsifiable claim
- **THEN** the skill SHALL offer to verify that claim via `/verify-evidence`
- **AND** SHALL NOT assert the claim as fact without the verification
