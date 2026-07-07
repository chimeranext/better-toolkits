# Proposal — Audit-engine family + domain-driven-advisor

**Date**: 2026-06-02
**Status**: Proposed — pending review
**Citing**: example-platform drift thesis (`docs/repo-health/atomic-design-drift-thesis.md`, legacy-ticket / legacy-ticket / legacy-ticket) · `atomic-design-toolkit` (component-layer audit) · `premortem` skill
**Anti-patterns in scope**: 1NF (Codd 1970), DRY (Hunt & Thomas), Conway's Law (Conway 1968), DDD bounded contexts (Evans), CDC contracts, Strangler Fig (Fowler), Explicit Architecture — Hexagonal / Ports & Adapters / Onion / Clean / CQRS (Graça 2017)

## Why

ChimeraNext already proved — with a receipt — that the same Conway's Law
anti-pattern produces "Drift Disease" at three layers: **schema** (1NF + DRY,
legacy-ticket), **primitive** (multiple-writers-no-owner, legacy-ticket, **$394K wasted
over 7.3 months**), and **component** (atomic-design absence, legacy-ticket). The
root cause is identical at every layer: *absence of single-source-of-truth
ownership enforcement at the structural level.*

We keep **hand-rolling** these audits one repo at a time. `example-platform` accumulated
~25 one-off `docs/repo-health/` documents (`domain-purity`, `clean-arch-findings`,
`supabase-boundary`, the `*-api-split` series) with no reusable command behind
them. The only audit that *was* productized — atomic-design — lives in a
separate plugin (`atomic-design-toolkit`) and only covers the component layer.

Meanwhile the org now runs a **polyglot fleet** (example-platform Supabase/TS,
vertivolatam Serverpod/Dart, habitanexus, better-microservices). Each new repo
re-discovers the same drift from scratch. The drift thesis itself names the cure
shape — *detection feeding 4-cure defense-in-depth* — but there is no portable
tool that performs the detection for the non-component layers.

This change productizes the detection half of the thesis as a **reusable audit
command family** in `make-no-mistakes-toolkit`, plus a guided entry point for
engineers who don't yet know which audit they need.

## What

A shared **audit-engine** and **report contract** in `make-no-mistakes-toolkit`,
six focused audit commands, and a `/domain-driven-advisor` that routes an
inexperienced user to the right audit(s) and stress-tests the result.

1. **Shared report contract (SSOT)** — `references/audit-report-schema.md` +
   `references/audit-report-schema.schema.json`. Defines namespaced finding-IDs,
   severity aligned with `governance.md` (`blocker|high|medium|low|advisory`),
   evidence fields, anti-pattern citation, a **cure-map** (which of the 4 cures
   apply), and the `@repo-health-exempt:` marker. Extracted from the schema that
   already exists in `atomic-design-toolkit`, which becomes a *conformant profile*
   (keeps its `E#` finding-types under a registered namespace).

2. **`audit-engine` skill** — the shared flow all commands delegate to
   (hybrid LLM-first detection → deterministic + adversarial verification →
   cure-mapping → emission). Parametrized by a detector profile.

3. **Six audit commands** (thin triggers, each pointing at a detector profile):
   - `/audit-schema-drift` — 1NF violations + columns duplicated across tables
     without SSOT (the `*_bio`-in-5-tables pattern) + multiple-writers-no-owner.
   - `/audit-contract-drift` — consumer-driven contract divergence between
     producer and consumer validation schemas (the "24 latent validation drifts").
   - `/audit-ddd` — bounded-context leakage, domain-purity violations,
     ubiquitous-language inconsistency.
   - `/audit-explicit-architecture` — Explicit Architecture (Graça) compliance:
     dependency-rule direction (domain/application must not import
     infrastructure), Hexagonal ports & adapters (primary vs secondary adapter
     placement, missing ports), Onion/Clean layering, and CQRS command/query
     separation. Complements `/audit-ddd` (that one audits *context* boundaries;
     this one audits *layered/ports* structure within a context).
   - `/audit-strangler` — monolith→microservices migration health (façade,
     incremental cutover vs big-bang, proxy/sidecar presence).
   - `/audit-enforcement-hooks` — Cure-4 coverage: detects absence or
     misconfiguration of PreToolUse/PostToolUse enforcement hooks at both
     repo-level (`.claude/hooks/`) and toolkit-level, missing/stale rules config
     (`.atomic-design-rules.json` analog), and structural rules with no hook
     backing them. The meta-audit that closes the loop — checks whether the
     cures the other audits *propose* are actually installed.

4. **`/domain-driven-advisor`** — guided router for the non-expert: inspects the
   repo and asks plain-language questions, recommends which audit(s) to run (or
   all six in sequence), optionally executes them via the engine, then runs the
   existing **`premortem`** skill on the aggregated remediation plan. It also
   runs an **agent-teams preflight**: if `~/.claude/settings.json` lacks
   `"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"`, it recommends enabling it (with
   the exact one-line diff) so the per-finding fan-out parallelizes across an
   agent team — recommend-only unless the user consents.

5. **Emission (per the contract)** — each run produces: a findings doc in
   `docs/repo-health/`, an OpenSpec change (`proposal`/`design`/`tasks`),
   Bilingual-Layer Linear issues per `blocker|high` finding, and **4-cure
   scaffold proposals** (suggested diffs for ownership + CI guard + CLAUDE.md
   rule + hook config — *proposed, not auto-applied* in v1).

## Impact

- **New files** in `make-no-mistakes-toolkit`: 1 shared contract (+ JSON
  schema), 1 `audit-engine` skill, 6 detector profiles, 7 commands
  (6 audits + advisor), 1 advisor triage reference, golden-fixture tests.
- **`atomic-design-toolkit`**: unchanged behaviorally; its
  `audit-report-schema.md` is annotated as a conformant profile of the shared
  contract (a follow-up, not blocking this change).
- **Version bump** of the toolkit manifest(s).
- **Relationship preserved (no fusion)**: the component layer stays owned by
  `atomic-design-toolkit`; MNM owns the architecture/process layers. A future
  `/audit` meta-dispatcher can delegate the component layer cross-plugin.
- **Out of scope (Phase 2, per the thesis "hooks first")**: the 4-cure
  *auto-installer* and a unified `.repo-health-rules.json` enforcement hook.
  v1 emits cure *proposals*; humans apply them (consistent with the gated
  working style).
