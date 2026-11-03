# Skill `singapore-pdpa` — protocol SSOT

## Purpose

Assess and support compliance with Singapore's Personal Data Protection Act
2012 (PDPA), enforced by the Personal Data Protection Commission (PDPC). The
PDPA protects personal data in Singapore and is the model for several regional
regimes.

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client processes personal data of individuals in Singapore.
- A client engages in telemarketing or is on the Do Not Call (DNC) registry
  scope.
- A client needs a data-breach management plan (mandatory notification).

## Method

1. **Map the obligations**:
   - Consent, purpose limitation, and notification obligations.
   - Access and correction rights.
   - Accuracy, protection (reasonable security), and retention limits.
   - Transfer limitation (cross-border transfers).
   - Accountability (appoint a Data Protection Officer — DPO — and make
     policies available).
2. **Check the Do Not Call (DNC) regime**: telemarketing messages to
   Singapore numbers require checking the DNC registry and using proper sender
   ID; honor opt-outs.
3. **Build data-breach management** (mandatory since 2022): assess whether a
   breach is "notifiable" (likely to result in significant harm to data
   subjects or significant impact on the organization); notify the PDPC and
   affected individuals as required (within 72 hours for notifiable breaches
   — verify the current timeline under the rules).
4. **Assess cross-border transfers**: transfer personal data outside
   Singapore only to jurisdictions with comparable protection or via the
   prescribed transfer mechanisms/contractual clauses.
5. **Operate**: consent records, DPO appointment, privacy policy, SAR
   workflow, and staff training.

## Artifact

A PDPA pack: obligations checklist, DNC compliance check, breach-management
plan and notification flow, transfer assessment, and SAR workflow.

## Contract

- The DPO is named and contactable; the privacy policy states how to reach it.
- Breach notifications follow the PDPC's prescribed contents and timelines.
- Vendor-neutral and client-neutral.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — checklist, breach plan, open items.
- Verify against the current PDPA regulations and PDPC advisory guidelines
  (including recent amendments on data portability and enforcement).
