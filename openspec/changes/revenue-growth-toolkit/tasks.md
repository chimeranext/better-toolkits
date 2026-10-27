# Tasks — revenue-growth-toolkit

Change: `revenue-growth-toolkit` · Domain: `toolkit:revenue-growth` · Spec: `specs/revenue-growth-toolkit/spec.md`

## Phase A — OpenSpec materialization

- [x] Write `proposal.md`, `design.md`, `tasks.md`, `specs/revenue-growth-toolkit/spec.md`

## Phase B — Merge the two toolkits into `revenue-growth-toolkit`

- [x] T1: `git mv toolkits/aaarrr-flywheel-toolkit toolkits/revenue-growth-toolkit`
- [x] T2: Merge media-buyer skills/references into it (media-plan, creative-testing, budget-pacing, kill-rules, attribution-readout; skills.md reference)
- [x] T3: Author `package.json` + `.claude-plugin/plugin.json` + README + CHANGELOG for revenue-growth-toolkit (version 0.1.0); list merged skills in `package.json.skills`
- [x] T4: Rename aaarrr strategy commands (`aaarrr-launch` → `revenue-launch`, `aaarrr-analyze` → `revenue-analyze`) and update agent/command references
- [x] T5: Delete legacy dirs/files that are not part of the merged layout (keep only what D1 lists)

## Phase C — MCP: Meta adapter → Ads CLI

- [ ] T6: In `shared/mcp/social-media-ads-mcp/src/adapters/meta.ts`, route methods from `graph()` (raw Graph API HTTP) to the Ads CLI exec (`meta ads <resource> <action>`, `--no-input --force --json`). `platform/ads-cli.ts` transport added; per-method mapping + live validation pending (flags must be verified against the real Ads CLI, not invented).
- [x] T7: Update MCP README + `credentials.ts` env notes for the Meta system-user token (Ads CLI channel)
- [ ] T8: Verify MCP boots (`tsx src/server.ts`); note pre-existing TS errors are non-blocking (T43 pattern)

## Phase D — Python metrics migration

- [x] T9: Port `ltv-cac-calculator.ts` → `scripts/ltv_cac_calculator.py`
- [x] T10: Port `referral-tracker.ts` → `scripts/referral_tracker.py`
- [x] T11: Port `churn-detector.ts` → `scripts/churn_detector.py`
- [x] T12: Add `scripts/cohort_analysis.py` (cohort revenue/retention series)
- [x] T13: Add `scripts/creative_health.py`, `scripts/budget_pacing_check.py`, `scripts/kill_rule_engine.py` (operational helpers; propose, never auto-execute)
- [x] T14: Remove TS calculators + `scripts/lib/graph-api.ts`; update command/agent invocations to new Python names

## Phase E — PostHog self-hosted (Podman) + MCP

- [x] T15: Add `references/posthog/setup.md` (Podman hobby-deploy container, env, init)
- [x] T16: Register PostHog MCP in `opencode.json` (server entry)

## Phase F — Marketplace + registry

- [x] T17: Remove `aaarrr-flywheel-toolkit` + `media-buyer-toolkit` from `.claude-plugin/marketplace.json`; add `revenue-growth-toolkit` v0.1.0
- [x] T18: Bump versions via `marketplace_versioning.py write --range origin/main..HEAD`

## Phase G — Verification

- [x] T19: `openspec validate revenue-growth-toolkit --strict` passes
- [x] T20: Python scripts `py_compile` clean; grep no `2>/dev/null`
- [x] T21: `marketplace_versioning.py check` clean
- [ ] T22: `cargo`-free; MCP `tsx src/server.ts` boots
