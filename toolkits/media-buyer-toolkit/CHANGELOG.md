# Changelog

## 0.1.0 — 2026-10-26

- Initial toolkit: one **stateless** stdio MCP server `ads-multi-network` (pattern: `vitemcp/server#migrating-from-the-session-based-api`, implementation-proven in `shared/google-workspace-apps/google-for-rclone.ts`).
- Normalized operation contract over one server: accounts, campaigns, ad groups, ads/creatives, audiences, targeting estimates, insights (unified row schema with explicit metric availability), async report lifecycle (submit → poll → fetch), capability report.
- Six phase-1 adapters: Meta (Marketing API), TikTok (Business API), LinkedIn (Marketing API, shifted hierarchy absorbed on read and write), Google Ads (campaigns, ad groups with keyword-preserving targeting), YouTube (resolved through the Google adapter, channel pinned to Video), Spotify (Ads API v3, Business → Ad Account hierarchy, micros).
- Drafts-first + guardrails by design: `apply` flag required on every mutation, creation cannot express an enabled entity, spending caps evaluated before the network, activation requires the apply flag and human confirmation.
- Explicit `unsupported` vs `not_implemented` error codes per the declared capability matrices — a network that cannot do an operation fails loudly, never with an empty success.
- One schema source for MCP and CLI (tool input and CLI argument schemas derived from the same operation definitions).
- Credential order env → config file (mode 0600) → per-call; secrets redacted at the router chokepoint so no credential value can reach output, errors, logs or the change journal.
- Operator layer: change journal (JSONL at the single request chokepoint) + directional lift readout with confounds disclosure + pacing review + kill rules proposed, not performed.
- Offline contract tests against recorded fixtures for all networks; smoke tests opt-in and credentialed.
