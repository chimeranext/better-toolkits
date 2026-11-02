# Skill `soc2` — protocol SSOT

## Purpose

Prepare a service organization for an AICPA SOC 2 attestation (System and
Organization Controls 2). The fractional CTO runs the readiness work — scope,
trust services criteria, control design, and evidence — while the report is
issued by an independent CPA firm.

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client sells services to enterprises that require SOC 2 reports.
- A client has a SOC 2 report but the control environment is not genuinely
  operational.
- A client needs to decide Type I vs. Type II and the report scope.

## Method

1. **Scope the system**: the description of the system (boundary, services,
   infrastructure, software, people, data, processes).
2. **Select trust services categories**: security (always required), plus
   availability, confidentiality, processing integrity, and/or privacy as the
   business needs.
3. **Map controls to criteria**: for each selected category, map existing and
   required controls to the Trust Services Criteria (TSC) points of focus.
4. **Readiness assessment**: walk each control for design (suitably designed)
   and operating effectiveness (for Type II); identify gaps.
5. **Remediate and document**: implement missing controls and collect evidence
   (configs, logs, reviews, approvals).
6. **Prepare for the audit**: provide the control matrix, evidence index, and
   a system description for the auditor.
7. **Continuous monitoring**: maintain evidence so the report can be reissued
   without a scramble.

## Artifact

A SOC 2 readiness pack: system description, TSC control matrix, gap assessment
with remediation plan, and an evidence index.

## Contract

- The report itself is issued by the independent auditor, not by this skill.
- Security is always in scope; other categories are explicit choices.
- Vendor-neutral and client-neutral.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — control matrix, gaps, evidence index.
- Confirm the current AICPA TSC and the report period before the audit.
