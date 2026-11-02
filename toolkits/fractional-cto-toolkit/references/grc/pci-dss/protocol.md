# Skill `pci-dss` — protocol SSOT

## Purpose

Scope and assess compliance with the Payment Card Industry Data Security
Standard (PCI DSS) for environments that store, process, or transmit
cardholder data. The fractional CTO delivers the scoping and readiness work;
the compliance report (ROC or SAQ) is produced per the merchant/service-provider
level.

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client accepts card payments and must meet PCI DSS requirements.
- A client is a service provider (e.g., payment gateway, processor) with
  higher validation levels.
- A client needs to reduce scope (tokenization, segmentation) before an
  assessment.

## Method

1. **Scope the cardholder data environment (CDE)**: locate where cardholder
   data (CHD) and sensitive authentication data (SAD) flow and are stored.
2. **Reduce scope**: apply segmentation, tokenization, and SAD-retention
   elimination so the CDE is as small as possible; document the boundary.
3. **Map the 12 requirements** (PCI DSS v4.0): build and maintain secure
   systems (1–4), protect account data (3–4), maintain a vulnerability
   management program (5–6), implement strong access control (7–8), regularly
   monitor and test (10–11), and maintain an information security policy (12).
4. **Determine validation path**: SAQ type (A, A-EP, D, etc.) vs. ROC and
   the reporting timing for the merchant level and channel.
5. **Gap analysis**: assess each requirement and sub-requirement; identify gaps
   and remediation owners.
6. **Collect evidence**: configuration snapshots, scan reports (ASV quarterly
   scans for external), penetration test results, and policy documents.
7. **Compile the evidence pack** for the QSA or ISA and the acquiring bank.

## Artifact

A PCI compliance pack: CDE scope diagram, requirement/sub-requirement matrix,
gap assessment, validation-path recommendation, and an evidence index.

## Contract

- Scope is honest and evidence-backed; shrinking scope only via real
  measures (segmentation, tokenization), never by hiding systems.
- SAD (e.g., CVV2, full magnetic stripe, PIN) is never stored.
- Vendor-neutral and client-neutral.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — scope, matrix, gaps, evidence.
- Confirm the current PCI DSS v4.0 effective dates and the card brand
  validation requirements.
