# Skill `requirements-to-cpo` — protocol SSOT

## Purpose

Transfer the requirements workstream from the fractional CTO to the client's
CPO / Product organization. The goal is that every requirement keeps its
traceability, acceptance criteria, and owner after the CTO steps back.

Grounded in the CTO-role references (requirements methodology: PRD/SRS per
IEEE/ISO 29148 practice, QT4L traceability) and the organic-executive handover
flow: the requirements set is delivered to the permanent owner with explicit
acceptance.

## What is handed over

1. **Requirements inventory.** The complete set of authored requirements (see
   `requirements-authoring-ieee29148`): PRDs/SRSs, each with scope, stakeholders, and
   status (draft / approved / implemented).
2. **Traceability.** The mapping from business need → requirement → design →
   test/acceptance criterion (QT4L shape). This is the core asset: without it,
   requirements are just prose.
3. **Acceptance criteria.** The verifiable, testable criteria per requirement —
   the contract between Product and Engineering.
4. **Backlog implications.** How the requirements translate into planned work:
   backlog items, epics, and the sequencing already established.
5. **Open items.** Requirements in draft, unresolved scope questions, and
   pending decisions — each with owner and urgency.

## To whom

The CPO (or the named product owner). Confirm the recipient by name and role.

## Delivery mechanism

1. **Assemble the handover packet** in the engagement workspace (for example,
   `./fractional-cto/handover/requirements-to-cpo/<date>/`): requirements
   inventory, traceability matrix, acceptance criteria, backlog map, open-item
   register.
2. **Hold a briefing session** walking through the inventory and the
   traceability, so Product can challenge the requirements and inherit the
   context.
3. **Obtain explicit acceptance.** Product acknowledges the inventory and
   states which requirements and traceability links they own. Unaccepted items
   stay with the CTO.
4. **Transfer access** to the requirements repository and any traceability
   tooling; revoke CTO-only access.
5. **Re-confirm after a transition period** that requirements continue to be
   maintained and traced without the CTO.

## Contract

- Every requirement has a status, traceability, and an accepted owner; no
   requirement is orphaned.
- Acceptance criteria are verifiable — a requirement that cannot be tested is
   not handed over as done.
- Open scope questions are transferred with owners and urgencies.
- The requirements repository is the single source of truth; it is not
   duplicated.
