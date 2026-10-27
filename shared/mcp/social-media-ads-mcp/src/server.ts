// Stateless MCP server for the ads-multi-network router.
// Targets MCP revision 2026-07-28 via ViteMCP: NO initialize handshake, NO
// Mcp-Session-Id — every request is self-contained. One tool per operation;
// the router remains the single request chokepoint (schema → capability →
// guardrails → adapter → journal → redaction).

import { ViteMCP, UserError, jsonSchemaAdapter } from "@vitemcp/server";
import { call } from "./router.js";
import { OPERATIONS, toToolSchema } from "./operations.js";
import { buildRegistry } from "./adapters/index.js";

const registry = buildRegistry();

const server = new ViteMCP({
  name: "ads-multi-network",
  version: "0.1.0",
  description:
    "Paid media operations over Meta, TikTok, LinkedIn, Google Ads, YouTube and Spotify behind one normalized tool contract. Drafts-first by construction; spend caps evaluated before any network call; null and zero are distinct in insights; journal keeps a directional lift readout.",
});

for (const def of OPERATIONS) {
  const tool = toToolSchema(def);
  server.addTool({
    name: def.name,
    description: def.description,
    parameters: jsonSchemaAdapter(tool.inputSchema as any),
    execute: async (args) => {
      const out = await call(def.name, (args ?? {}) as Record<string, unknown>, { registry });
      if (!out.ok) {
        throw new UserError(JSON.stringify(out.error ?? { code: "error", message: "operation failed" }));
      }
      return JSON.stringify(out.result);
    },
  });
}

if (process.argv[1]?.endsWith("server.ts") || process.argv[1]?.endsWith("server.js")) {
  await server.start({ transportType: "stdio" });
}
