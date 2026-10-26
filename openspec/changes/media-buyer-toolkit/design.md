# Design — media-buyer-toolkit

## Paths touched

| Path | Purpose |
| --- | --- |
| `toolkits/media-buyer-toolkit/mcp/ads-multi-network/` | stdio MCP server: transport, tool registration, operation router |
| `toolkits/media-buyer-toolkit/references/` | normalized mapping, per-network notes, insights schema, guardrails |
| `toolkits/media-buyer-toolkit/skills/` | media plan, creative testing, pacing, kill rules, attribution |
| `toolkits/media-buyer-toolkit/commands/` | thin entries (`/media-plan`, `/media-review`) |
| `toolkits/media-buyer-toolkit/.claude-plugin/plugin.json` + root `.claude-plugin/marketplace.json` | plugin identity and version |
| `shared/bootstrap/**` | registration of the new local MCP in the setup flow |

No `shared/hooks/**` change. No existing toolkit's `commands/`, `skills/` or `references/` is modified by this change.

## Multi-harness impact

- **Claude Code / Cursor / OpenCode** all consume the same stdio MCP server; there is no per-harness tool fork.
- Thin command entries live in `commands/`; the Cursor/OpenCode mirror is generated from the same protocol markdown, so the protocol stays the SSOT.
- The server must start with zero configured networks and report which networks are available, because the canonical MCP set is installed before any ad account exists.

## D1 — Toolkit boundary: new toolkit, not an aaarrr extension

`aaarrr-flywheel-toolkit` owns funnel doctrine (AARRR stages, launch workflow, funnels, landing instrumentation). This toolkit owns paid-media *operations*. The dependency runs one way: aaarrr consumes the tool layer, this toolkit never imports funnel concepts.

Rationale: the funnel framework is useful to a startup that never buys an ad, and paid media is useful to a startup that does not use the AARRR vocabulary. Coupling them would force both to install both.

`aaarrr-flywheel-toolkit/agents/acquisition-buyer.md` and `skills/meta-graph-api/SKILL.md` are **not deleted** by this change. They stay as the Meta-specific doctrine and the direct-curl escape hatch. This proposal records the intent to repoint the buyer agent at the MCP in a follow-up change, so the review can accept the boundary without a second PR in flight.

## D2 — MCP is the primary interface, the CLI is a peer consumer

The MCP server is the interface agents call. A CLI surface exists for cron, batch and debugging, and it is not a second implementation: both are thin layers over the same operation router, and the tool input schemas are defined once and reused verbatim. This is the pattern proven by `adwarp-dev/adwarp`, where the CLI and MCP are two fronts over one engine and a generated tool manifest keeps them from drifting.

## D3 — Three layers, and the middle one is where the work is

```
tool contract (normalized operations, no vendor names)
        |
operation router  ->  adapter: meta | tiktok | linkedin | google | youtube | spotify
        |
platform-neutral layer (auth, credential store, retry, throttling, money, periods, journal)
```

The platform-neutral layer owns everything that is the same regardless of vendor: OAuth refresh, credential resolution order, retry with backoff, request throttling, money arithmetic, period parsing, and the change journal. Adapters own only the parts that genuinely differ. A bug in retry is fixed once, not six times.

## D4 — Normalized entity model

```
Account ── Campaign ── AdGroup ── Ad (└ Creative)
   │            │           │
   ├─ Audience  └─ Budget   └─ Targeting
   ├─ Asset
   └─ Pixel / Measurement
```

Per-network absorption:

| Normalized | Meta | TikTok | LinkedIn | Google Ads | Spotify |
| --- | --- | --- | --- | --- | --- |
| Account | Ad Account (`act_…`) | Advertiser | Ad Account | Customer ID (+ optional MCC) | Business → Ad Account |
| Campaign | Campaign | Campaign | **Campaign Group** | Campaign | Campaign |
| AdGroup | Ad Set | Ad Group | **Campaign** | Ad Group | Ad Set |
| Ad | Ad | Ad | **Creative** | Ad Group Ad | Ad |
| Audience | Custom / Lookalike | Custom / Lookalike | DMP Segment | User List | Custom / Lookalike |
| Pixel | Pixel | Pixel | Insight Tag | Conversion Action | Pixel / Dataset |

Two asymmetries the contract must not leak:

