# Skill `audit` — protocol SSOT

## Purpose

Frame and run a security or compliance audit for a client engagement: define the
scope, map it to the relevant frameworks, collect evidence, classify findings by
severity, and hand off remediation to owners.

Grounded in the CTO-role references: Splunk (cybersecurity & compliance), Devox
(security & privacy). Framework specifics (ISO 27001, SOC 2, NIST, PCI-DSS,
etc.) are owned by the GRC skills; this skill is the **framing method** that
applies to any of them.

## When to use

- A client asks "are we compliant?" or "how secure are we?" and an audit
  posture must be established.
- Before a third-party audit, certification, or attestation, to know what will
  be assessed and what evidence exists.
- At engagement start, to scope what security/compliance work is in bounds.

## Method

1. **Scope the audit.** State what is in scope (systems, data, processes,
   people) and what is explicitly out of scope. An audit that does not define
   its scope cannot produce trustworthy findings.
2. **Map to frameworks.** Identify the frameworks that apply (contractual,
   regulatory, or target certifications). Use the GRC skills to resolve which
   controls apply. Do not invent requirements beyond the chosen frameworks.
   Org risk principles → `grc/iso31000`. Software project SPMP / lifecycle risk
   → `/software-project-management-plan/audit` with ISO/IEC/IEEE 16085 (not a
   substitute for 31000, and not conflated with AppSec framework audits).
3. **Define the control list.** Translate framework requirements into a
   verifiable control set, each with a success criterion.
4. **Collect evidence.** For each control, gather evidence from the actual
   system or process (configs, logs, policies, interviews). Record where the
   evidence lives (`path:line` or artifact). If evidence does not exist, that
   is a finding — not a reason to skip the control.
5. **Classify findings** by severity:

   | Severity | Meaning |
   | --- | --- |
   | **Blocker** | Violates a mandatory control; immediate risk or non-compliance. |
   | **Warning** | Control partially met; risk or exposure that should be remediated. |
   | **Info** | Observations and opportunities that are not violations. |

6. **Assign remediation owners** and a suggested order. Findings without an
   owner are not resolved; they are only catalogued.
7. **Report.** Produce a findings brief: scope, controls assessed, status per
   control, findings by severity, and the recommended next step.

## Artifact

An audit scope + findings brief stored in the engagement workspace (for
example, `./fractional-cto/risk/audit-<date>.md`), with evidence recorded so
the audit is reproducible.

## Contract

- Every finding references a framework control and concrete evidence; no
  unsubstantiated findings.
- Scope is decided up front and stated; expanding scope mid-audit is a scope
  change, not a silent addition.
- Severity is consistent with the table above; a violation is not downgraded to
  "info" for convenience.
- The audit does not remediate; it identifies. Remediation is owned by the
  client (or by a separate engagement), and the handover protocol
  (`risk-to-cro`) transfers residual findings to the permanent owner.
