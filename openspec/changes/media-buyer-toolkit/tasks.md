# Tasks — media-buyer-toolkit

Change slug for commit messages: `media-buyer-toolkit`. Issue: [#121](https://github.com/chimeranext/better-toolkits/issues/121).

## Implementation

### Scaffold and shared layer

- [ ] T1: Create `toolkits/media-buyer-toolkit/` scaffold (README, CHANGELOG, `.claude-plugin/plugin.json`, `references/`, `skills/`, `commands/`, `mcp/`) and register it in root `.claude-plugin/marketplace.json`
- [ ] T2: Write `references/guardrails/protocol.md` (read-only default, apply flag, drafts-first, spend caps, HITL confirmation)
- [ ] T3: Write `references/operations/model.md` (normalized `Account → Campaign → AdGroup → Ad/Creative`, audience, asset, pixel)
- [ ] T4: Implement `mcp/ads-multi-network/src/platform/` — credential resolution (env → config `0600` → per-call), OAuth refresh, secret redaction, retry with backoff and jitter, token-bucket throttling, money arithmetic, period parsing, change journal
- [ ] T5: Implement the operation router and the capability matrix loader, with guardrail evaluation above the adapters

### Meta adapter (contract proof)

- [ ] T6: Implement `mcp/ads-multi-network/src/adapters/meta/` — accounts, campaigns, ad sets, ads, creatives, audiences, pixels
- [ ] T7: Implement Meta insights read (`/insights`) mapped to the canonical row, with minor-unit and currency normalization
- [ ] T8: Declare the Meta capability matrix and map Meta's native fields to the normalized model in `references/networks/meta.md`
- [ ] T9: Prove the contract end to end offline: create draft campaign, list, read insights, hit a guardrail rejection

### Google Ads adapter (largest asymmetry)

- [ ] T10: Implement `mcp/ads-multi-network/src/adapters/google/` — customer and MCC resolution, campaigns, ad groups, ads, user lists, conversion actions
- [ ] T11: Implement Google Ads reporting reads, including the keyword-bearing ad group mapping into normalized `targeting`
- [ ] T12: Write `references/networks/google.md` — OAuth client, developer token from a manager account, the Explorer-is-not-enough-for-keyword-research caveat, micros
- [ ] T13: Serve `network: "youtube"` through the Google adapter with the channel pinned to Video, and expose the channel in insights rows
- [ ] T14: Declare the Google and YouTube capability matrices

### TikTok and LinkedIn adapters

- [ ] T15: Implement `mcp/ads-multi-network/src/adapters/tiktok/` — advertiser, campaigns, ad groups, ads, assets, audiences, pixels
- [ ] T16: Implement TikTok sync plus async reporting (submit, poll, fetch) against the canonical row
- [ ] T17: Write `references/networks/tiktok.md` (OAuth token model, report types, data levels)
- [ ] T18: Implement `mcp/ads-multi-network/src/adapters/linkedin/` with the shifted hierarchy — campaign group → normalized campaign, campaign → normalized ad group, creative → normalized ad
- [ ] T19: Implement LinkedIn reporting and audience (DMP segment) reads
- [ ] T20: Write `references/networks/linkedin.md`, leading with the one-level-offset table, and a round-trip test proving no neighbouring level is written

### Spotify adapter

- [ ] T21: Implement `mcp/ads-multi-network/src/adapters/spotify/` — business, ad account, campaigns, ad sets, ads, assets, audiences, pixels and datasets
- [ ] T22: Implement Spotify micros conversion, aggregate and insight reporting, async CSV reports, audience and bid estimation
- [ ] T23: Write `references/networks/spotify.md` (Business → Ad Account hierarchy, micros, continuation tokens, Ads API access request)

### Insights and contract surface

- [ ] T24: Write `references/insights/schema.md` — the canonical row, the metric-availability map and the null-versus-zero rule
- [ ] T25: Implement aggregation over canonical rows only, with declared date semantics per network
- [ ] T26: Implement the CLI surface over the same operation router, generating a tool manifest from the shared schema definition
- [ ] T27: Register `ads-multi-network` in the multi-harness setup flow (Claude, Cursor, OpenCode) with a server that boots with zero configured networks

### Playbooks and entries

- [ ] T28: Write `skills/media-plan/SKILL.md` (objective → channel mix → budget split → draft plan per network)
- [ ] T29: Write `skills/creative-testing/SKILL.md` (batch creatives per ad group, per-creative readout, pause losers)
- [ ] T30: Write `skills/budget-pacing/SKILL.md` and `skills/kill-rules/SKILL.md` (pace review, thresholds, propose-not-perform)
- [ ] T31: Write `skills/attribution-readout/SKILL.md` and `references/journal/lift.md` (change journal, before/after window, explicit confounds disclosure)
- [ ] T32: Write `commands/media-plan.md` and `commands/media-review.md` as thin entries over the skills, plus the protocol SSOT under `references/`

## Verification

- [ ] T33: `openspec validate media-buyer-toolkit --strict` passes
- [ ] T34: Contract tests pass offline against recorded fixtures for all six networks, including LinkedIn's shifted hierarchy, Google's keyword-bearing ad group, Spotify micros, Meta minor units, an `unsupported` operation and a `not_implemented` operation
- [ ] T35: A `null` metric is proven not to be coerced to `0`, and a genuine `0` is proven to stay `0`
- [ ] T36: One campaign creation sequence runs unchanged across Meta, TikTok and LinkedIn (only `network`, account and capability differences vary)
- [ ] T37: No tool input can produce an enabled or spending entity — asserted by schema test, not by inspection
- [ ] T38: An over-cap budget is rejected before any outbound request (asserted by asserting the transport was never called)
- [ ] T39: With one adapter removed, the server still boots and the remaining networks serve normally
- [ ] T40: Grep proof that no credential value or vendor field name reaches tool output, error envelopes or the journal
- [ ] T41: Grep proof that no script redirects stderr to `/dev/null`
- [ ] T42: Opt-in credentialed smoke test: one read-only call per configured network, asserting only authentication and account listing