1. **LinkedIn is shifted one level.** A LinkedIn "campaign" is an ad group everywhere else. The adapter maps on read *and* on write, and the mapping is documented in `references/networks/linkedin.md` because it is the single most common source of cross-network confusion.
2. **Google Ads has an extra level.** Keywords live on the ad group. `targeting` on a Google ad group is a keyword-and-criteria object; on LinkedIn the equivalent criteria live on the campaign. The normalized `targeting` field is therefore an opaque, adapter-owned structure with a declared shape per network, not a lowest-common-denominator object that silently drops keywords.

YouTube is **not** a separate adapter. Video campaigns are a Google Ads campaign type; `youtube` resolves to the `google` adapter with the channel pinned to Video. It exists as a first-class network in the contract because operators plan and budget it separately, and because reporting needs to be sliced by it.

## D5 — Capability matrix is declared, never inferred

Each adapter publishes a static capability map: which operations it implements, and for the operations it does not, why (not offered by the API, or not implemented yet). Two distinct outcomes, two distinct errors:

- `unsupported` — the network's API cannot do this (for example, Spotify has no keyword-level search campaign).
- `not_implemented` — the network can, the adapter does not yet.

An operation that is unsupported MUST fail loudly. Returning an empty successful result is the failure mode this rule exists to prevent, because an agent will read "no campaigns" as ground truth and plan on it.

## D6 — Money is normalized once, at the adapter boundary

Every amount crosses the adapter as `{ amount: decimal, currency: ISO-4217 }`. Micros (Spotify, Google Ads), minor units (Meta) and plain decimals are converted in one place, with the currency carried through from the account and never assumed. Budgets are compared against guardrails only after normalization.

Rules:

- Never round for storage or comparison; round only at render time.
- Reject an amount whose unit cannot be determined rather than assuming the network default.
- Keep the account currency on the row; do not introduce a second currency through a conversion the toolkit performed.

## D7 — Credentials: bring your own, resolve in a fixed order, never log

Resolution order, identical for every adapter:

1. Environment variable (for example `MEDIA_BUYER_META_ACCESS_TOKEN`).
2. Toolkit config file under the user config directory, mode `0600`.
3. Per-call credentials argument, for callers that manage their own secrets.

The toolkit never creates, stores, or transmits credentials to any service other than the ad network itself. Tokens never appear in logs, error messages, journal entries or tool output; the redaction is applied in the shared layer so an adapter cannot forget it.

Google Ads is the exception that proves the rule: it needs an OAuth client **and** a developer token issued to a manager account. Setup differs enough that `references/networks/google.md` carries the full walkthrough, including the fact that Explorer-tier access is insufficient for keyword research.

## D8 — Guardrails: read-only by default, drafts-first by construction

- Every write tool requires an explicit `apply` flag. Without it, the call returns the diff of what would change and touches nothing.
- Tool input schemas cannot express an enabled or actively-spending entity. Creation yields `draft` (LinkedIn, Spotify) or `paused` (Meta, TikTok, Google Ads). Activation is a separate call, and that call requires both the apply flag and human confirmation.
- Daily-account and per-campaign spend caps are configured, not hard-coded, and enforced **before** the network call so a rejected plan costs nothing.
- The guardrail check runs in the router, above the adapters, so a new adapter inherits it automatically.

This mirrors the drafts-first rule that makes `adwarp` safe to hand to an agent: nothing spends money until a human says so.

## D9 — Insights: one row shape, two lifecycles

Sync queries (Meta, TikTok basic, LinkedIn, Spotify aggregate) and async report jobs (TikTok async, Spotify CSV, Google Ads via GAQL reads) both land in the same row shape. The async path is modelled explicitly as submit → poll → fetch, with the task handle returned to the caller so a long report does not have to block an agent turn.

Metric availability is explicit. A metric a network does not report is `null` with an availability flag, never `0`. Zero and unknown are different facts and conflating them corrupts every downstream CPA calculation.

## D10 — Throttling, retry, idempotency

- Per-adapter rate limits and quota windows are declared, and the shared layer enforces a token-bucket per account.
- Retry applies to transport failures, 429 and 5xx, with exponential backoff and jitter. A 4xx that is not 429 is never retried.
- Write calls carry a client-generated idempotency key so a retried creation cannot duplicate a campaign.
- Pagination is adapter-owned and page-token based; the normalized result is a complete collection within the requested limit, with the continuation handle surfaced rather than silently truncating.

## D11 — Change journal and lift

