# Skill `cis-controls` — protocol SSOT

## Purpose

Prioritize cybersecurity improvements using the CIS Critical Security Controls
v8. The Controls are a prioritized set of actions (18 control families) with
Implementation Groups (IG1/IG2/IG3) that scale by organization capability.

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client needs a pragmatic, prioritized security baseline without jumping to
  a full management system.
- A client wants to know "what to do first" after an assessment.
- A client must show security progress to partners or insurers on a budget.

## Method

1. **Map assets**: inventory enterprise assets (hardware, software, data, and
   network) and understand the environment.
2. **Select the Implementation Group**: IG1 (baseline for small/medium
   organizations), IG2 (more resources, risk-based), IG3 (advanced, highly
   regulated). Start at IG1 and extend.
3. **Assess the 18 controls**: inventory & control of enterprise assets
   (1–2), data protection (3), secure configuration (4), account management
   (5), access control (6), continuous vulnerability management (7), audit log
   management (8), email & web protections (9), malware defenses (10), data
   recovery (11), network infrastructure management (12), network monitoring
   (13), security awareness (14), service provider management (15), application
   software security (16), incident response (17), and penetration testing
   (18).
4. **Score implementation** per safeguard (the CIS Safeguards within each
   control) — implemented, partial, or missing.
5. **Prioritize**: fix IG1 gaps first; sequence the rest by risk and effort.
6. **Operate**: assign owners and measures; review on a cadence.

## Artifact

A CIS Controls pack: inventory view, IG determination, controls/safeguards
scorecard, and a prioritized implementation plan.

## Contract

- IG1 safeguards are completed before moving to IG2/IG3 claims.
- Scores are evidence-based (tools, configs, processes), not self-reported
  opinion.
- Vendor-neutral and client-neutral.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — scorecard, gaps, owners.
- Cross-reference with the NIST CSF/800-53 mapping where the client also runs
  those frameworks.
