# SPMP audit rubric

## Scores

| Score | Meaning |
| --- | --- |
| **Presente** | Required content exists and is usable (may live by reference) |
| **Parcial** | Section exists but missing thresholds, owners, measures, or N/A lacks reason |
| **Ausente** | Required section missing with no N/A justification |
| **N-A justificado** | Explicitly not applicable **with reason** |

## Severity (findings)

| Severity | When |
| --- | --- |
| **Blocker** | Missing identification/approvals, undefined scope/baseline, or risk process claimed but no profile/strategy and project is in execution |
| **Warning** | Partial planning, pending owners, scales without thresholds, treatment “pendiente” on high-impact risks |
| **Info** | Style, ordering, optional annex gaps, overlay-only domain holes |

## Pass order

1. Score `iso-16326-spmp-outline.md` for the SPMP body.
2. Score risk companion against 16085 §8.1.2 headings (and §8.2.2 if treatment plans are claimed).
3. Optionally overlay `pmbok8-crosswalk.md`.
4. If the engagement separately claims ISO 31000 org GRC, run `/iso31000` — do not conflate with step 2.

## Evidence rules

- Quote at most a short phrase or write `not found`.
- Prefer `path` + section heading over long excerpts.
- Never commit the confidential client plan into the toolkit or brain unless the user owns that vault and asks.

## Learning calibration (human input)

When severity is ambiguous between Warning and Blocker for “register present, strategy absent”, prefer **Warning** if the project is still in draft approval; escalate to **Blocker** once the plan is approved for execution. Adjust only with the engagement lead.
