# Skill `ai-defense` — protocol SSOT

## Purpose

Apply the AIDEFEND framework — 311 actionable defensive AI controls — to
secure AI, LLM, RAG, and agentic workloads. The skill maps controls to AI
assets, security functions, and lifecycle phases, evaluates coverage against
external AI security frameworks (including ATLAS), and delivers a prioritized
control implementation plan.

## When to use

- A client deploys LLMs, RAG pipelines, or autonomous agents and needs a
  security control baseline.
- A security review of an AI system must be structured and defensible.
- A client wants to demonstrate AI security coverage against recognized AI
  frameworks (ATLAS, OWASP LLM/ML/Agentic Top 10, NIST AI guidance).
- An AI product needs a prioritized hardening backlog.

## Model / taxonomy

AIDEFEND organizes defensive controls along three dimensions:

- **Security function (tactic)** — Model, Harden, Detect, Isolate, Deceive,
  Evict, Restore.
- **Protected component (pillar)** — infra, app, data, model.
- **Lifecycle phase** — scoping, building, validation, operation, improvement,
  response.

Counts (evidence, version 1.20261101 / data 2026.11.01):

- 311 actionable controls = 35 standalone techniques + 276 leaf sub-techniques.
- 58 parent families (navigation-only, `actionable: false`).
- Controls carry an ID (`AID-M-001.001`), a name, a `kind`
  (technique/sub-technique), tactic, family, pillar, phase, plain-text
  description, a scope boundary (responsibility + related techniques), and a
  canonical URL.
- Evaluated against nine external AI security frameworks and risk catalogs
  (including MITRE ATLAS; four catalogs are published in the integration
  export — ATLAS, OWASP LLM Top 10 2026, OWASP ML Top 10 2023, OWASP Top 10
  for Agentic Applications 2026 — and the remaining five are mapped but
  deferred in export).

## Mappings

- AIDEFEND control → the external threat item it defends against
  (threat-control joins invert `defendsAgainst`).
- AIDEFEND control ↔ ATLAS technique for AI threat coverage.
- AIDEFEND control ↔ OWASP LLM/ML/Agentic Top 10 items.
- AIDEFEND control ↔ NIST AI security/risk guidance (adversarial ML and
  AI risk management families).

A mapping says a control is relevant to a threat; it does not claim the
threat is mitigated or that any standard is satisfied.

## Method

1. **Scope AI assets**: models, datasets, pipelines, agents, and embedded AI
   in SaaS.
2. **Select evaluation framework(s)** (e.g., ATLAS or OWASP LLM Top 10).
3. **Map assets to controls**: per pillar and lifecycle phase, identify
   applicable AIDEFEND controls.
4. **Score coverage**: for each actionable control, record implementation
   state (implemented, partial, missing) and relevance (Full/High).
5. **Identify gaps**: controls that are relevant but not implemented.
6. **Produce the plan**: prioritized backlog per control, with owner and
   evidence location.

## Outputs

- AI control coverage matrix vs. the selected external framework(s).
- Prioritized control implementation backlog.
- Scope-boundary/responsibility notes per control (ownership and related
  controls).
- Evidence index linking each control to implementation evidence.

## Sources

- AIDEFEND framework data in the evidence clone: `data/integration/controls.json`
  (311 controls), `data/tactics-index.json`, `data/integration/threat-control-joins.json`,
  and `data/integration/threat-catalogs/*` (ATLAS, OWASP LLM/ML/Agentic Top 10).
- README notes on the nine evaluated frameworks and the AIDEFEND version.

## Contract

- Vendor-neutral and client-neutral.
- Coverage is scored from evidence, not assertion; each control rating cites
  a source.
- A mapping indicates relevance — never a guarantee of mitigation.
- The framework's licensing and provenance (Creative Commons content, mapped
  frameworks attributed to their owners) are respected; no third-party
  descriptions are copied verbatim.
- Handover: coverage matrix, gap list, and implementation backlog to the
  client AI/security owner.