Every write the toolkit performs is appended to a local JSONL journal, captured at the single HTTP chokepoint so it cannot be forgotten. The journal is what makes "did that change help?" answerable: a lift read compares the window before a change to the window after it and reports per-metric deltas.

The journal is explicitly labelled directional, not experimental — seasonality, the post-edit learning phase and concurrent budget changes all confound it. The readout says so.

## D12 — The CLI family is a reference and an optional bridge, not a dependency

The `Bin-Huang/*-ads-cli` family, the official Meta Ads CLI connectors and `Abbasam8910/TikTok-Ad-Agent-CLI` solve the same problem one network at a time, in the same shape: credentials in a config file, JSON on stdout, one command per resource. They are excellent maps of each network's resource surface and are cited in `references/networks/*.md` as endpoint references.

The default adapter mode is `native`: call the network's official REST/Graph API directly. This keeps the toolkit dependency-free and keeps behaviour stable when a third-party CLI changes or disappears.

An opt-in `cli` bridge mode exists for operators who already have one of those CLIs installed and authenticated. It shells out and maps stdout JSON into the same normalized shapes. Bridge output must satisfy the same contract as native output — if a bridge cannot supply a field the contract requires, it reports the gap rather than filling it with a default.

`adwarp-dev/adwarp` is cited for architecture, not for endpoints: it covers LinkedIn and Google only, and it is the source of the layer split in D3, the drafts-first rule in D8 and the journal in D11.

## D13 — Testing without live ad accounts

Live network credentials are not available in CI, so the contract is tested against recorded response fixtures per network. Two tiers:

- **Contract tests** (default, offline): fixture in, normalized row out, including the asymmetric cases — LinkedIn's shifted hierarchy, Google's keyword-bearing ad group, Spotify micros, Meta minor units, an unsupported operation, and a `null` metric that must not become `0`.
- **Smoke tests** (opt-in, credentialed): one read-only call per configured network, asserting only that authentication and the account listing work.

## D14 — Failure isolation across adapters

A network that is misconfigured, throttled or down must not stop the others from working. Adapters load independently; a network whose credentials are absent is reported as `not_configured` in the server's capability report and its tools return that error, while the remaining networks serve normally.

## D15 — Out-of-scope decisions are recorded, not implied

Deliberately excluded here, with the reason, so the review can disagree explicitly:

| Excluded | Reason |
| --- | --- |
| Bid algorithms, automated reallocation | Strategy belongs in playbooks and with the human, not in a transport layer |
| DSP / programmatic (DV360, TTD, Amazon DSP) | Different access model entirely; deserves its own proposal |
| Microsoft Ads, X, Snapchat, Pinterest, Reddit, Apple, Amazon Ads | The CLI family shows these are reachable; phase 2 after the six here prove the contract |
| Creative generation and asset editing | Adjacent but separate concern; the toolkit uploads and inspects assets, it does not author them |
| Warehouse, BI, cross-account dashboards | The toolkit emits normalized rows and stops |

## D16 — Phase 1 delivery order

1. Platform-neutral layer + operation router + capability matrix for the **Meta** adapter, end to end, offline-tested. One network proving the contract is worth more than six half-wired ones.
2. **Google Ads** (with YouTube) — the largest hierarchy asymmetry and the developer-token path.
3. **TikTok**, then **LinkedIn** — both introduce async reporting and the shifted hierarchy.
4. **Spotify** — closes phase 1 with the micros and Business-layer case.
5. Playbooks and command entries.

## D17 — Transport is a stateless stdio MCP

The `mcp/ads-multi-network/` server implements the **stateless** MCP transport from the start, following `vitemcp/server#migrating-from-the-session-based-api` — the same contract already validated on `shared/google-workspace-apps/google-for-rclone.ts`.

Rules:

- Responds to `initialize` with `protocolVersion: "2024-11-05"` and never emits `Mcp-Session-Id`.
- Does not hold per-session state between requests; every request is independent. Session-scoped data (journal handle, poll cursors for async insights per D9) is addressed explicitly in tool arguments, not kept on a server-side session.
- This is not a migration: the scaffolding placeholder pointing at an unrelated session-based MCP implementation was removed, and nothing is registered against it.

Rationale: stateful sessions complicate multi-harness reuse (D-opening: one server per harness), break on restart, and the stateless shape was proven equivalent for a single-owner workspace tool. Where the journal or an async report job needs continuity across calls, the continuity lives in on-disk state identified by an explicit ID, not in process memory.
