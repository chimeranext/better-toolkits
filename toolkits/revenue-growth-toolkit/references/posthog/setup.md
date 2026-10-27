# PostHog self-hosted (Podman) — setup

PostHog is the analytics/dashboard layer for `revenue-growth-toolkit`: funnels (AAARRR),
retention curves, trends, session replay, and AI observability. Agents query it via the
PostHog MCP.

## Why self-hosted

- Control over product/behavioral data (no cloud limits).
- The MCP endpoint works against your own instance.
- Matches the "official/vendor-sanctioned surface" principle used elsewhere in this repo
  (e.g. Meta Ads CLI).

## Boot (Podman, hobby deploy)

```bash
# PostHog hobby deploy image (OCI). Run once.
podman volume create posthog-data

podman run -d --name posthog \
  -p 8000:8000 \
  -v posthog-data:/data \
  -e POSTHOG_SECRET_KEY="$(openssl rand -hex 32)" \
  -e POSTHOG_HOST="http://localhost:8000" \
  docker.io/posthog/posthog:latest
```

- UI: http://localhost:8000
- First-run creates the instance; capture `POSTHOG_API_KEY` (project) + `personal_api_key`
  for the CLI/MCP.

## PostHog CLI

```bash
# Docs: https://posthog.com/docs/cli
posthog --host http://localhost:8000 --personal-api-key <KEY> ...
```

## PostHog MCP

- Hosted endpoint: `https://mcp.posthog.com/mcp` (or your self-hosted MCP service if enabled).
- Register in `opencode.json` (like `notion-chimeranext` / `social-media-ads-mcp`).
- Agent use: "what's our funnel conversion?" / "build a retention cohort" → MCP query.

## How it fits

```
AAARRR strategy layer → queries PostHog MCP (funnel/retention/insights)
                      → runs Python metrics (LTV/CAC, churn, cohorts)
                      → executes ads via social-media-ads-mcp (Ads CLI for Meta)
```
