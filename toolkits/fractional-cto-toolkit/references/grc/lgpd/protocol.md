# Skill `lgpd` — protocol SSOT

## Purpose

Assess and support compliance with Brazil's Lei Geral de Proteção de Dados
(LGPD — Law 13.709/2018, in force since August 2021). It applies to any
processing of personal data of individuals in Brazil, regardless of where the
organization is based.

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client processes personal data of Brazilian individuals (customers,
  employees, users).
- A client operates in Brazil or serves the Brazilian market.
- A client needs a structured privacy program for a Brazilian subsidiary or
  partner.

## Method

1. **Determine roles**: controller (controlador) vs. operator (operador) for
   each processing activity; map data flows.
2. **Identify the legal basis** (Art. 7): consent, compliance with legal
   obligation, public administration, research, contract execution, regular
   exercise of rights, health protection, credit protection, legitimate
   interest (with balance test for sensitive data bases in Art. 11).
3. **Name the Data Protection Officer (Encarregado)**: required; the ANPD
   must be notified of the designation (Art. 41).
4. **Build records of processing operations**: controller and operator records
   (Art. 37) — purpose, legal basis, categories, retention, transfers,
   security measures.
5. **Implement data subject rights** (Art. 18): confirmation, access,
   correction, anonymization, portability, deletion, and information about
   sharing.
6. **Security and incident response**: technical/administrative measures (Art.
   46); notify ANPD and affected data subjects of security incidents with
   material risk (Art. 48) within reasonable time.
7. **Cross-border transfers** (Art. 33): only to countries with adequate
   protection or with safeguards (contractual clauses, etc.).
8. **Gap analysis and remediation plan** with owners and dates.

## Artifact

An LGPD pack: controller/operator map, legal-basis register, DPO designation
record, records of processing, rights-handling workflow, and incident
notification flow.

## Contract

- The ANPD and applicable sectoral rules (e.g., Bacen resolutions) are
  identified and confirmed.
- Records are kept current; rights requests are handled within statutory
  timelines.
- Vendor-neutral and client-neutral; Portuguese legal terms are kept alongside
  English equivalents for clarity.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — records, DPO status, open items.
- Verify against ANPD guidance (e.g., on the DPO, on small/startup
  treatment) as it evolves.
