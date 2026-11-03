# Skill `sox-itgc` — protocol SSOT

## Purpose

Define, implement, and test IT General Controls (ITGC) that support US
Sarbanes-Oxley (SOX) financial reporting. The fractional CTO owns the IT side
of the control framework; the financial statement audit is led by the external
auditor.

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client is a US public company (or affiliate) subject to SOX Section 404.
- A client is preparing for an IPO and must stand up ITGC.
- An audit found ITGC deficiencies that need a remediation plan.

## Method

1. **Scope in-scope systems**: applications and infrastructure that materially
   affect financial reporting (the "in scope" population).
2. **Inventory key reports and interfaces**: financial reports, interfaces,
   and the data flows that feed them.
3. **Identify ITGC domains**:
   - **Access to programs and data** (segregation of duties, least privilege,
     review of access),
   - **Program changes** (change management: authorization, testing, approval,
     migration),
   - **Program development** (new systems and releases),
   - **Computer operations** (job scheduling, backups, incident handling).
4. **Map key controls** to assertions (existence, completeness, accuracy,
   cutoff) and to in-scope financial statement line items.
5. **Design tests**: for each key control, define the test procedure and the
   sample size per audit guidance.
6. **Execute tests and gather evidence**: screenshots, logs, approvals,
   access reviews.
7. **Track deficiencies**: document control gaps, severity, and remediation
   with owners and dates.

## Artifact

An ITGC pack: in-scope systems list, ITGC matrix (domain → control →
assertion), test plan with samples, evidence log, and a deficiency register.

## Contract

- Controls are designed to prevent, or detect and correct, material
  misstatements — the linkage to assertions is explicit.
- Evidence is retained per the retention policy and made available to the
  auditor.
- Vendor-neutral and client-neutral.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — control matrix, evidence, open deficiencies.
- Coordinate with the external auditor on the control set and test approach.
