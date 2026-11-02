# Skill `hipaa` — protocol SSOT

## Purpose

Assess and support compliance with the US Health Insurance Portability and
Accountability Act (HIPAA) — the Privacy Rule, Security Rule, and Breach
Notification Rule — for covered entities (CEs) and business associates (BAs)
handling protected health information (PHI).

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client is a provider, plan, clearinghouse, or serves them (BA).
- A client handles PHI in apps, clouds, analytics, or support operations.
- A client needs a HIPAA-oriented risk assessment before or after an incident.

## Method

1. **Determine roles**: covered entity vs. business associate vs. downstream
   BA; identify where PHI is created, received, stored, or transmitted.
2. **Scope the PHI**: data inventory across systems (EHR, billing, email,
   backups, analytics, SaaS).
3. **Security risk assessment** (Security Rule — 45 CFR 164.308–316):
   evaluate administrative, physical, and technical safeguards:
   - Administrative: risk analysis, workforce training, contingency planning,
     and BA agreements.
   - Physical: facility access, workstation and device controls.
   - Technical: access controls, audit controls, integrity, transmission
     security (encryption).
4. **Privacy mapping**: notice of privacy practices, minimum necessary use,
   patient rights (access, amendment, accounting of disclosures), and
   authorizations.
5. **Business associate agreements**: inventory all BAs; ensure BAAs are in
   place with required provisions.
6. **Breach readiness**: define the breach response workflow — risk of
   compromise assessment, notification to individuals, HHS OCR, and media per
   the 60-day rule (45 CFR 164.408).
7. **Gap analysis and remediation plan** with owners and dates.

## Artifact

A HIPAA pack: role/PHI scope map, security risk assessment, safeguard gap
matrix, BAA inventory, and breach response workflow.

## Contract

- The risk assessment is documented and reviewed at least annually or on
  material change.
- Findings are actionable: every gap has an owner and a due date.
- Vendor-neutral and client-neutral; clinical content is out of scope.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — risk assessment, gaps, BAA inventory.
- Confirm current OCR guidance and the HIPAA Enforcement Rule thresholds.
