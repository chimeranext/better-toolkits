# Skill `grc-to-cco` — protocol SSOT

## Purpose

Transfer ownership of the GRC (governance, risk, compliance) workstream from
the fractional CTO to the client's Chief Compliance Officer (CCO). The goal is
that every regulatory obligation keeps a framework mapping, evidence, and a
named owner after the CTO steps back.

Grounded in the CTO-role references (Splunk compliance, Devox security &
privacy) and the organic-executive handover flow: obligations are delivered to
the permanent compliance owner with explicit acceptance.

## What is handed over

1. **Framework inventory.** The set of frameworks that apply (Universal and
   Regional — ISO, NIST, SOC 2, PCI-DSS, GDPR, HIPAA, etc.), each with:
   - Why it applies (contractual, regulatory, target certification).
   - Scope of applicability (entities, systems, data).
   - Current status (certified / in progress / gap).
2. **Obligation register.** Per framework, the obligations and where they stand:
   - Control/requirement identifier.
   - Evidence location (policy, report, scan, `path:line`).
   - Status (met / partial / missing).
   - Owner and urgency for any gap.
3. **Open items.** Each gap or in-flight remediation with status, evidence,
   owner, and urgency.
4. **Renewal and cadence.** Certification/attestation dates, audit calendars,
   and recurring reporting obligations.
5. **Records and access.** Where compliance records live and what access is
   needed to operate them.

## To whom

The Chief Compliance Officer (or the named compliance owner). Confirm the
recipient by name and role; "compliance" without a person is not a handover.

## Delivery mechanism

1. **Assemble the handover packet** in the engagement workspace (for example,
   `./fractional-cto/handover/grc-to-cco/<date>/`): framework inventory,
   obligation register, open-item register, and pointers to all evidence.
2. **Hold a briefing session** walking through the framework inventory, the
   obligation status, and the urgencies. The CCO must be able to challenge the
   status of any obligation.
3. **Obtain explicit acceptance.** The CCO acknowledges the inventory and states
   which obligations they own. Unaccepted obligations stay with the CTO.
4. **Transfer access** to compliance evidence, attestation platforms, and
   dashboards; revoke CTO-only access.
5. **Re-confirm after a transition period** that the CCO can sustain the
   compliance calendar without the CTO.

## Contract

- Every obligation has a framework, evidence, status, and an accepted owner; no
  obligation is orphaned.
- Gaps are transferred with owners and urgencies — never as a list of
  "compliance issues" with no owner.
- Certification dates and renewal cadences are explicit so nothing lapses
  silently.
- The packet is traceable to source evidence; it is not a compliance summary
  with no backing artifacts.
