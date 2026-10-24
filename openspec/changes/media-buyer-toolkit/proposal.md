# Proposal

**Change ID:** `media-buyer-toolkit`
**Domain:** `toolkit:media-buyer-toolkit`

## Why

Paid media today is single-network and MCP-less inside this monorepo. `aaarrr-flywheel-toolkit` ships an `acquisition-buyer` agent that drives Meta Marketing API through Bash, and its `meta-graph-api` skill states its own position explicitly: *"Cero MCP, cero abstracciones — solo curl + JSON"*. That works for one network run by a human. It does not work for an agent that has to plan, launch, pace and kill campaigns across TikTok, LinkedIn, Google, YouTube and Spotify, because every network disagrees about entity names, money units, pagination and reporting.

The disagreement is not cosmetic. LinkedIn shifts the whole hierarchy one level (its *campaign* is everyone else's *ad group*, its *campaign group* is everyone else's *campaign*), Google Ads inserts a keyword-bearing ad group that LinkedIn has no equivalent for, Spotify nests a Business above the ad account and expresses every amount in micros, and Meta expresses budget in minor currency units. An agent that sees six vendor-shaped APIs will produce six incompatible plans.

This change adds `media-buyer-toolkit`: one normalized operation contract, fronted by one MCP server, implemented by six adapters. The agent sees one vocabulary; the adapters absorb the differences.

## What Changes

- New `media-buyer-toolkit` under `toolkits/` with:
  - `mcp/ads-multi-network/` — stdio MCP server and the primary interface. Normalized tools for accounts, campaigns, ad groups, ads/creatives, audiences, targeting estimates, insights and async reports.
  - `references/` — normalized entity mapping per network, per-network auth and quota notes, the unified insights schema, and the guardrail doctrine.
  - `skills/` — operator playbooks that use the MCP: media plan, creative testing at volume, budget pacing, kill rules, attribution readout.
  - `commands/` — thin entries (`/media-plan`, `/media-review`) that invoke the skills.
- Six adapters in phase 1: **Meta** (Marketing API / Graph), **TikTok** (Business API), **LinkedIn** (Marketing API), **Google Ads** (Search, Display, Performance Max), **YouTube** (Google Ads Video campaigns, sharing Google credentials), **Spotify** (Ads API v3).
- The adapter contract is declared, not inferred: each adapter publishes a capability matrix, and an operation the network does not support returns an explicit `unsupported` error instead of a degraded guess.
- `aaarrr-flywheel-toolkit` keeps the funnel doctrine and becomes a consumer of this toolkit's tool layer rather than a second Meta client.
- The toolkit is free, English-only, and installs as its own plugin with no runtime dependency on third-party CLI packages.

## Capabilities

### New Capabilities

- `ads-multi-network-mcp`: the tool layer an agent calls — normalized operation set, capability declaration, structured error envelope, mutation gating, and one schema source shared by the MCP server and the CLI surface.
- `network-adapters`: per-network implementation — hierarchy absorption, credential resolution, money unit normalization, pagination and throttling, retry, and the explicit-unsupported rule.
- `unified-insights-schema`: one reporting row shape for all six networks, covering sync queries and the async submit/poll/fetch lifecycle, with metric availability made explicit instead of silently zeroed.
- `media-buyer-operations`: the operator playbooks — drafts-first campaign creation, budget guardrails, kill rules and pacing review, creative testing at volume, and the change journal plus lift measurement.

### Modified Capabilities

- (none)

## Impact

- New toolkit: `toolkits/media-buyer-toolkit/` (plugin manifest, marketplace entry, CHANGELOG, README).
- New local MCP server registered through the bootstrap flow, alongside the existing canonical set.
- Consumer relationship recorded: `aaarrr-flywheel-toolkit` (funnel framework) depends on this toolkit for paid-media operations; the reverse dependency does not exist.
- No change to `shared/hooks/**` or to any existing toolkit's command surface.

## Non-goals

- **Not a bidding engine.** The toolkit does not own bid algorithms, budget optimisation policy or automated reallocation. It exposes the operations and the guardrails; the strategy stays in the playbooks and with the human.
- **Not a DSP or RTB client.** Programmatic inventory (DV360, The Trade Desk, Amazon DSP) is out of scope. Only the six named walled gardens.
- **Not an organic-social tool.** No posting, no community management, no comment moderation.
- **Not a pixel or tag manager.** Conversion tracking setup stays in `landing-instrumentation` and the network UIs; the toolkit reads conversion *configuration* so campaigns can reference a tracked event.
- **Not a credentialed service.** The toolkit never holds credentials for anyone; each operator brings their own app, token or developer token.
- **Not a report warehouse.** It emits normalized rows and stops. Long-term storage and BI are the caller's problem.

## Success criteria

1. `openspec validate media-buyer-toolkit --strict` passes.
2. One campaign can be planned and created as a draft across at least **three** networks through the same tool call sequence, with no network-specific field name in the inputs.
3. Pulling 30 days of insights from all six networks yields rows that conform to a single schema, with amounts in the account currency and no unit ambiguity.
4. Requesting an operation a network does not support returns `unsupported` with the network and operation named, and never returns an empty successful result.
5. No tool input can express an enabled, spending entity: creation is draft or paused by construction, and activation is a separate, explicitly confirmed call.
6. A budget above the configured daily cap is rejected before the network is called.
7. Removing every adapter except one still leaves the MCP server bootable and the remaining network fully functional.
