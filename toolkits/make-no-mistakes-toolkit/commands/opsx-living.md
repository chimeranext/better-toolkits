---
description: "Startup-agnostic living spec overlay — builds openspec/features/<feature>/living.md with audit trail and changelog. References brainstorming-visual-companion skill (design artifacts) and systematic-debugging (evidence chain). Never deletes or rewrites openspec/specs/ or openspec/changes/ (SSOT invariant)."
argument-hint: "<feature> [--resolution <res> | --audit-only]"
priority: 75
---
# /opsx:living

Startup-agnostic `living.md` protocol — QA overlay (`QA overlayer`), not `openspec/specs/`. Builds `openspec/features/<feature>/living.md` with an audit trail (dates, commits, standards columns) for applied requirements and audit registration. Follows the reference model from `.cursor/commands/opsx-living.md`.

**References (SSOT links):**
- `skills/brainstorming-visual-companion/SKILL.md` — visual artifacts for design decisions (`parking lot`, `impact x ease`, `CD3` scoring).
- `skills/systematic-debugging/SKILL.md` — 5-why isolation (`postmortem-*.md`, `catalog-evidence.md`).
- `references/ready-to-review-mergeable/protocol.md` — protocol invariant (exit = human handoff; no merge authorization).
- `references/external-skills-obra-superpowers.md` — upstream source (`obra/superpowers`) without naming project.

**Catalog tracking:** `openspec/feature-catalog.yaml`. Input: feature key (e.g. `gdrive`).

**Steps (normative):**
1. Discover changes; pre-flight conflicts — if any conflict exists, stop and ask human for resolution (see `systematic-debugging` Phase 3: single hypothesis test).
2. Run standards checker (`scripts/opsx_living_standards.py`) — writes ISO 29148 / IEEE 29119-3 / ISO 31000 cells (`PASS` / `PARTIAL` / `FAIL`). Recompute those cells on every run (no cached stale results).
3. Append audit rows + changelog blocks for **new** deltas (or revision blocks per HITL); refresh Part 2 with fold rules (`Proceedencia` under each `# Study: Second of Study` heading). Do **NOT** concatenate delta bodies.
4. Link `openspec/features/<feature>.md` to `living.md`.
5. `openspec validate --specs` (no `--store`) — verifies `living.md` independently without overwriting `specs/`.

**Guardrails (mandatory HITL):**
- If a delta is **already recorded** in Part 3 (`changed on disk`) or audit links are **stale**, the command **must interrupt** — show conflicts, ask human, and continue only with explicit `--resolution=` (see `systematic-debugging` Phase 3.4: `If 3+ fixes failed: STOP and question architecture`).
- Never silently refresh Part 2 while Part 3 is out of date.
- No archive; no concatenation of deltas into Part 2.

**Anti-patterns forbidden (per SSOT / protocol):**
- Deleting or rewriting `openspec/specs/` or `openspec/changes/`.
- Silent refresh of Part 2 (`vista vigente`) when audit links stale.
- Merging without HITL (`HITL_APPROVED=1` or marker file) — `pre-push` guard (`2e71a02`) enforces.
- Passing secrets via args (use `/secret-use ENVVAR -- cmd` with `mode 0600` file; `rotate_google_cloud_console_oauth_client_secret.py` is the rotation helper).
- Hidden redirects (`2>/dev/null`, `>/dev/null`, `2>&1` — harness enforces visibility; `grep` checks PASS in this session).
