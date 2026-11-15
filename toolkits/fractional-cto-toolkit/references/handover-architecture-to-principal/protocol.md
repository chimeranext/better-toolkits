# Skill `architecture-to-principal` — protocol SSOT

## Purpose

Transfer architecture stewardship from the fractional CTO to the client's
Principal Architect (or senior engineering owner). The goal is that the
architecture keeps its decision record, constraints, and technical-debt
visibility after the CTO steps back.

Grounded in the CTO-role references (MIT architecture, Splunk product/platform
leadership, Devox architecture) and the organic-executive handover flow: the
decision record is delivered to the permanent owner with explicit acceptance.

## What is handed over

1. **Decision record (ADRs).** The set of significant decisions (see
   `architecture-decision-ieee42010`) with status, rationale, options considered, and
   consequences. Include any decisions that are `proposed` and awaiting a
   decision-maker.
2. **Architecture documentation.** Current architecture, system boundaries,
   and the diagrams that match reality — with a note on where reality and
   documentation diverge.
3. **Constraints and non-negotiables.** Compliance, cost, latency, skills, and
   platform constraints that shaped the architecture and still bound it.
4. **Technical debt inventory.** Known debt with severity, owner, and the
   trigger that should pay it down (see the migration and stack-evaluation
   skills for the assessment method).
5. **Open items.** Pending evaluations (stack tradeoffs, migrations), decisions
   in flight, and stakeholders who expect an outcome — each with owner and
   urgency.

## To whom

The Principal Architect (or the named engineering steward of the architecture).
Confirm the recipient by name and role.

## Delivery mechanism

1. **Assemble the handover packet** in the engagement workspace (for example,
   `./fractional-cto/handover/architecture-to-principal/<date>/`): ADR index,
   architecture documentation, constraints, debt inventory, open-item register.
2. **Hold a briefing session** walking through the decision record and the open
   evaluations, so the Principal can challenge decisions and inherit the
   reasoning.
3. **Obtain explicit acceptance.** The Principal acknowledges the decision
   record and states which decisions and evaluations they own. Unaccepted items
   stay with the CTO.
4. **Transfer access** to the ADR store and architecture documentation; revoke
   CTO-only access.
5. **Re-confirm after a transition period** that architecture decisions continue
   to be recorded and stewarded without the CTO.

## Contract

- Every significant decision has an ADR with status and rationale; decisions
  without a recorded rationale are not handed over as "made".
- Technical debt is inventoried with severity, owner, and a payoff trigger.
- Open evaluations are transferred with owners and urgencies.
- The ADR store is the single source of truth for decisions; it is not
  duplicated.
