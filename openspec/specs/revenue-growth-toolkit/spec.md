# revenue-growth-toolkit Specification

## Purpose

One paid-growth toolkit for a startup: AAARRR strategy/orchestration (funnel + flywheel) over
multi-network paid-media execution, with PostHog (self-hosted) as the analytics/dashboard
layer and pure-Python derived metrics. The ads MCP (`social-media-ads-mcp`, in shared/) is the
single execution surface; its Meta adapter uses the official Ads CLI.

## ADDED Requirements

### Requirement: Single revenue-growth toolkit

The system SHALL expose one `revenue-growth-toolkit` that merges the capabilities of
`aaarrr-flywheel-toolkit` and `media-buyer-toolkit` (skills, commands, agents, workflows,
funnels, templates, references, scripts). The two predecessor toolkits SHALL NOT remain as
separate marketplace entries.

#### Scenario: Install one toolkit

- **WHEN** a user installs the revenue-growth toolkit
- **THEN** they get both the AAARRR strategy layer and the paid-media execution layer from one
  plugin, and the two legacy toolkits are absent from the marketplace.

### Requirement: Ad execution via the shared MCP consuming the Meta Ads CLI

The system SHALL execute paid-media operations through the shared `social-media-ads-mcp` MCP
(ViteMCP stateless). For Meta, the adapter SHALL invoke the official **Ads CLI**
(`meta ads <resource> <action>`) rather than issuing raw Graph API HTTP requests.

#### Scenario: Meta campaign creation via Ads CLI

- **WHEN** the MCP `create_campaign` tool targets `network: meta`
- **THEN** the adapter runs `meta ads campaign create ...` (Ads CLI) and maps the result to the
  normalized contract; no raw Graph API HTTP request is issued for Meta.
- **THEN** the result is marked draft/paused (drafts-first) and gated by `apply: true`.

#### Scenario: Other networks keep official SDKs

- **WHEN** a tool targets TikTok, LinkedIn, Google, YouTube, or Spotify
- **THEN** the corresponding adapter uses that network's official SDK/API (no Ads CLI equivalent).

### Requirement: Derived metrics in Python

The system SHALL compute LTV:CAC, referral K-factor, churn, and cohort analysis with Python
scripts (`ltv_cac_calculator.py`, `referral_tracker.py`, `churn_detector.py`,
`cohort_analysis.py`). The legacy TypeScript calculators and `lib/graph-api.ts` SHALL be removed.

#### Scenario: Unit economics report

- **WHEN** an agent requests unit economics
- **THEN** it runs `python3 scripts/ltv_cac_calculator.py --input <data>` and receives
  LTV (gross-margin), CAC blended/paid, payback, and LTV:CAC ratio.

### Requirement: PostHog self-hosted analytics + MCP

The system SHALL provide a PostHog self-hosted (Podman) instance as the analytics/dashboard
layer (funnels, retention, insights) and register its MCP for agent access.

#### Scenario: PostHog boot and MCP connection

- **WHEN** a developer starts the local PostHog container (Podman)
- **THEN** the PostHog MCP is reachable and registered in OpenCode config so agents can query
  funnels/retention/insights.

#### Scenario: No hand-rolled dashboard snapshot

- **WHEN** a user wants a funnel/retention dashboard
- **THEN** the agent queries PostHog (its MCP/API) instead of a bespoke snapshot script.
