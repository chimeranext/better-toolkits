# Design — revenue-growth-toolkit

## D1 — Layout (merged toolkit)

```
toolkits/revenue-growth-toolkit/
├── .claude-plugin/plugin.json
├── package.json
├── README.md · CHANGELOG.md
├── skills/
│   ├── landing-page-design/ · landing-instrumentation/      # from aaarrr
│   ├── revenue-strategy/                                    # AAARRR (from aaarrr)
│   ├── media-plan/ · creative-testing/ · budget-pacing/
│   │   └── kill-rules/ · attribution-readout/               # from media-buyer
│   └── (deep-research shared re-use)
├── commands/                                                 # aaarrr strategy + thin media
│   ├── revenue-launch.md · revenue-analyze.md · acquire.md · activate.md
│   ├── retain.md · refer.md · revenue.md · kill-funnel.md
│   └── landing-page.md · landing-instrument.md
├── agents/  workflows/  funnels/  templates/                # from aaarrr
├── references/
│   ├── unit-economics.md · nps-and-feedback-loop.md         # aaarrr
│   └── insights/schema.md · journal/lift.md                 # media-buyer
└── scripts/
    ├── ltv_cac_calculator.py · referral_tracker.py
    ├── churn_detector.py · cohort_analysis.py
    ├── creative_health.py · budget_pacing_check.py · kill_rule_engine.py
    └── revenue_sources/ (meta_pixel.py, csv.py, [stripe.py])  # adapter pattern
```

## D2 — MCP (shared) consuming Ads CLI

- `shared/mcp/social-media-ads-mcp/src/adapters/meta.ts` → exec `meta ads <resource> <action>`
  (Ads CLI) with `--no-input`/`--force`/`json`. Uses system-user token (env).
- Other adapters unchanged (official SDKs).
- The toolkit's commands/agents call the MCP for all execution.

## D3 — Python metrics migration

| TS (remove) | Python (add) |
| --- | --- |
| `scripts/ltv-cac-calculator.ts` | `scripts/ltv_cac_calculator.py` |
| `scripts/referral-tracker.ts` | `scripts/referral_tracker.py` |
| `scripts/churn-detector.ts` | `scripts/churn_detector.py` |
| `scripts/lib/graph-api.ts` | (removed; MCP handles execution) |
| — | `scripts/cohort_analysis.py` (new) |

## D4 — PostHog self-hosted (Podman)

- Container: PostHog hobby deploy (OCI image) via Podman.
- Local instance URL + MCP (`mcp.posthog.com` or local endpoint).
- Register in `opencode.json` as a server (like `notion-chimeranext`).

## D5 — Marketplace

- Remove `aaarrr-flywheel-toolkit` + `media-buyer-toolkit`; add `revenue-growth-toolkit` v0.1.0.

## D6 — Verification

- `openspec validate revenue-growth-toolkit --strict`.
- `marketplace_versioning.py check --range origin/main..HEAD`.
- Scripts `py_compile` clean; no `2>/dev/null`.
- MCP boots (`tsx src/server.ts`).
