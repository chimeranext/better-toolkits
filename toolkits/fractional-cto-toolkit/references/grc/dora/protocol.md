# Skill `dora` — protocol SSOT

## Purpose

Assess and support compliance with the EU Digital Operational Resilience Act
(DORA — Regulation (EU) 2022/2554), applicable to EU financial entities
(banks, insurers, investment firms, payment/electronic-money institutions,
crypto-asset service providers, etc.) since 17 January 2025. It also imposes
obligations on ICT third-party service providers that serve financial entities.

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client is an EU financial entity in DORA's scope.
- A client is an ICT service provider to financial entities (contractual
   terms, and possibly the oversight framework for critical providers).
- A client needs to consolidate ICT risk and incident reporting.

## Method

1. **Determine applicability**: confirm the client's entity type is in
   DORA's scope (financial entities) or is an ICT third-party provider.
2. **ICT risk management** (Art. 5–16): build the ICT risk management
   framework — governance and roles (including a management-body mandate),
   ICT asset inventory, protection and prevention, detection, response and
   recovery, and a learning/communication process. Document business
   continuity and backup policies, and test them.
3. **Incident reporting** (Art. 17–23): classify ICT-related incidents;
   report **major incidents** to the competent authority — early warning
   within 24 hours, intermediate notification within 72 hours, and a final
   report within one month (per the RTS). For cross-border entities the
   single-entry-point rules apply.
4. **Digital operational resilience testing** (Art. 24–26): run the
   prescribed program — vulnerability assessments, penetration tests, and,
   for entities in the higher tiers, **threat-led penetration testing
   (TLPT)** through an authorized tester.
5. **ICT third-party risk management** (Art. 28–36): keep a register of
   information on all ICT third-party arrangements; apply due diligence;
   include the mandatory contractual clauses (Art. 30); monitor concentration
   risk and the exit strategy. Critical providers may fall under the EU
   oversight framework (Art. 31–43).
6. **Information sharing** (Art. 45): enable optional intelligence sharing
   arrangements among financial entities.
7. **Governance alignment**: map DORA to the ISMS/ISO 27001 work and the
   NIS2 obligations to avoid duplication (Art. 4 links the two).

## Artifact

A DORA pack: applicability determination, ICT risk-management framework,
incident-classification and reporting flow, testing plan (incl. TLPT
position), and the ICT third-party register.

## Contract

- Major-incident reporting follows the RTS timelines and content.
- The third-party register is complete and includes the contractual
   terms (Art. 30).
- Vendor-neutral and client-neutral.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — framework status, register, open items.
- Verify against the current RTS/ITS and the ECB/EBA/ESMA/EIOPA guidance.
