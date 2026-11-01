#!/usr/bin/env node
/**
 * slack-chimeranext — local stateless MCP server (stdio) exposing a small set
 * of stable Slack Web API tools.
 *
 * Why this exists: a local stdio Slack MCP that talks to the public Slack Web
 * API directly with Bearer auth, so no third-party hosted MCP is required for
 * the basic, stable operations (list channels, post a message, list users).
 *
 * Auth: SLACK_BOT_TOKEN env (bot token, `xoxb-…`). Sent as `Authorization:
 * Bearer …` to https://slack.com/api/. The secret stays in env — never in
 * config JSON, chat, or logs. The Slack API envelope is `{ ok, error, … }`;
 * `ok: false` is surfaced as a UserError.
 *
 * Stateless / ViteMCP: targets MCP revision 2026-07-28. There is no
 * `initialize` handshake and no `Mcp-Session-Id` — every request is
 * self-contained and carries its own protocol version and client capabilities.
 *
 * Tools (only those implementable reliably against the public Slack Web API):
 *   - conversation_list  conversations.list  — list public/private channels
 *   - message_post       chat.postMessage     — post a message to a channel
 *   - user_list          users.list           — list workspace users
 */
import { ViteMCP, UserError } from "@vitemcp/server";
import { z } from "zod";

const API = "https://slack.com/api";

function token() {
  const t = process.env.SLACK_BOT_TOKEN;
  if (!t) throw new UserError("SLACK_BOT_TOKEN is not set in the server environment");
  return t;
}

/**
 * Thin Slack Web API wrapper. Always sends `Authorization: Bearer` from
 * SLACK_BOT_TOKEN and a JSON body (Slack accepts JSON with
 * Content-Type: application/json). Enforces the Slack envelope: `ok:false`
 * becomes a UserError; non-2xx HTTP becomes a generic Error.
 */
async function api(method, path, body, fetchFn = fetch) {
  const res = await fetchFn(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
    },
    body: body && Object.keys(body).length ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Slack API ${res.status} on ${path}: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  if (!data.ok) {
    throw new UserError(`Slack API error on ${path}: ${data.error ?? "unknown"}`);
  }
  return data;
}

function listResult(data, key) {
  return {
    count: (data[key] ?? []).length,
    next_cursor: data.response_metadata?.next_cursor ?? "",
    items: data[key] ?? [],
  };
}

const server = new ViteMCP({ name: "slack-chimeranext", version: "0.1.0" });

server.addTool({
  name: "conversation_list",
  description:
    "List channels/conversations in the workspace (conversations.list). Returns each channel's name, id, archived flag, and member counts.",
  parameters: z.object({
    types: z
      .string()
      .default("public_channel")
      .describe("Comma-separated channel types: public_channel, private_channel, im, mpim, group"),
    limit: z.number().int().min(1).max(1000).default(100),
    cursor: z.string().optional().describe("Pagination cursor from next_cursor"),
  }),
  execute: async ({ types, limit, cursor }) => {
    const data = await api("POST", "/conversations.list", { types, limit, ...(cursor ? { cursor } : {}) });
    return { content: [{ type: "text", text: JSON.stringify(listResult(data, "channels"), null, 2) }] };
  },
});

server.addTool({
  name: "message_post",
  description:
    "Post a message to a Slack channel (chat.postMessage). Returns the channel id and message timestamp (ts).",
  parameters: z.object({
    channel: z.string().describe("Channel ID (C…), DM (D…), or channel name (#general)"),
    text: z.string().describe("Message text (Slack markdown-lite supported)"),
    thread_ts: z.string().optional().describe("Parent message timestamp to reply in a thread"),
  }),
  execute: async ({ channel, text, thread_ts }) => {
    const data = await api("POST", "/chat.postMessage", { channel, text, ...(thread_ts ? { thread_ts } : {}) });
    return { content: [{ type: "text", text: JSON.stringify({ ok: true, channel: data.channel, ts: data.ts }, null, 2) }] };
  },
});

server.addTool({
  name: "user_list",
  description:
    "List users in the workspace (users.list). Returns each user's id, real_name, display_name, deleted flag, and profile basics.",
  parameters: z.object({
    limit: z.number().int().min(1).max(1000).default(100),
    cursor: z.string().optional().describe("Pagination cursor from next_cursor"),
  }),
  execute: async ({ limit, cursor }) => {
    const data = await api("POST", "/users.list", { limit, ...(cursor ? { cursor } : {}) });
    return { content: [{ type: "text", text: JSON.stringify(listResult(data, "members"), null, 2) }] };
  },
});

export { api, token, server };

if (process.argv[1]?.endsWith("server.js")) {
  await server.start({ transportType: "stdio" });
}
