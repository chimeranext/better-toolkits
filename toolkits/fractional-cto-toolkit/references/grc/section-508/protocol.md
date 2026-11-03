# Skill `section-508` — protocol SSOT

## Purpose

Assess and support compliance with US Section 508 of the Rehabilitation Act,
which requires federal agencies to procure accessible information and
communication technology (ICT). Vendors must provide accessible products and
conformance documentation (VPAT).

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client sells ICT to US federal agencies or their contractors.
- A client must respond to a solicitation requiring Section 508 conformance.
- A client wants accessibility validated across its product line.

## Method

1. **Determine applicability**: is the product ICT (hardware, software, web,
   documentation, kiosks, content)? Check the 508 standards (36 CFR Part
   1194) applicability exceptions.
2. **Select the standards chapters**: the 508 standards align with WCAG 2.0
   Level AA for web and software (Chapter 5 is the most common baseline), plus
   hardware (Chapter 4), documentation/support (Chapter 6), etc.
3. **Test conformance**: functional and technical testing per chapter —
   automated plus manual (keyboard, assistive technology).
4. **Record results in a VPAT** (2.4/2.5 format): per criterion, state
   Supports / Partially Supports / Does Not Support / Not Applicable with
   remarks; note WCAG version and the testing methods.
5. **Remediate**: fix findings; update the VPAT.
6. **Provide to procurement**: deliver the VPAT and any functional performance
   criteria documentation.

## Artifact

A Section 508 pack: applicability determination, test results per chapter,
and a completed VPAT with remarks.

## Contract

- The VPAT is accurate and current for the version of the product sold.
- Claims of support must be backed by the test record.
- Vendor-neutral and client-neutral.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — VPATs, findings, evidence.
- Verify against the current 508 standards and the latest VPAT format.
