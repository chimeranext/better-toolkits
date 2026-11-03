# Skill `process-to-ops` — protocol SSOT

## Purpose

Transfer the process-engineering workstream from the fractional CTO to the
client's Ops function (COO or the operations owner). The goal is that every
standardized process — SOPs, playbooks, runbooks — keeps an owner, a refresh
cadence, and a verification after the CTO steps back.

Grounded in the CTO-role references (process engineering, operational
excellence) and the organic-executive handover flow: the process standard is
delivered to the permanent owner with explicit acceptance.

## What is handed over

1. **Process inventory.** The complete set of standardized processes (see
   `process-standardization`), each with:
   - Type: SOP (steady-state) vs. playbook (judgment) vs. runbook (execute under
     pressure).
   - The process owner role.
   - Where the canonical version lives.
2. **The documents themselves.** The canonical SOPs/playbooks/runbooks in their
   versioned home, with any known drift between document and reality.
3. **Automation.** Which steps are automatable, which are automated, and where
   the automation lives (see `automation-triage`).
4. **Open items.** Processes not yet standardized, documents not yet verified,
   and ownership gaps — each with owner and urgency.
5. **Cadence and verification.** How each process is kept current and how it is
   tested (runbook drills, SOP audits).

## To whom

The COO / Ops owner (the permanent owner of operating processes). Confirm the
recipient by name and role.

## Delivery mechanism

1. **Assemble the handover packet** in the engagement workspace (for example,
   `./fractional-cto/handover/process-to-ops/<date>/`): process inventory, links
   to canonical documents, automation map, open-item register.
2. **Hold a briefing session** walking through the inventory, the ownership
   assignments, and the verification cadence, so Ops can challenge the process
   list and take ownership.
3. **Obtain explicit acceptance.** Ops acknowledges the inventory and states
   which processes they own. Unaccepted processes stay with the CTO.
4. **Transfer access** to the process library and any automation tooling;
   revoke CTO-only access.
5. **Re-confirm after a transition period** that processes are being
   maintained and verified without the CTO.

## Contract

- Every process has a type, a canonical home, and an accepted owner; no process
   is orphaned.
- Automation is mapped to its owning platform and keepers.
- Open standardization gaps are transferred with owners and urgencies.
- The process inventory is the single source of truth; it is not duplicated
   across documents.
