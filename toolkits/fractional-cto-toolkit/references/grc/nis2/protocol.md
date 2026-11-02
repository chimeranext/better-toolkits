# Skill `nis2` — protocol SSOT

## Purpose

Assess and support compliance with the EU NIS2 Directive (Directive (EU)
2022/2555), which strengthens cybersecurity requirements for **essential** and
**important** entities across many sectors (energy, transport, banking,
health, digital infrastructure, public administration, manufacturing, food,
waste, chemicals, etc.). It was to be transposed by 17 October 2024; member
state implementation varies.

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client operates in a sector and size bracket covered by NIS2.
- A client needs to confirm whether it is essential or important and which
  obligations apply.
- A client needs to stand up the required security measures and reporting.

## Method

1. **Determine applicability**: map the client's sector (Annex I/II) and
   size to the essential/important classification; note the exemptions (micro/
   small enterprises, some public entities, and the specific carve-outs).
2. **Title the security measures** (Art. 21): implement measures for risk
   analysis, incident handling, business continuity and crisis management,
   supply-chain security, vulnerability disclosure, and basic cyber hygiene,
   aligned to the state of the art. Use the ISMS/ISO 27001 program as the
   backbone, mapped to the Article 21 measures.
3. **Management accountability** (Art. 20): ensure the management body
   approves the measures, oversees them, and completes cybersecurity training;
   member states may hold management personally liable.
4. **Incident reporting** (Art. 23): report significant incidents — early
   warning within 24 hours, notification within 72 hours, and a final report
   within one month — to the competent authority/CSIRT.
5. **Supply chain**: address the security of suppliers and third parties;
   identify critical suppliers and report significant incidents affecting the
   supply chain.
6. **Registration and supervision**: register in the member state's registry
   (where applicable) and prepare for supervision/enforcement (ex-ante for
   essential, ex-post for important).
7. **Governance alignment**: map to DORA (for financial entities) and ISO
   27001 to avoid duplicate work.

## Artifact

A NIS2 pack: applicability determination, security-measure mapping and gap
assessment, incident-reporting workflow, and the supply-chain assessment.

## Contract

- The applicable member state's transposition law governs — verify the local
   implementing act, not just the directive text.
- Reporting timelines and the essential/important designation follow the
   national law.
- Vendor-neutral and client-neutral.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — classification, measures, open items.
- Re-verify the client's status as national transposition and sector lists
  finalize.
