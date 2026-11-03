# Skill `fedramp` — protocol SSOT

## Purpose

Prepare a cloud service offering (CSO) for FedRAMP authorization — the US
government's program for assessing and authorizing cloud services. The work
flows from NIST SP 800-53 controls and produces a package reviewed by a 3PAO
and a federal agency. This protocol covers the full lifecycle: readiness, ATO
package production, control mapping, architecture/inheritance, and continuous
monitoring.

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client sells a cloud service to US federal agencies or state customers
  that require FedRAMP.
- A client needs a readiness/gap assessment before engaging a 3PAO.
- A client has an ATO and needs continuous-monitoring posture.
- A client wants to choose an authorization path (agency, Joint Authorization
  Board/JAB, or FedRAMP 20x pilot).

## Current FedRAMP state (2025–2026)

- **Baseline**: NIST SP 800-53 Rev 5 (approved May 2023, fully in effect).
  Rev 5 control counts: Low ≈156, Moderate ≈323, High ≈410.
- **OSCAL mandate**: transition to machine-readable OSCAL packages required by
  September 2026 (RFC-0024).
- **Security Inbox**: effective January 5, 2026, authorized CSPs must maintain
  a dedicated Security Inbox for urgent government vulnerability directives
  (no CAPTCHAs or barriers).
- **FedRAMP 20x**: modernization initiative; introduces continuous
  authorization and modular/API-driven submissions. Traditional SSP/SAP/SAR
  templates remain required for non-20x paths.
- **Templates**: SSP, SAR, SAP, POA&M, CIS/CRM, IIW, ISCP updated to align
  with Rev 5 (December 2024 releases).

## Impact levels and authorization paths

- **FIPS 199 categorization**: confidentiality, integrity, availability →
  Low / Moderate / High (high-water mark).
- **LI-SaaS** (Low-Impact SaaS): no PII, no sensitive federal data, limited
  scope; simplified template combining SSP + assessment.
- **Authorization paths**: Agency Authorization (sponsor needed), JAB
  (limited), FedRAMP 20x pilot.

## Method

### 1. Readiness & gap assessment

Run the readiness checklist (75+ items across 14 domains): boundary & system
documentation, policies & procedures, access control & identity, encryption,
vulnerability management, audit & logging, configuration management, incident
response, contingency planning, personnel security, third-party/supply chain,
privacy, 3PAO readiness, and OSCAL/automation. Flag each item Met / Partial /
Not Met / N/A. Produce a gap table: Control Family | Current State | Gap |
Priority | Owner. Recommend whether to pursue a Readiness Assessment Report
(RAR) first.

### 2. Determine impact level and boundary

- Categorize per FIPS 199.
- Define the authorization boundary: everything that processes, stores, or
  transmits federal data must be in scope; external services must be
  FedRAMP-authorized or have documented compensating controls.
- Document the Customer Responsibility Matrix (CRM) and inherited vs. customer
  responsibility.

### 3. Select the control baseline

Use NIST SP 800-53 Rev 5 baseline per impact level, then apply FedRAMP
tailoring and parameters (often stricter than base NIST). The 20 Rev 5
families: AC (Access Control), AT (Awareness & Training), AU (Audit &
Accountability), CA (Assessment, Authorization & Monitoring), CM (Configuration
Management), CP (Contingency Planning), IA (Identification & Authentication),
IR (Incident Response), MA (Maintenance), MP (Media Protection), PE (Physical &
Environmental), PL (Planning), PM (Program Management), PS (Personnel
Security), PT (PII Processing & Transparency), RA (Risk Assessment), SA (System
& Services Acquisition), SC (System & Communications Protection), SI (System &
Information Integrity), SR (Supply Chain Risk Management). Note Rev 4 → Rev 5
changes: new PT and SR families; password controls revised (no forced rotation;
compromised-password lists and strength meters per NIST 800-63B); privacy
integrated into AT-3; threat-based methodology (MITRE ATT&CK informs
prioritization); some controls merged — do not assume 1:1 mapping.

### 4. Write the System Security Plan (SSP)

