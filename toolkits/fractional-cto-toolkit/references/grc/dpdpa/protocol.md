# Skill `dpdpa` — protocol SSOT

## Purpose

Assess and support compliance with India's Digital Personal Data Protection Act
2023 (DPDPA 2023). It applies to the processing of digital personal data of
individuals in India — whether by Indian or foreign entities offering goods or
services in India.

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client processes digital personal data of Indian individuals.
- A client operates in India or serves the Indian market.
- A client needs a privacy program aligned to the DPDPA framework.

## Method

1. **Determine roles**: Data Fiduciary (the entity deciding purpose/means) vs.
   Data Processor; map the personal data flows.
2. **Identify the processing basis**: the law is consent-centric — obtain
   consent for each purpose via a notice that is free, specific, informed,
   unconditional, and unambiguous; note the "deemed consent" categories (Art.
   8) where they apply.
3. **Issue notices**: capture the prescribed notice content (purpose, data
   categories, rights, grievance officer) before or at collection.
4. **Map data subject rights**: access, correction, erasure, grievance
   redressal, and consent-withdrawal — with the mechanisms to honor them.
5. **Children's data**: process children's data only with verifiable parental
   consent (Art. 9) and avoid tracking/behavioral advertising directed at
   children.
6. **Significant Data Fiduciary (SDF) duties**: if the client meets SDF
   thresholds — appointment of a Data Protection Officer, independent data
   auditor, and periodic DPIA-like assessments.
7. **Security and breach**: implement reasonable security safeguards (Art. 8);
   notify the Data Protection Board and affected data principals of breaches.
8. **Cross-border transfer**: transfer only to notified countries/territories
   (as designated by the government); keep the transfer registers.

## Artifact

A DPDPA pack: role map, notice templates, consent records, rights-handling
workflow, SDF decision record, and breach flow.

## Contract

- The DPDPA rules (yet to be fully notified) supplement the act; track the
  rulemaking and the establishment of the Data Protection Board.
- Consent is granular and retractable; records prove it.
- Vendor-neutral and client-neutral.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — registers, notices, open items.
- Verify against the current DPDPA rules before client delivery.
