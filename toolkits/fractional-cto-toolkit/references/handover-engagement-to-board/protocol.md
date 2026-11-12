# Skill `engagement-to-board` — protocol SSOT

## Purpose

Close or transition a fractional CTO engagement with a complete handover to the
client's CEO and Board. The goal is that the engagement ends with no orphaned
commitment, no hidden residual risk, and every workstream routed to a permanent
owner.

This is the top-level handover: it aggregates the domain-specific handovers
(risk, GRC, metrics, architecture, strategy, process, requirements, standards)
into one coherent close-out.

## What is handed over

1. **Outcomes delivered.** The engagement's original objectives and the actual
   outcomes, each with evidence (reports, metrics, artifacts).
2. **Commitment status.** Every commitment made during the engagement with a
   status: done / in progress / deferred / dropped (with reason).
3. **Workstream routing.** For each workstream, where ownership lands:
   - Risk & Resilience → `risk-to-cro`
   - GRC → `grc-to-cco`
   - Metrics → `metrics-to-vpeng`
   - Architecture → `architecture-to-principal`
   - Strategy → `strategy-to-board`
   - Process Engineering → `process-to-ops`
   - Requirements → `requirements-to-cpo`
   - Standards → `standards-to-vpeng`
   Each route references the corresponding handover packet.
4. **Residual risks and open items.** Anything not complete, with owner,
   urgency, and the plan to close it.
5. **Access and credentials.** What is returned, revoked, or transferred, and
   what the client should rotate.
6. **Recommended next steps.** What the client should do next, and whether a
   follow-on engagement of some form is advised.

## To whom

The CEO and Board — they are the ultimate owners of the engagement and its
residual obligations. The CEO is the point of delivery.

## Delivery mechanism

1. **Assemble the close-out packet** in the engagement workspace (for example,
   `./fractional-cto/handover/engagement-to-board/<date>/`): outcomes, commitment
   status, workstream routing, residual risks, access list.
2. **Hold a close-out session** with the CEO (and Board where appropriate) —
   not just a written report. Walk through outcomes, residual risks, and the
   decisions requested.
3. **Obtain explicit acceptance.** The CEO acknowledges the close-out and the
   routing of each workstream. Anything not accepted remains the CTO's
   responsibility until it is.
4. **Execute the access transition.** Revoke/transfer credentials per the
   access list and confirm it in the packet.
5. **Re-confirm after a transition period** (for example, two to four weeks)
   that no workstream depends on the CTO.

## Contract

- The close-out is complete: outcomes, commitments, routing, residual risks,
   and access are all accounted for — no "and everything else" bucket.
- Every residual risk has an owner and an urgency; none is dropped silently.
- Each workstream routes to a named handover packet and an accepted owner.
- The engagement is not considered closed until the CEO accepts the close-out.