The SSP is the centerpiece. Use the official FedRAMP template (one template
covers LI-SaaS, Low, Moderate, High). Structure: system name/title; system
categorization; system owner/authorizing official; assignment of security
responsibility; mission/purpose; system description; system environment
(architecture narrative, boundary, network/data-flow diagrams, ports/protocols
table, external connections); interconnections (ISAs/MOUs, leveraged FedRAMP
services); laws/regulations (Appendix A-12); and the minimum security controls
section — one implementation narrative per control (status, how implemented,
owner, evidence, customer responsibility). Appendices A–Q: A Acronyms &
Glossary; B Laws & Regulations (Attachment 12); C Security Policies &
Procedures; D User Guide; E Rules of Behavior; F IT Contingency Plan (ISCP);
G Configuration Management Plan; H Incident Response Plan; I Control
Implementation Summary (CIS) / CRM Workbook; J FIPS 199 Categorization; K
Integrated Inventory Workbook (IIW); L Cryptographic Modules Table; M
Continuous Monitoring Plan; N Separation of Duties Matrix (conditional); O
POA&M; P Supply Chain Risk Management Plan; Q Privacy Impact Assessment (if
PII in scope). Writing principles: describe only what is implemented; address
every verb in the control requirement; reference specific tools/policies;
state inheritance explicitly ("fully/partially inherited from [provider], see
CIS/CRM"); mark unimplemented controls "Planned" and list in POA&M.

### 5. Engage a 3PAO and run the assessment

- Select a FedRAMP-recognized 3PAO (Marketplace). A2LA R311: a 3PAO that
  provided advisory services (e.g., wrote the SSP) cannot assess that CSO for
  2 years.
- The 3PAO prepares the Security Assessment Plan (SAP): system overview,
  assessment scope (Control Selection Worksheet: Rev 5 list, conditional,
  CSP-specific, inherited), team, methods (interview/examine/test per NIST
  800-53A), test case procedures, schedule (freeze date), reporting.
- The 3PAO performs the assessment and produces the Security Assessment Report
  (SAR): executive summary, system description, per-control results, findings,
  risk exposure table, recommendation. SAR appendices: A infrastructure scan
  results; B Security Requirements Traceability Matrix (SRTM); C web app scan
  results; D database scan results; E Risk Exposure Table; F penetration test
  results (High; recommended for Moderate).
- CSP reviews/approves SAP and SAR; cross-references findings to SSP; every
  SAR finding becomes a POA&M row.

### 6. Address findings and package

- POA&M (SSP Appendix O): one finding per row; required fields (item ID,
  controls, weakness name/description, point of contact, resources, overall
  remediation plan, original detection date, scheduled completion, milestone
  changes, status, comments, auto-approve, deviation request approved, risk
  rating, risk adjustment, false positive, operational requirement).
- Remediation SLAs: Critical 30 days, High 90, Moderate 180, Low 365.
- Item types: Standard Finding (F-), Vendor Dependency (VD-), Deviation
  Request (DR-) with subtypes False Positive, Risk Adjustment, Operational
  Requirement; all DRs require agency AO approval.
- Submit the package: SSP, SAR, SAP, POA&M; obtain agency ATO or FedRAMP
  authorization.

### 7. Architecture guidance

- **AWS GovCloud (US)**: FedRAMP High authorized; most PE and some SC
  controls fully inherited; use Config, CloudTrail, GuardDuty, Security Hub
  for AU/RA/SI; GovCloud region endpoints; FIPS endpoints for IA.
- **Azure Government**: FedRAMP High authorized; Azure Policy + Defender for
  Cloud map to CM/RA/SI; Blueprints/Policy Initiatives aligned to Moderate/High.
- **Google Cloud**: FedRAMP-authorized regions; Assured Workloads for FedRAMP;
  Chronicle SIEM for AU.
- **Inheritance patterns**: document which controls are fully/partially
  inherited from leveraged FedRAMP IaaS/PaaS in the CIS/CRM workbook; verify
  inherited-control findings attribution.
- Supporting patterns: zero trust (AC/IA/SC), immutable infrastructure (CM),
  centralized logging (AU), automated vulnerability scanning (OS, DB, web app,
  container), container security (image signing, runtime protection).

### 8. Continuous monitoring (ConMon)

- **Monthly**: vulnerability scan results to agency AOs; POA&M updates (open
  findings, remediation progress); inventory updates; ConMon Monthly Executive
  Summary.
- **Annual**: full 3PAO assessment using the Annual Assessment Controls
  Selection Worksheet (no control untested for 3+ years); updated SSP and
  appendices; tested IRP and CP; SAR and updated POA&M.
- POA&M discipline: active progress on open items; stale items can suspend
  ATO; closed items need remediation evidence.

## Artifact

A FedRAMP package: impact-level determination, boundary and CRM, readiness gap
table, SSP (with appendices A–Q), SAP, SAR, POA&M, and a ConMon plan.

## Contract

- Control inheritance is documented, not assumed; the CRM is explicit.
- The 3PAO runs the assessment; the client provides evidence and fixes
  findings.
- Vendor-neutral and client-neutral; no client or provider names.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — package status, POA&M, evidence, ConMon plan.
- Verify against the current FedRAMP baselines, 800-53 revision, and template
  releases (check fedramp.gov for current versions).