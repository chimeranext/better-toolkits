# Skill `ism` — protocol SSOT

## Purpose

Assess and build a cybersecurity posture against the Australian Cyber Security
Centre (ACSC) Information Security Manual (ISM). The ISM is the control
framework used by Australian government entities and widely adopted as a
baseline by Australian industry.

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client must meet Australian government or security requirements.
- A client wants a pragmatic, ACSC-aligned security baseline.
- A client is asked to demonstrate Essential Eight maturity.

## Method

1. **Scope the system(s)** and their security objectives per the ISM's
   model (confidentiality, integrity, availability, and the role/trust
   environment).
2. **Map ISM controls**: the ISM groups controls into themes — governance,
   risk management, personnel, physical, communications (network), and
   information systems (platform, applications, data) — each with a control
   identifier and a security objective.
3. **Assess the Essential Eight** (the ACSC's prioritized mitigation
   strategies):
   - Application control
   - Patch applications
   - Configure Microsoft Office macro settings
   - User application hardening
   - Restrict administrative privileges
   - Patch operating systems
   - Multi-factor authentication
   - Regular backups
   Score each at the maturity levels (0–3) with evidence.
4. **Gap analysis**: identify missing ISM controls and Essential Eight gaps;
   produce a prioritized remediation plan.
5. **Implement and evidence**: close gaps; collect evidence per control.
6. **Maintain**: revisit on change and on the ACSC's review cycles.

## Artifact

An ISM pack: system scope, ISM control mapping, Essential Eight maturity
scorecard, and a remediation plan.

## Contract

- Essential Eight maturity claims are evidence-based and match the ACSC
  definition of each level.
- Every mapped control has an owner and evidence.
- Vendor-neutral and client-neutral.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — mappings, maturities, open items.
- Verify against the current ISM edition and ACSC Essential Eight guidance.
