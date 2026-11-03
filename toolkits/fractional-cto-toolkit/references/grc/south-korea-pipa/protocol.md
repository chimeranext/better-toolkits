# Skill `south-korea-pipa` — protocol SSOT

## Purpose

Assess and support compliance with South Korea's Personal Information
Protection Act (PIPA), supervised by the Personal Information Protection
Commission (PIPC). PIPA is one of the stricter Asian data protection laws,
with high fines and mandatory breach notification.

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client processes personal data of individuals in South Korea.
- A client operates in South Korea or serves Korean users.
- A client needs to align with the PIPC's enforcement expectations.

## Method

1. **Map processing principles**: collection limited to purpose, consent or
   another legal basis, minimal collection, accuracy, and safe management.
2. **Identify sensitive information and unique identifiers**: sensitive data
   (health, race/ethnicity, ideology, criminal records, biometrics, sexual
   orientation) requires separate explicit consent; resident registration
   numbers and other unique identifiers are heavily restricted.
3. **Appoint a Privacy Officer (DPO)**: designate the internal privacy
   officer, notify the PIPC (in the cases required), and maintain the
   register.
4. **Honor data subject rights**: access, correction, deletion, cessation of
   processing, and portability where applicable; keep processes and records.
5. **Cross-border transfers**: transferring personal data abroad requires
   consent, or one of the statutory bases (e.g., contract performance), plus
   notification of the transfer details; follow the PIPC transfer guidelines.
6. **Breach notification**: on a breach, notify the PIPC promptly (without
   delay, per the statutory notice) and affected individuals as prescribed.
7. **Operate**: consent records, retention limits, contracts with
   processors/third parties, and staff training.

## Artifact

A PIPA pack: processing checklist, sensitive-data register, DPO record,
transfer consent/notice records, and breach-notification flow.

## Contract

- Sensitive and unique-identifier processing is justified and consented
  separately.
- Breach notice timelines follow the statutory requirements.
- Vendor-neutral and client-neutral.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — checklist, registers, open items.
- Verify against the current PIPA and PIPC guidelines (including the 2023–
  2024 amendments on internal DPOs and autonomous measures).
