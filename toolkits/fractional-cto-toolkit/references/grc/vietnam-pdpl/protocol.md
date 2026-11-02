# Skill `vietnam-pdpl` — protocol SSOT

## Purpose

Assess and support compliance with Vietnam's Personal Data Protection
regime — established by **Decree 13/2023/ND-CP** (PDPL), in force since
1 July 2023. It applies to processing by Vietnamese and foreign organizations
of the personal data of individuals in Vietnam.

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client processes personal data of individuals in Vietnam.
- A client has Vietnamese operations, users, or partners.
- A client needs to decide its cross-border transfer route.

## Method

1. **Determine roles and scope**: controller (the organization deciding
   purpose/means) vs. processor vs. third party; map data flows and the
   categories of personal data.
2. **Identify sensitive data**: the PDPL carves out sensitive personal data
   (e.g., political/religious views, health, biometrics, financial accounts,
   location, ethnicity, sexual orientation, criminal records) with stricter
   conditions and separate consent.
3. **Obtain consent**: consent must be voluntary, informed, explicit, and
   withdrawable; document it per purpose, including for sensitive data.
4. **Honor data subject rights**: access, correction, deletion, restriction,
   objection, portability, and complaint rights (Art. 9–19 of the Decree).
5. **Data Protection Impact Assessment (DPIA)**: carry out the prescribed DPIA
   before processing high-risk personal data and before cross-border transfer.
6. **Cross-border transfer**: take the required steps — the overseer
   (Department of Cybersecurity and High-Tech Crime Prevention) must be
   notified and the transfer dossier filed; ensure a data-transfer agreement
   with the recipient.
7. **Security and breach**: implement technical/organizational measures and
   notify the authority and affected data subjects of breaches.
8. **Records**: keep processing records, consent logs, and transfer dossiers.

## Artifact

A Vietnam PDPL pack: role map, data inventory (incl. sensitive categories),
consent records, DPIA register, and cross-border transfer dossiers.

## Contract

- The Decree's transitional and sector-specific expectations (e.g., telecom,
   finance) are checked with local counsel.
- Sensitive-data treatment is explicit, not buried in general notices.
- Vendor-neutral and client-neutral.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — registers, dossiers, open items.
- Verify against the current PDPL implementing guidance and any supplementary
  decrees.
