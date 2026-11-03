# Skill `mitre-atlas` — protocol SSOT

## Purpose

Model adversarial behavior against AI/ML, LLM, RAG, and agentic systems using
MITRE ATLAS (Adversarial Threat Landscape for AI Systems). The skill produces
a technique-level threat model, cross-references ATLAS to ATT&CK, and maps
threats to defensive countermeasures (D3FEND / AIDEFEND).

## When to use

- A client designs, deploys, or operates AI/ML workloads — especially LLMs,
  RAG pipelines, or autonomous agents.
- A client needs to assess AI-specific risk that classic IT threat models miss
  (prompt injection, model theft, poisoning, evasion).
- An AI incident must be analyzed or an AI product must be security-reviewed.
- A client asks how a security finding maps into the AI threat landscape.

## Model / taxonomy

ATLAS is a knowledge base of adversary tactics and techniques targeting AI
systems, derived from real-world AI incidents and red-team research. Structure:

- **Tactics** (e.g., Reconnaissance, Resource Development, Initial Access, ML
  Attack Staging, ML Model Access, Execution, Persistence, ML Model
  Exfiltration, ML Model Inference, Evasion, Impact, Collection, Exfiltration,
  Command and Control).
- **Techniques** with IDs like `AML.T####` (e.g., AML.T0090 OS Credential
  Dumping) and sub-techniques like `AML.T0040.001`. Techniques carry a name, a
  maturity level, and an optional `deprecated` flag.
- **Case studies** describing real AI attacks; they employ techniques in
  ordered steps with a tactic and position.
- **Mitigations** with categories and lifecycle phases.

Evidence (cloned repos) describes ATLAS version 2026.09 with a v6 YAML
distribution format, parsed into a graph with nodes for tactics, techniques,
mitigations, and case studies.

## Mappings

- **ATLAS → ATT&CK**: ATLAS techniques publish an `attack-reference` to the
  equivalent ATT&CK technique (official crosswalk), enabling joint
  IT+AI threat models.
- **CVE → CWE → CAPEC → ATT&CK → ATLAS**: the CVE2CAPEC pipeline maps a CVE
  chain to ATLAS techniques via ATT&CK (technique2atlas.py), giving a
  concrete route from a vulnerability to an AI threat.
- **ATLAS → D3FEND / AIDEFEND**: techniques map to defensive countermeasures
  in D3FEND and to AIDEFEND controls (see those skills).

Provenance conventions: links published by MITRE are `official`; links
computed from parent/sub-technique, revoked-ID replacement, or an F3/ATLAS
reference are `derived`; analyst-added assertions are `analyst`.

## Method

1. **Scope the AI assets**: models, datasets, pipelines, APIs, agents, and
   their trust boundaries.
2. **Select relevant tactics/techniques**: which ATLAS tactics apply to the
   system (e.g., Initial Access and Evasion for a public LLM endpoint; ML
   Model Exfiltration for a hosted model).
3. **Map to ATT&CK** for cross-domain coverage and to reuse IT defenses.
4. **Map to countermeasures** in D3FEND/AIDEFEND for each technique.
5. **Produce the threat model** with gaps (techniques with no mapped
   countermeasure) and a prioritized mitigation list.
6. **Report**: management summary + technique-level detail.

## Outputs

- AI-system threat model (technique × asset × countermeasure).
- Attack-path descriptions using ATLAS case-study steps where available.
- Gap list with reasons (no mapping, predates, tactic mismatch).
- Prioritized mitigation backlog tied to D3FEND/AIDEFEND controls.

## Sources

- MITRE ATLAS data (2026.09, v6 YAML) referenced in the countermap clone; its
  architecture/ingest code documents how ATLAS objects are parsed and linked.
- CVE2CAPEC clone contributes `technique2atlas.py` and `atlas_db.json`.
- SAFEAI report (atlas.mitre.org/pdf-files/SAFEAI_Full_Report.pdf) as the AI
  security reference for ATLAS context.

## Contract

- Vendor-neutral and client-neutral.
- Links keep provenance labels; derived or analyst links are reported as
  such, never as official.
- Empty countermeasure results carry a reason; empty is not safe.
- Handover: threat model, mapping tables, and mitigation backlog to the client
  security/AI owner.