# Skill `tsa` — protocol SSOT

## Purpose

Assess and support compliance with Transportation Security Administration (TSA)
cybersecurity requirements for owners and operators of critical transportation
infrastructure — aviation, pipeline (natural gas and hazardous liquids), rail,
and other surface transportation modes. This protocol covers the pipeline
security directive series (including SD-01), the sector-specific requirements,
and the mapping to NIST SP 800-53.

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client operates TSA-regulated systems or serves such operators.
- A client received a TSA security directive or is in an applicable category.
- An incident or inspection exposed a gap in the security program.
- A client needs to map TSA directive requirements to NIST 800-53 controls for
  implementation and evidence reuse.

## Model: TSA security directives

Following the May 2021 Colonial Pipeline ransomware attack, TSA issued
mandatory cybersecurity Security Directives requiring critical transportation
infrastructure owners and operators to implement baseline cybersecurity
measures. Directives are renewed annually and carry the force of law under 49
U.S.C. § 114; non-compliance can result in civil penalties. Each directive
identifies specific covered entities by name — not all operators in a sector
are automatically covered. Directive text is classified as Sensitive Security
Information (SSI) and is not fully public; work from disclosed summaries,
Federal Register notices, and TSA publications.

### Pipeline Security Directives

- **SD Pipeline-2021-01 series — Immediate Measures** (current revision, e.g.,
  Pipeline-2021-01G, effective January 2026). Core requirements:
  1. Report cybersecurity incidents to CISA within 24 hours.
  2. Designate a Cybersecurity Coordinator (24/7 availability; backup
     designee).
  3. Review current cybersecurity practices and identify gaps relative to
     TSA/CISA guidance.
  4. Develop and implement remediation measures for the gaps.
  Covered entities: owners/operators of TSA-designated critical hazardous
  liquid and natural gas pipelines and LNG facilities.
- **SD Pipeline-2021-02 series — Comprehensive Cyber Risk Management Program
  (CRMP)** (current revision, e.g., Pipeline-2021-02F). Core requirements:
  1. **Cybersecurity Implementation Plan (CIP)**: submit to TSA for review and
     approval.
  2. **Cybersecurity Incident Response Plan (IRP/CIRP)**: document and test
     two objectives annually.
  3. **Architecture Design Review (ADR)**: annual review of IT/OT network
     architecture.
  4. **Cybersecurity Assessment Plan (CAP)**: annual assessment with results
     reported to TSA.
  5. **Four technical domains**: network segmentation, access controls,
     continuous monitoring, and patch management.
  6. **Accountable Executive**: a C-suite individual with authority for
     cybersecurity decisions.
- Historically the series evolved from prescriptive controls (2021) to a
  performance-based approach (2022 onward) with refinements through 2024–2026.

### Other sector directives

- **Freight rail**: SD 1580-21-01 series — equivalent-in-scope requirements
  (incident reporting, coordinator, CRMP elements, performance-based updates).
- **Passenger rail / public transit / bus (NPRM)**: similar baseline
  requirements are being extended to these modes.
- **Aviation**: TSA aviation security programs incorporate cybersecurity
  expectations; check the specific security program applicable to the client.

## Mappings

- **TSA directive → NIST SP 800-53**: map each directive requirement to
  800-53 Rev 5 controls for implementation and evidence reuse:
  - Incident reporting → IR-6 (Incident Reporting), IR-7 (Incident Response
    Assistance).
  - Cybersecurity Coordinator → roles embedded in CA, PS, and IR program
    controls (e.g., CA-1, PS-6).
  - Practices review / gap analysis → CA-2 (Assessment), RA-3 (Risk
    Assessment), CA-5 (Plan of Action and Milestones).
  - Remediation measures → CA-5, and family-specific controls for each
    technical domain.
  - Network segmentation → SC-7 (Boundary Protection), SC-8 (Transmission
    Confidentiality/Integrity).
  - Access controls → AC family (AC-2, AC-3, AC-6, IA-2, IA-5).
  - Continuous monitoring → CA-7 (Continuous Monitoring), AU-6 (Audit Review,
    Analysis, Reporting), SI-4 (System Monitoring).
  - Patch management → SI-2 (Flaw Remediation), CM-8 (System Component
    Inventory), CM-6 (Configuration Settings).
  - Accountable Executive → Program management and governance controls
    (PM-1, PM-2, CA-1).
  - Contingency/response → CP family (CP-2, CP-4), IR family (IR-4, IR-8).
- **TSA → CSF**: align the directive's program elements with CSF 2.0
  functions (Govern, Identify, Protect, Detect, Respond, Recover) to present
  posture in a common language.

## Method

1. **Determine applicability**: identify whether the client's sector and
   asset class fall under TSA cybersecurity requirements (pipeline, rail,
   transit, aviation), the specific directive(s) received, and the notification
   tier.
2. **Map the required measures**: translate the directive/regulation into a
   control set — for pipelines, the CIP, IRP/CIRP, ADR, CAP, four technical
   domains, and Accountable Executive; for other sectors, the equivalent
   program elements.
3. **Map to NIST 800-53**: produce the directive-to-control mapping table so
   implementation and evidence reuse the same control structure as other GRC
   obligations.
4. **Conduct a gap assessment**: evaluate current posture against each
   requirement; identify gaps in people, process, and technology.
5. **Write/update the security plan**: document the cyber program (CIP),
   critical systems, IRP/CIRP, and the implementation timeline with milestones.
6. **Report**: prepare the required submission(s) to TSA on the mandated
   cadence (e.g., CIP submission, annual updates, assessment results).
7. **Exercise and validate**: run testing/tabletop exercises aligned with
   requirements (e.g., IRP objectives, ADR, CAP); keep records.

## Artifact

A TSA readiness pack: applicability/tier determination, directive-to-control
mapping (TSA → 800-53 → CSF), gap assessment, and the security/implementation
plan (CIP, IRP/CIRP, ADR, CAP evidence).

## Contract

- Submissions to TSA are made by the operator; this skill prepares the content
  and evidence, not the filing itself.
- Critical systems identification is explicit and documented.
- SSI is handled per its handling rules; the skill works from public or
  client-authorized summaries only — never fabricates directive text.
- Vendor-neutral and client-neutral; no facility or operator names.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — assessment, plan, submission status, mapping tables.
- Verify against the current TSA directives and sector-specific rules before
  submission.