# Skill `tprm` — protocol SSOT

## Purpose

Assess, monitor, and manage the risk introduced by third parties — vendors,
suppliers, partners, and subcontractors — including cloud services, data
processors, and outsourced operations. The fractional CTO builds a repeatable
third-party risk management (TPRM) process.

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client's critical operations depend on external providers.
- A client handles data or systems that pass through third parties.
- A client is asked by customers or auditors to show vendor risk management.

## Method

1. **Inventory third parties**: capture every vendor and the services/data
   they touch; assign a single owner per relationship.
2. **Classify criticality**: score each vendor by data sensitivity, system
   criticality, and business impact (high/medium/low).
3. **Apply due diligence levels**: high-criticality vendors get deeper review
   (security questionnaires, certifications, SOC 2/ISO reports, financial
   health); low-criticality get a lighter baseline.
4. **Assess and rate**: consolidate findings into a risk rating per vendor;
   flag unacceptable risks.
5. **Contractual controls**: align contracts with risk — data-processing
   clauses, sub-processor notification, audit rights, liability, breach
   notification, and exit assistance.
6. **Monitor continuously**: track certifications expiry, incident reports, and
   periodic re-assessment; maintain a review calendar.
7. **Plan exit**: define offboarding and data-return/deletion steps for every
   high-criticality vendor.

## Artifact

A TPRM program pack: vendor inventory, criticality and risk ratings, due
diligence results, contract-clause checklist, monitoring calendar, and exit
plans.

## Contract

- Every high-criticality vendor has a completed assessment and an owner.
- Risk ratings are documented with evidence (reports, questionnaires, vetting).
- Vendor-neutral and client-neutral: no client names; no tool endorsements.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — inventory, ratings, open items.
- Integrate with `pci-dss`/`gdpr` processor obligations where data flows
  trigger them.
