# Skill `iso27001` — protocol SSOT

## Purpose

Establish, run, or assess an Information Security Management System (ISMS)
per ISO/IEC 27001:2022. The fractional CTO delivers the *management system*
work — scope, risk treatment, control selection, readiness evidence, and
mapping to related standards (ISO 27701, ISO/IEC 42001) — not the
certification audit itself.

Grounded in the CTO-role references (Splunk cybersecurity & compliance,
Devox security & privacy; Sushegaad GRC as benchmark only).

## When to use

- A client needs a security baseline or is pursuing ISO 27001 certification.
- A client has a certificate but the ISMS is dormant or paper-only.
- A new engagement needs a defensible security posture as a starting point.
- A client wants to extend the ISMS to privacy (ISO 27701) or AI management
  (ISO/IEC 42001), or to map Annex A controls to NIST SP 800-53.

## Model: ISO/IEC 27001:2022

The ISMS is built on the management-system clauses (4–10):

- Clause 4: organizational context (internal/external issues, interested
  parties, scope).
- Clause 5: leadership (policy, roles, responsibilities).
- Clause 6: planning (risk assessment, risk treatment, objectives).
- Clause 7: support (resources, competence, awareness, communication,
  documented information).
- Clause 8: operation (operational planning and control, risk assessment,
  risk treatment).
- Clause 9: performance evaluation (monitoring, measurement, analysis,
  evaluation, internal audit, management review).
- Clause 10: improvement (nonconformity, corrective action, continual
  improvement).

Annex A provides 93 controls across 4 themes:

| Theme | Control count | Examples |
| --- | --- | --- |
| Organizational | 37 | A.5.1 policies, A.5.15 access control, A.5.25 learning from incidents, A.5.37 documented operating procedures |
| People | 8 | A.6.1 screening, A.6.3 awareness, A.6.8 remote working |
| Physical | 14 | A.7.2 physical entry, A.7.9 clear desk/screen, A.7.12 cabling security |
| Technological | 34 | A.8.9 configuration management, A.8.24 use of cryptography, A.8.28 secure coding, A.8.34 protection of information systems |

The Statement of Applicability (SoA) is the core artifact: every Annex A
control marked applicable / not applicable with rationale.

## Mappings

- **Annex A → NIST SP 800-53**: map each applicable Annex A control to the
  equivalent 800-53 Rev 5 family/control for evidence reuse. Examples:
  - A.5.15 (access control) → AC family (AC-2, AC-3, AC-6).
  - A.5.19 (information security in supplier relationships) → SR family and
    SA-9, SA-12.
  - A.6.3/6.6 (awareness, confidentiality/non-disclosure) → AT family (AT-2,
    AT-3).
  - A.7.2 (physical entry) → PE family (PE-2, PE-3).
  - A.8.9/8.10 (configuration/information deletion) → CM family (CM-6,
    CM-8), MP family (MP-6).
  - A.8.16 (monitoring activities) → AU-6, SI-4, CA-7.
  - A.8.28 (secure coding) → SA family (SA-15, SA-3).
  - A.8.34 (protection of information systems) → SC/SI families.
  This mapping lets one evidence base satisfy both ISO 27001 and NIST-based
  obligations (FedRAMP, CSF, TSA, 800-53).
- **ISO 27001 → ISO 27701**: ISO/IEC 27701 extends 27001 with privacy
  information management (PIMS) requirements — privacy-specific controls and
  guidance for processing personal data. A client already operating a 27001
  ISMS can extend it to 27701 by adding the privacy controls and privacy risk
  treatment.
- **ISO 27001 → ISO/IEC 42001**: ISO/IEC 42001 is the AI management system
  (AIMS) standard; it reuses the ISMS clause structure and adds AI-specific
  controls (AI policies, AI risk assessment, AI system lifecycle). A 27001
  ISMS provides the foundation for 42001, which in turn links to the
  threat-defense AI skills (ai-defense, mitre-atlas).

## Method

1. **Scope the ISMS** (Clause 4): boundaries, locations, systems, people, and
   exclusions, approved by management.
2. **Executive context** (Clause 4/5): interested parties, internal/external
   issues, leadership commitment and policy.
3. **Risk assessment** (Clause 6): identify assets, threats, and
   vulnerabilities; score likelihood and impact; define risk acceptance
   criteria.
4. **Risk treatment plan**: select options (mitigate, transfer, avoid,
   accept) and map to Annex A controls (the 93 controls across the 4 themes).
5. **Statement of Applicability (SoA)**: every Annex A control marked
   applicable / not applicable, with rationale. This is the core artifact.
6. **Gap analysis**: compare the SoA and existing evidence against each
   applicable control; produce a prioritized remediation plan.
7. **Map to 800-53**: produce the Annex A → 800-53 mapping for evidence reuse
   and cross-framework reporting.
8. **Operations**: document processes (incident, supplier, business
   continuity, asset management), run internal audits, and management review.
9. **Readiness**: confirm the ISMS has operated ~3 months with evidence before
   the certification audit.
10. **Extensions**: when requested, scope the 27701 (privacy) or 42001 (AI)
    extension on top of the same management-system foundation.

## Artifact

An ISMS dossier: scope statement, risk assessment and treatment plan, SoA,
Annex A → 800-53 mapping table, gap assessment with remediation plan, and a
certification-readiness roadmap (optionally extended to 27701/42001).

## Contract

- Work is scoped to the management system; certification audits are run by an
  accredited certification body.
- Every applicable Annex A control has a named owner and evidence.
- Vendor-neutral and client-neutral: no client names, no tool endorsements.
- Handover: on engagement end, produce a handover artifact to the Chief
  Compliance Officer (CCO) — current posture, SoA status, open items, mapping
  tables, and evidence locations. Verify with the certification body before
  claiming readiness.