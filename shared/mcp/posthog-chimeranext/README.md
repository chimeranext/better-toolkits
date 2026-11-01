# @chimeranext/posthog-chimeranext-mcp

A local, **stateless** ViteMCP server (stdio) that queries a **self-hosted**
PostHog instance over its REST API. It replaces the previous `posthog` MCP
entry, which pointed at the PostHog **SaaS** cloud (`https://mcp.posthog.com/mcp`).

**This server stores no API key anywhere** — credentials come from env at call
time.

## Why

The studio decision is to **self-host PostHog** (Podman hobby-deploy) and expose
it to agents. A local stateless server keeps product/behavioral data on your own
instance, avoids the cloud, and never leaks a key into `opencode.json` or
committed source.

## Self-hosted deploy (Podman hobby-deploy)

```bash
podman volume create posthog-data
podman run -d --name posthog \
  -p 8000:8000 \
  -v posthog-data:/data \
  -e POSTHOG_SECRET_KEY="$(openssl rand -hex 32)" \
  -e POSTHOG_HOST="http://localhost:8000" \
  docker.io/posthog/posthog:latest
```

- UI: http://localhost:8000
- First run creates the instance; capture a **personal API key** (Project Settings → API Keys → Personal API keys) for the server.

## Environment variables

| Var | Required | Meaning |
| --- | --- | --- |
| `POSTHOG_HOST` | no (default `http://localhost:8000`) | Base URL of the self-hosted instance |
| `POSTHOG_PERSONAL_API_KEY` | yes | Personal API key issued by the instance |
| `POSTHOG_PROJECT_ID` | no (default `1`) | Project id to query |

If `POSTHOG_PERSONAL_API_KEY` is missing at call time, the tool returns a clear
`UserError` naming the variable — it never crashes and never falls back to a
hardcoded key.

## Setup

```bash
cd shared/mcp/posthog-chimeranext
npm ci
# export the env vars (never commit them)
export POSTHOG_HOST="http://localhost:8000"
export POSTHOG_PERSONAL_API_KEY="phc_..."
# run the server (stdio)
npm start
```

## Tools

| Tool | Description |
| --- | --- |
| `posthog_query` | Run a PostHog query (e.g. `TrendsQuery`) against the instance |
| `posthog_funnel` | Run a funnel query over an ordered set of events |
| `posthog_retention` | Run a retention query by period |

All tools target `POSTHOG_HOST`; **none** route to `mcp.posthog.com`.

## Registration in `opencode.json`

```json
{
  "mcp": {
    "servers": {
      "posthog-chimeranext": {
        "type": "local",
        "command": ["node", "shared/mcp/posthog-chimeranext/server.js"],
        "environment": {
          "POSTHOG_HOST": "{env:POSTHOG_HOST}",
          "POSTHOG_PERSONAL_API_KEY": "{env:POSTHOG_PERSONAL_API_KEY}",
          "POSTHOG_PROJECT_ID": "{env:POSTHOG_PROJECT_ID}"
        }
      }
    }
  }
}
```

No API key appears anywhere in the JSON.

## Tests

```bash
npm test   # node --test test/ — mocked fetch, no network, no token
```

## License

BSL-1.1.
