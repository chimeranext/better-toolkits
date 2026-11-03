# Skill `risk-to-cro` — protocol SSOT

## Purpose

Transfer ownership of the risk and resilience workstream from the fractional
CTO to the client's Chief Risk Officer (CRO). The goal is that no risk posture,
open item, or mitigation loses its owner when the CTO steps back.

Grounded in the CTO-role references (Splunk cybersecurity & compliance, Devox
security & privacy) and the organic-executive handover flow: the CTO delivers
the current posture and residual work to the permanent owner, with explicit
acceptance.

## What is handed over

1. **Current posture.** A concise statement of the risk and resilience state at
   handover date:
   - Audit posture (see `risk/audit`): frameworks in scope, controls assessed,
     status per control.
   - Incident response posture (see `risk/incident-response`): plan, roles,
     severity table, runbook index.
   - Disaster recovery posture (see `risk/disaster-recovery`): tiers, RPO/RTO,
     mechanisms, last test results.
   - Resilience posture (see `risk/resilience`): failure-mode inventory,
     experiment log, hardening actions.
2. **Open items.** Each item with:
   - **Status** (open, in progress, blocked).
   - **Evidence** (where it lives: report, finding, `path:line`).
   - **Owner** (the role/person responsible going forward).
   - **Urgency** (blocker / this quarter / scheduled).
3. **Known risks and residual risk.** What is accepted, what is being
   remediated, and what needs a decision.
4. **Cadence artifacts.** Any recurring reports (dashboards, audit updates) and
   their schedule.

## To whom

The Chief Risk Officer (or the named risk owner in the client org). Confirm the
recipient by name and role before assembling the packet; handing to "the
company" is not a handover.

## Delivery mechanism

1. **Assemble the handover packet** in the engagement workspace (for example,
   `./fractional-cto/handover/risk-to-cro/<date>/`): posture summary, open-item
   register, and pointers to every source artifact.
2. **Hold a briefing session** (live or recorded) walking through the posture,
   the open items, and the urgencies. The CRO should be able to ask questions
   and challenge the posture.
3. **Obtain explicit acceptance.** The CRO acknowledges receipt and states which
   items they own. Unaccepted items remain with the CTO until re-assigned —
   nothing is silently orphaned.
4. **Hand over credentials and access** required to operate the risk
   workstream (dashboards, evidence repositories, runbook access), and revoke
   what is no longer needed by the CTO.
5. **Re-confirm after a transition period** (for example, two weeks) that the
   CRO can operate without the CTO.

## Contract

- Ownership transfers only on explicit acceptance; an open item without an
  accepted owner stays on the CTO.
- Every open item has an urgency and a named owner; no "miscellaneous"
  bucket.
- The packet is evidence-backed and points to source artifacts; it is not a
  summary with no traceability.
- Urgent items (blockers) are escalated in the briefing, not buried in the
  document.
