# Skill `cmmc` — protocol SSOT

## Purpose

Assess and prepare a contractor for the US Department of Defense Cybersecurity
Maturity Model Certification (CMMC) 2.0. The model tiers security requirements
for handling Federal Contract Information (FCI) and Controlled Unclassified
Information (CUI).

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client bids on DoD contracts that include CMMC requirements.
- A client already holds a contract with CUI and must certify.
- A client needs to determine its target level and the assessment path.

## Method

1. **Determine the target level**:
   - **Level 1** — FCI only: 17 practices from FAR 52.204-21, annual
     self-assessment.
   - **Level 2** — CUI: NIST SP 800-171 controls (110 practices), with a
     third-party assessment organization (C3PAO) assessment for priority
     acquisitions; triennial for most.
   - **Level 3** — CUI in select programs: NIST SP 800-172 subset; government-led
     assessment.
2. **Scope the CUI/FCI**: where CUI and FCI reside — systems, people,
   suppliers, and facilities; document the assessment boundary.
3. **Map current state** against 800-171/800-172 practices (using SPRS for
   score visibility where relevant).
4. **Gap analysis**: identify missing practices and produce a POA&M with
   owners and dates.
5. **Implement and evidence**: close gaps and collect evidence per practice.
6. **Select the assessment path**: self-assessment vs. C3PAO assessment
   depending on level and contract type.
7. **Maintain**: ongoing monitoring and re-assessment on the required cadence.

## Artifact

A CMMC readiness pack: target-level determination, scoping diagram, practice
scorecard, POA&M, and evidence index.

## Contract

- Level 2/3 claims require the proper assessment path (C3PAO or
  government-led); the client does not self-certify where prohibited.
- Supplier and cloud scope (e.g., CUI in third-party clouds) is addressed
  explicitly.
- Vendor-neutral and client-neutral.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — level, POA&M, evidence.
- Verify against current CMMC 2.0 rulemaking and contract-specific clauses.
