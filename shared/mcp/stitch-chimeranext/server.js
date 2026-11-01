#!/usr/bin/env node
/**
 * stitch-chimeranext — local stateless ViteMCP server (stdio) for Google Stitch.
 *
 * Why this exists: the public `google-stitch-mcp` package hardcodes an
 * `X-Goog-Api-Key: "YOUR-API-KEY"` placeholder and was left disabled pending an
 * auth design. This server replaces it with a local, stateless ViteMCP server
 * that authenticates with **no API key at all**:
 *
 *   - `Authorization: Bearer <token>` where token = `gcloud auth print-access-token`
 *   - `X-Goog-User-Project: <GCP_PROJECT_NUMBER>` for quota attribution
 *
 * Config comes only from env (never from config JSON, chat, or logs):
 *   - `STITCH_GCP_PROJECT` (GCP project NUMBER, for the X-Goog-User-Project header)
 *   - `STITCH_PROJECT_ID`   (Stitch project id, used as the default `projectId`)
 *
 * The reference for the wire protocol is the vendored `fetch_stitch.sh`:
 * Stitch MCP is a JSON-RPC endpoint at `https://stitch.googleapis.com/mcp`
 * that speaks the classic MCP handshake: `initialize` (protocolVersion
 * 2024-11-05) → `notifications/initialized` → `tools/call` with tool
 * `get_screen` and args `{ projectId, screenId }` (projectId = Stitch project
 * id, NOT the GCP project number).
 *
 * Tools:
 *   -  get_screen   fetch a Stitch screen's design assets (screenshot/Html/CSS
 *                   download URLs) from its project.
 *
 * Stateless: every `tools/call` shells out to `gcloud auth print-access-token`
 * at call time, so the server holds no session and no secret.
 */
import { ViteMCP, UserError } from "@vitemcp/server";
import { z } from "zod";
import { spawnSync } from "node:child_process";

const API = "https://stitch.googleapis.com/mcp";
const PROTOCOL_VERSION = "2024-11-05";

/**
 * Read a required env var. Throws a UserError naming the var so the MCP client
 * sees a clear, non-crashing message.
 */
export function requireEnv(name) {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new UserError(`${name} is not set in the server environment`);
  }
  return v.trim();
}

/**
 * Obtain a Google Cloud OAuth access token by shelling out to gcloud at call
 * time. Stateless: no token is stored between calls. `spawnSync` captures the
 * child's stderr into `r.stderr` (never the parent's stderr), so this never
 * leaks a suppressed signal on the server's own stderr.
 */
export function gcloudAccessToken({ spawn = spawnSync } = {}) {
  const r = spawn("gcloud", ["auth", "print-access-token"], { encoding: "utf8" });
  if (r.status !== 0 || !r.stdout?.trim()) {
    const hint = (r.stderr || "").trim().slice(0, 300);
    throw new UserError(
      `gcloud auth print-access-token failed (exit ${r.status ?? "n/a"}): ${hint || "run 'gcloud auth login' first"}`
    );
  }
  return r.stdout.trim();
}

/**
 * Build the JSON-RPC `tools/call` body for get_screen (mirrors the vendored
 * fetch_stitch.sh request).
 */
export function buildGetScreenRequest(projectId, screenId) {
  return {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "get_screen",
      arguments: { projectId, screenId },
    },
  };
}

/**
 * POST a JSON-RPC body to the Stitch MCP endpoint with the gcloud OAuth
 * Bearer token + X-Goog-User-Project headers. `fetchFn`/`tokenFn` are
 * injectable for tests.
 */
export async function callStitch(body, { fetchFn = fetch, tokenFn = gcloudAccessToken } = {}) {
  const token = tokenFn();
  const quotaProject = requireEnv("STITCH_GCP_PROJECT");
  const res = await fetchFn(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "X-Goog-User-Project": quotaProject,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Stitch MCP responded ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

/**
 * Normalize a Stitch `tools/call` response into a clean, structured result.
 * The screen payload is a nested JSON string inside `content[0].text`; we
 * surface the actionable download URLs.
 */
export function extractScreenResult(rpc) {
  if (rpc.error) {
    throw new UserError(`Stitch returned an error: ${JSON.stringify(rpc.error)}`);
  }
  const text = rpc.result?.content?.[0]?.text;
  if (typeof text !== "string") {
    throw new UserError("Stitch response had no text content");
  }
  try {
    const data = JSON.parse(text);
    return {
      screenshot_download_url: data.screenshot?.downloadUrl ?? null,
      html_download_url: data.htmlCode?.downloadUrl ?? null,
      css_download_url: data.cssCode?.downloadUrl ?? null,
    };
  } catch {
    // Not a JSON payload — surface the raw text.
    return { raw: text };
  }
}

const server = new ViteMCP({ name: "stitch-chimeranext", version: "0.1.0" });

server.addTool({
  name: "get_screen",
  description:
    "Fetch a Stitch design screen's assets (screenshot / HTML / CSS download URLs) from a Stitch project. Authenticates via gcloud OAuth (Bearer token + X-Goog-User-Project); no API key. Needs STITCH_GCP_PROJECT (GCP project number) and either STITCH_PROJECT_ID or an explicit projectId.",
  parameters: z.object({
    projectId: z
      .string()
      .optional()
      .describe("Stitch project id (not the GCP project number); defaults to STITCH_PROJECT_ID env"),
    screenId: z.string().describe("Stitch screen id to fetch"),
  }),
  execute: async ({ projectId, screenId }) => {
    const pid = projectId ?? process.env.STITCH_PROJECT_ID;
    if (!pid || !pid.trim()) {
      throw new UserError("STITCH_PROJECT_ID is not set and projectId was not provided");
    }
    const rpc = await callStitch(buildGetScreenRequest(pid.trim(), screenId));
    return {
      content: [{ type: "text", text: JSON.stringify(extractScreenResult(rpc), null, 2) }],
    };
  },
});

if (process.argv[1]?.endsWith("server.js")) {
  await server.start({ transportType: "stdio" });
}
