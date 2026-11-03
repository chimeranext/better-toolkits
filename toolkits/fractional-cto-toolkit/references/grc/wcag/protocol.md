# Skill `wcag` — protocol SSOT

## Purpose

Audit and remediate web content against the Web Content Accessibility
Guidelines (WCAG 2.2), typically at Level AA. The fractional CTO delivers the
conformance assessment and the remediation path, supporting legal and
procurement obligations (e.g., US Section 508, EU EAA).

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client must meet accessibility law or customer requirements.
- A client's digital product is flagged in a compliance review.
- A client wants accessibility as a quality differentiator.

## Method

1. **Define the conformance target**: the level (A, AA, or AAA) and the
   scope of content (all pages, key flows, or a sample per WCAG sampling
   guidance).
2. **Run the audit**: evaluate against the four principles — **Perceivable**
   (text alternatives, adaptable, distinguishable), **Operable** (keyboard,
   time, navigation), **Understandable** (readable, predictable, input
   assistance), and **Robust** (compatible) — using automated tools plus
   manual testing (keyboard-only, screen reader, color contrast).
3. **Record findings** per success criterion with the specific location and
   a failure description.
4. **Prioritize remediation**: fix blockers first (navigation, forms, media,
   contrast); produce a remediation backlog with owners.
5. **Verify**: re-test after fixes; keep evidence per criterion.
6. **Produce a VPAT** (Voluntary Product Accessibility Template) or
   equivalent conformance report.

## Artifact

An accessibility pack: conformance statement (level and scope), detailed audit
report, remediation backlog, and a completed VPAT.

## Contract

- Level AA is the common target; the conformance claim matches what was
  actually tested.
- Automated checks are supplemented by manual testing — they are not
  equivalent.
- Vendor-neutral and client-neutral; do not name the auditing tool vendor as
  a substitute for the audit.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — conformance statement, backlog, evidence.
- Verify against the current WCAG version (2.2) and the client's applicable
  regulation (e.g., Section 508 refresh).
