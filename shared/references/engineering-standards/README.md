# Engineering standards — index (6 practices)

Portable baseline for any client startup. **Not a greenfield framework** — names and
enforces conventions already in industry use.

| Sigla | Name | Scope | SSOT |
| --- | --- | --- | --- |
| **DSMS** | Domain-Sliced Module Structure | Where files live | [dsms-ifs-cps.md](dsms-ifs-cps.md) §1 |
| **IFS** | Intra-File Structure | How one file reads top-to-bottom | [dsms-ifs-cps.md](dsms-ifs-cps.md) §2 |
| **CPS** | Categorized Public Surface | How public barrels export | [dsms-ifs-cps.md](dsms-ifs-cps.md) §3 |
| **PRDS** | Pull Request Description Standards | PR body + reviewable size | [prds.md](prds.md) |
| **BrS** | Branching Strategy | Branches, naming, protection | [branching-strategy.md](branching-strategy.md) |
| **QT4L** | QA Traceability (four layers) | Req → automated test → manual QA → HITL | [qa-traceability-four-layers.md](qa-traceability-four-layers.md) |

The **clean code quartet** is DSMS + IFS + CPS + PRDS. BrS and QT4L complete the
six-practice family for branching and QA traceability.

**Adoption order:** DSMS → IFS → CPS → PRDS → BrS → QT4L.

**Day-to-day priority:** IFS, PRDS, and QT4L (reading rhythm, review rhythm, req→test trace).

## Adoption policy

- **Incremental only** — apply when adding or materially editing code in that area. No mass legacy refactors for compliance.
- **Satellite repos** — client `AGENTS.md` links here; do not duplicate full text in apps/packages.
- **Not a refactor license** — standards adoption does not authorize out-of-scope folder moves or barrel rewrites.

## Commands

| Command | Purpose |
| --- | --- |
| `/clean-code-standards-setup` | Scaffold pointers + PR template + QT4L stub in a client repo |
| `/clean-code-standards-audit` | Measure adoption; audit open PRs when `--prs` |

Protocol SSOT: `references/clean-code-standards-setup/protocol.md`, `references/clean-code-standards-audit/protocol.md`.

## Quick reference

| Question | Practice |
| --- | --- |
| Feature folder or `shared/`? | DSMS |
| imports → types → main → helpers? | IFS |
| Banner on sections? | IFS (file) / CPS (barrel) |
| Public barrel export? | CPS |
| PR description and size? | PRDS |
| Branch naming and protection? | BrS |
| Scenario → verification in tasks? | QT4L |

## Provenance

Generalized from HabitaNexus / Seacrets.Online process docs (`code-organization-standards`, `pull-request-description-and-scope`, `branching-strategy`, `qa-traceability-four-layers`). Client-specific assignees and tracker IDs belong in the client repo's `AGENTS.md`, not in this SSOT.
