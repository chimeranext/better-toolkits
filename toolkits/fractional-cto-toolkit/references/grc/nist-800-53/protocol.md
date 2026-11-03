# Skill `nist-800-53` — protocol SSOT

## Purpose

Select, implement, and assess controls from NIST SP 800-53 (rev. 5)
security and privacy control catalog for a system or organization, using the
baseline approach (low / moderate / high). The fractional CTO turns the
catalog into a usable control baseline and gap assessment.

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client operates under FISMA, FedRAMP, or a state/federal mandate that
  references 800-53.
- A client needs a rigorous, catalog-driven control framework rather than a
  lighter standard.
- A client must demonstrate control coverage to auditors or assessors.

## Method

1. **Determine the system boundary** and its security impact level (FIPS 199
   / impact analysis for confidentiality, integrity, availability).
2. **Select the baseline** (low, moderate, or high) and tailor it: apply
   scoping considerations, allow/deny overlays, and compensating controls.
3. **Map to the catalog**: organize selected controls into families
   (AC — access control, AT — awareness, AU — audit, etc.) with a control
   owner per item.
4. **Implement and document**: capture control implementation details —
   system-specific, common, and hybrid control determinations.
5. **Assess** (per NIST SP 800-53A): define assessment objectives, run
   procedures, and record findings.
6. **Produce a POA&M** for findings; assign remediation owners and dates.
7. **Maintain**: continuous monitoring per NIST SP 800-137.

## Artifact

A control package: system boundary diagram, impact-level determination,
tailored baseline, control implementation summary, assessment findings, and a
Plan of Action and Milestones (POA&M).

## Contract

- The selected baseline matches the system's impact level; tailoring is
  documented with rationale.
- Every control has an owner and evidence.
- Vendor-neutral and client-neutral.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — baseline, POA&M, and evidence locations.
- Verify against the current revision of NIST SP 800-53 and 800-53A.
