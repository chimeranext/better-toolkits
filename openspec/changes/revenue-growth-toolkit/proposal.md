# Proposal — revenue-growth-toolkit (fusion of aaarrr + media-buyer)

**Change:** `revenue-growth-toolkit`
**Domain:** `toolkit:revenue-growth`
**Status:** Proposed

## What

Fuse `aaarrr-flywheel-toolkit` + `media-buyer-toolkit` into one `revenue-growth-toolkit`
covering the whole paid-growth lifecycle: strategy/orchestration (AAARRR funnel + flywheel)
over execution (paid-media across Meta/TikTok/LinkedIn/Google/YouTube/Spotify). The ads MCP
lives in `shared/mcp/social-media-ads-mcp` (ViteMCP stateless) and, for Meta, executes the
official **Ads CLI** instead of raw Graph API HTTP (ToS-sanctioned agent channel). Analytics/
dashboard are provided by **PostHog self-hosted (Podman)** + its MCP. Derived metrics
(LTV:CAC, K-factor, churn, cohorts) are pure Python scripts.

## Why

- aaarrr (strategy) and media-buyer (execution) serve the same goal: revenue via paid growth.
  A single `revenue-growth-toolkit` gives one install/entry surface.
- Direct Graph API scripting (aaarrr's `graph-api.ts`) risks Meta ToS for agentic ad buying.
  The **Ads CLI** is Meta's official AI-agent channel. Convergence: one MCP → Ads CLI.
- Hand-rolled dashboard snapshots are redundant: **PostHog** (self-hosted, Podman) already
  computes funnels/retention/insights and exposes an MCP.
- Consistency: derived-metric calculators migrate from TS → Python (like `notion-enrich.py`,
  `netlist-diff.py`).

## What Changes

- New `toolkits/revenue-growth-toolkit/` = merge of `aaarrr-flywheel-toolkit/` +
  `media-buyer-toolkit/` (skills, commands, agents, workflows, funnels, templates, references,
  scripts).
- MCP `social-media-ads-mcp` stays in `shared/mcp/`; its **Meta adapter executes Ads CLI**
  (`meta ads <resource> <action>`). Other networks keep official SDKs/APIs.
- Migrate `ltv-cac-calculator.ts`, `referral-tracker.ts`, `churn-detector.ts` → Python
  (`ltv_cac_calculator.py`, `referral_tracker.py`, `churn_detector.py`); add
  `cohort_analysis.py`. Remove `lib/graph-api.ts`.
- Add PostHog self-hosted (Podman) setup + MCP registration (opencode.json).
- Remove `aaarrr-flywheel-toolkit` and `media-buyer-toolkit` from the marketplace; register
  `revenue-growth-toolkit`.
- No `dashboard_snapshot.py` (PostHog covers dashboarding).

## Non-goals

- No bidding engine / DSP / RTB.
- No organic social.
- No pixel/tag manager.
- No migration of the MCP itself to another language (stays TS/ViteMCP).
- No full multi-tenant PostHog deployment (single local Podman instance for now).

## Success criteria

- Single marketplace entry `revenue-growth-toolkit` replaces the two.
- Meta adapter runs via Ads CLI (no raw Graph API HTTP in Meta path).
- 3 calculators in Python + `cohort_analysis.py`; `graph-api.ts` gone.
- PostHog self-hosted (Podman) bootable + MCP connected in `opencode.json`.
- `openspec validate revenue-growth-toolkit --strict` passes.
- `marketplace_versioning.py check` clean.
