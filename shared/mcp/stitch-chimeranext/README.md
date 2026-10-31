# @chimeranext/stitch-mcp

A local, **stateless** ViteMCP server (stdio) for [Google Stitch](https://stitch.withgoogle.com/)
that replaces the public `google-stitch-mcp` package (which hardcoded
`X-Goog-Api-Key: "YOUR-API-KEY"`). **This server stores no API key anywhere.**

It authenticates with Google Cloud OAuth:

- `Authorization: Bearer <token>` — token = ``gcloud auth print-access-token``
- `X-Goog-User-Project: <GCP_PROJECT_NUMBER>` — for quota attribution

## Why

The remote Stitch MCP is a JSON-RPC endpoint at `https://stitch.googleapis.com/mcp`
that speaks the classic MCP handshake (`initialize` with protocolVersion
2024-11-05 → `notifications/initialized` → `tools/call`). The official package's
auth model exposed a hardcoded API key; wiring the GCP route through OAuth gives
a clean, secret-less auth path without leaking a key into `mcp.json`.

## Environment variables

| Var | Required | Meaning |
| --- | --- | --- |
| `STITCH_GCP_PROJECT` | yes | GCP project **number** (for `X-Goog-User-Project`) |
| `STITCH_PROJECT_ID` | defaults | Stitch project id (used when `projectId` is not passed to `get_screen`) |

If either is missing at call time, the tool returns a clear `UserError` naming the
missing variable — it never crashes, and never falls back to a hardcoded key.

## Setup

```bash
# 1. Authenticate gcloud once (the server calls `gcloud auth print-access-token`
#    at every call, so no token is stored).
gcloud auth login

# 2. Export the two config vars (cred numbers, NOT the key).
export STITCH_GCP_PROJECT="<GCP_PROJECT_NUMBER>"
export STITCH_PROJECT_ID="<STITCH_PROJECT_ID>"

# 3. Install deps.
npm ci

# 4. Run the server (stdio).
npm start
```

## Tools

### `get_screen`

Fetches a Stitch design screen's assets (screenshot / HTML / CSS download URLs).

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| `projectId` | string | no | Stitch project id; defaults to `STITCH_PROJECT_ID` |
| `screenId` | string | yes | Stitch screen id |

Returns `{ screenshot_download_url, html_download_url, css_download_url }`.

## Registration in `opencode.json`

```json
{
  "mcp": {
    "servers": {
      "stitch-chimeranext": {
        "type": "local",
        "command": ["node", "shared/mcp/stitch-chimeranext/server.js"],
        "environment": {
          "STITCH_GCP_PROJECT": "{env:STITCH_GCP_PROJECT}",
          "STITCH_PROJECT_ID": "{env:STITCH_PROJECT_ID}"
        }
      }
    }
  }
}
```

No API key appears anywhere in the JSON.

## Tests

```bash
npm test   # node --test test/ — mocked gcloud + fetch, no network, no token
```

## License

BSL-1.1.
