#!/usr/bin/env node
/**
 * posthog-chimeranext — local, stateless ViteMCP server (stdio) for a
 * self-hosted PostHog instance.
 *
 * Why this exists: the previous `posthog` MCP entry pointed at the PostHog
 * **SaaS** cloud (`https://mcp.posthog.com/mcp`), which sends product/behavioral
 * data off-site and contradicts the studio decision to self-host PostHog via
 * Podman hobby-deploy. This server talks to the self-hosted instance over its
 * REST API using a per-call `POSTHOG_PERSONAL_API_KEY` — no cloud MCP, no
 * embedded secret.
 *
 * Stateless / ViteMCP: identical pattern to `stitch-chimeranext` and
 * `notion-chimeranext` — `start({ transportType: "stdio" })`, config only from
 * env at call time, `fetch`/auth injectable for tests.
 *
 * Tools:
 *  -   posthog_query  run a PostHog insight/trend query against the instance
 *  -   posthog_funnel  compute a funnel query against the instance
 *  -   posthog_retention  run a retention query against the instance
 */
import { ViteMCP, UserError } from "@vitemcp/server";
import { z } from "zod";

const DEFAULT_HOST = "http://localhost:8000";

/** Resolve the self-hosted PostHog base URL. */
export function host() {
  return (process.env.POSTHOG_HOST || DEFAULT_HOST).trim().replace(/\/$/, "");
}

/** Require the personal API key; throw a clear UserError when missing. */
export function requireKey() {
  const k = process.env.POSTHOG_PERSONAL_API_KEY;
  if (!k || !k.trim()) {
    throw new UserError("POSTHOG_PERSONAL_API_KEY is not set in the server environment");
  }
  return k.trim();
}

/** Which project to query (POSTHOG_PROJECT_ID or the first project). */
export function projectId() {
  return (process.env.POSTHOG_PROJECT_ID || "1").trim();
}

/**
 * Call the self-hosted PostHog REST API. Stateless: reads the personal API key
 * from env at call time. `fetchFn` is injectable for tests.
 * Returns the parsed JSON body. The project id is used as a fallback for the
 * `token` that PostHog's personal API key auth expects; for REST the key is
 * sent as a Bearer token.
 */
export async function posthogApi(path, { method = "GET", body, fetchFn = fetch } = {}) {
  const base = host();
  const key = requireKey();
  const url = `${base}/api/projects/${projectId()}${path}`;
  const res = await fetchFn(url, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PostHog API ${res.status} on ${path}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

/**
 * Run a PostHog query (insight/trend). Accepts the JSON `query` object that the
 * PostHog "query runner" uses, and returns the structured result.
 */
export const runQuery = async (query, { fetchFn = fetch } = {}) => {
  if (!query || typeof query !== "object") throw new UserError("query is required (object)");
  return posthogApi("/query/", { method: "POST", body: { query }, fetchFn });
};

const server = new ViteMCP({ name: "posthog-chimeranext", version: "0.1.0" });

server.addTool({
  name: "posthog_query",
  description:
    "Run a PostHog insight/trend query against the self-hosted instance (POSTHOG_HOST, default http://localhost:8000). Auth via POSTHOG_PERSONAL_API_KEY (env). Returns the structured query result. Never touches mcp.posthog.com.",
  parameters: z.object({
    query: z.any().describe("PostHog query object (e.g. { kind: 'TrendsQuery', series: [{ event: 'pageview' }] })"),
  }),
  execute: async ({ query }) => {
    const result = await runQuery(query);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
});

server.addTool({
  name: "posthog_funnel",
  description:
    "Run a PostHog funnel query against the self-hosted instance. Requires a series of events/actions and returns the funnel breakdown.",
  parameters: z.object({
    events: z.array(z.string()).min(1).describe("Ordered event names that define the funnel steps"),
    date_from: z.string().optional().describe('e.g. "-30d" or "2026-01-01"'),
  }),
  execute: async ({ events, date_from }) => {
    const query = {
      kind: "FunnelsQuery",
      series: events.map((event) => ({ kind: "EventsNode", event })),
      ...(date_from ? { dateRange: { date_from } } : {}),
    };
    const result = await runQuery(query);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
});

server.addTool({
  name: "posthog_retention",
  description:
    "Run a PostHog retention query against the self-hosted instance. Returns cohort retention by period.",
  parameters: z.object({
    target_event: z.string().describe("The event users return for (retention target)"),
    returning_event: z.string().optional().describe("The event that marks a returning user"),
    period: z.enum(["Day", "Week", "Month"]).optional().default("Week"),
  }),
  execute: async ({ target_event, returning_event, period }) => {
    const query = {
      kind: "RetentionQuery",
      retentionFilter: {
        target_entity: { kind: "EventsNode", event: target_event },
        returning_entity: returning_event ? { kind: "EventsNode", event: returning_event } : undefined,
        period,
      },
    };
    const result = await runQuery(query);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  },
});

if (process.argv[1]?.endsWith("server.js")) {
  await server.start({ transportType: "stdio" });
}
