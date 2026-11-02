# Skill `swift-csp` — protocol SSOT

## Purpose

Assess and secure the local SWIFT environment against the SWIFT Customer
Security Programme (CSP) and its Customer Security Controls Framework (CSCF).
The fractional CTO prepares the self-assessment and remediation for the SWIFT
user's attestation to their counterparties and SWIFT.

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client is a SWIFT user (bank, broker, or corporate) and must attest
  controls annually.
- A client is preparing for a SWIFT security assessment or after an incident.
- A client needs to secure messaging infrastructure beyond the baseline.

## Method

1. **Enumerate the SWIFT environment**: all components in scope — messaging
   interfaces, PKI/certificates, and related infrastructure.
2. **Map the CSCF controls**: classify each control as **mandatory** or
   **advisory** and by purpose:
   - A — protect your environment (access, segregation, hardening),
   - B — prevent compromise (malware defenses, software integrity),
   - C — detect (monitoring, anomaly detection, logging),
   - D — respond & recover (incident response, backup, continuity).
3. **Self-assess** against the current CSCF version with evidence per control
   (configs, screenshots, logs).
4. **Identify gaps** and prioritize remediation, mandatory controls first.
5. **Complete the attestation**: fill the KYC-SA / self-assessment and submit
   through the SWIFT portal per the programme calendar.
6. **Retain evidence** for audits and continuous improvement.

## Artifact

A SWIFT CSP pack: environment diagram, CSCF control matrix (mandatory/advisory,
A/B/C/D), self-assessment results, and a remediation plan.

## Contract

- Mandatory controls are all in place before submission; advisory controls are
  risk-ranked and scheduled.
- Attestation dates follow the SWIFT CSP calendar for the entity's year.
- Vendor-neutral and client-neutral.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — controls, attestation state, evidence.
- Verify against the current CSCF version published by SWIFT.
