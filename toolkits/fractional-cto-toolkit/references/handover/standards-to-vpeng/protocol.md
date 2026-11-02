# Skill `standards-to-vpeng` — protocol SSOT

## Purpose

Transfer the engineering-standards workstream from the fractional CTO to the
client's VP Engineering (or engineering leadership). The goal is that the
standards keep their adoption status, audit baseline, and enforcement after the
CTO steps back.

Grounded in the CTO-role references (engineering standards, adoption and audit
practice) and the organic-executive handover flow: the standards set is
delivered to the permanent enforcement owner with explicit acceptance.

## What is handed over

1. **The standard set.** The canonical set of engineering standards (see
   `engineering-standards-setup/audit`), their index, and where each lives.
2. **Adoption baseline.** Per standard, the last audit status (ready / partial /
   absent), the date, and the evidence.
3. **Remediation debt.** Open findings from the audit with severity, owner, and
   the incremental remediation plan — each with urgency.
4. **Enforcement mechanisms.** How the standards are enforced (hooks, CI gates,
   PR templates, review checklists) and what is wired where.
5. **Open items.** Standards not yet adopted, enforcement gaps, and pending
   decisions — each with owner and urgency.

## To whom

The VP Engineering (or the named engineering leader who enforces standards).
Confirm the recipient by name and role.

## Delivery mechanism

1. **Assemble the handover packet** in the engagement workspace (for example,
   `./fractional-cto/handover/standards-to-vpeng/<date>/`): standard set, audit
   baseline, remediation debt, enforcement map, open-item register.
2. **Hold a briefing session** walking through the baseline, the debt, and the
   enforcement mechanisms, so the VP can challenge the baseline and take
   ownership.
3. **Obtain explicit acceptance.** The VP acknowledges the standards set and
   states which standards and enforcement gates they own. Unaccepted items stay
   with the CTO.
4. **Transfer access** to the standards library, audit tooling, and enforcement
   configuration; revoke CTO-only access.
5. **Re-confirm after a transition period** that standards continue to be
   audited and enforced without the CTO.

## Contract

- Every standard has an adoption status, evidence, and an accepted owner; no
   standard is orphaned.
- Remediation debt is transferred with severity, owner, and incremental
   remediation — never as a mass-refactor mandate.
- Enforcement mechanisms are mapped to their owning repo/CI configuration.
- The standards index is the single source of truth; it is not duplicated.
