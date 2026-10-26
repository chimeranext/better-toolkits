# media-buyer-toolkit

Paid media operations across **Meta, TikTok, LinkedIn, Google Ads, YouTube and Spotify** behind one normalized MCP tool contract. The agent sees one vocabulary (`account → campaign → ad_group → ad/creative`); six adapters absorb the vendor differences (LinkedIn's one-level hierarchy shift, Google's keyword-bearing ad group, Spotify's Business layer and micros, Meta's minor units).

## The MCP server — `ads-multi-network`

One **stateless** stdio MCP server is the primary interface (CLI is a thin peer over the same router):

```json
{
  "mcp": {
    "servers": {
      "ads-multi-network": {
        "type": "local",
        "command": ["npx", "-y", "tsx", "toolkits/media-buyer-toolkit/mcp/ads-multi-network/src/server.ts"]
      }
    }
  }
}
```

Stateless by construction (the proven pattern of `shared/google-workspace-apps/google-for-rclone.ts`): it answers `initialize` with `protocolVersion: "2024-11-05"` and never emits `Mcp-Session-Id`. It boots with **zero configured networks** and reports per-network `available | not_configured | error` — installing the toolkit before any ad account exists is fine.

## Guardrails (applied by the router, above the adapters)

- Every mutation requires `apply: true`; without it you get the intended diff and nothing touches the network.
- Creation cannot express an active entity: campaigns/creatives are born draft or paused; activation is a separate call requiring the apply flag **and** explicit human confirmation.
- Daily-account and per-campaign spend caps are configuration, not code, and they are evaluated **before** any network request.
- No token, secret or credential value ever reaches tool output, errors, logs or the change journal.

## Credentials (bring your own, fixed resolution order)

1. Environment variable (`MEDIA_BUYER_META_ACCESS_TOKEN`, `MEDIA_BUYER_TIKTOK_ACCESS_TOKEN`, `MEDIA_BUYER_LINKEDIN_ACCESS_TOKEN`, `MEDIA_BUYER_GOOGLE_ACCESS_TOKEN`, `MEDIA_BUYER_GOOGLE_DEVELOPER_TOKEN`, `MEDIA_BUYER_SPOTIFY_ACCESS_TOKEN`)
2. Toolkit config file under the user config directory, mode `0600`
3. Per-call `credentials` argument (callers managing their own secrets)

## Layout

- `mcp/ads-multi-network/` — the stateless stdio server, operation router, platform layer, six adapters, offline contract tests against recorded fixtures
- `references/` — normalized entity mapping, per-network notes, unified insights schema, guardrail doctrine
- `skills/` — operator playbooks (media plan, creative testing, pacing, kill rules, attribution readout)
- `commands/` — thin entries: `/media-plan`, `/media-review`

## Out of scope

Not a bidding engine, not a DSP/RTB client, not organic social, not a pixel/tag manager, not a coupon: it exposes the operations and the guardrails; the strategy stays with the human. It emits normalized rows and stops — no warehouse.
