// Stateless MCP server (ViteMCP) exposing the OpenTwinBuilder Feature Factory
// as tools opencode can call. This is the better-toolkits-side *consumer*:
// each tool connects to the OpenTwinBuilder rmcp server (stdio) and forwards the
// feature-factory / versioning operation. Targets MCP revision 2026-07-28.
import { ViteMCP, UserError } from "@vitemcp/server";
import { z } from "zod";
import { callOtb } from "./client.js";

type Json = Record<string, unknown>;

async function asJson(tool: string, args: Json): Promise<Json> {
  const raw = await callOtb("tools/call", { name: tool, arguments: args });
  const result = raw as { content?: Array<{ text?: string }> };
  const text = result?.content?.[0]?.text ?? "";
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

const server = new ViteMCP({
  name: "otb-feature-factory-client",
  version: "0.1.0",
  description:
    "Consumer-side MCP client for OpenTwinBuilder (rmcp/Rust). Dogfoods the Feature Factory inbound surface: feature.generate/test/register, plus model versioning. A2A orchestrator is a separate layer.",
});

server.addTool({
  name: "otb.capability_report",
  description: "Report the OpenTwinBuilder server's negotiated capabilities",
  parameters: z.object({}),
  execute: async () => {
    const raw = await callOtb("tools/list");
    const tools = (raw as { tools?: Array<{ name: string }> }).tools ?? [];
    return {
      content: [{ type: "text", text: JSON.stringify({ tools: tools.map((t) => t.name) }, null, 2) }],
    };
  },
});

server.addTool({
  name: "otb.feature.generate",
  description: "Generate a reusable parametric feature definition on OpenTwinBuilder",
  parameters: z.object({
    name: z.string().describe("feature name"),
    code: z.string().describe("FeatureScript-style source snippet"),
  }),
  execute: async ({ name, code }) => {
    const out = await asJson("feature_generate", { name, code });
    return { content: [{ type: "text", text: JSON.stringify(out, null, 2) }] };
  },
});

server.addTool({
  name: "otb.feature.test",
  description: "Validate a feature definition on OpenTwinBuilder",
  parameters: z.object({
    name: z.string(),
    code: z.string(),
  }),
  execute: async ({ name, code }) => {
    const out = await asJson("feature_test", { name, code });
    return { content: [{ type: "text", text: JSON.stringify(out, null, 2) }] };
  },
});

server.addTool({
  name: "otb.feature.register",
  description: "Register a reusable feature on OpenTwinBuilder",
  parameters: z.object({
    name: z.string(),
    code: z.string(),
  }),
  execute: async ({ name, code }) => {
    const out = await asJson("feature_register", { name, code });
    return { content: [{ type: "text", text: JSON.stringify(out, null, 2) }] };
  },
});

server.addTool({
  name: "otb.model.commit",
  description: "Commit on a digital-twin branch (Git-style) on OpenTwinBuilder",
  parameters: z.object({
    branch: z.string(),
    label: z.string(),
    message: z.string(),
  }),
  execute: async ({ branch, label, message }) => {
    const out = await asJson("model_commit", { branch, label, message });
    return { content: [{ type: "text", text: JSON.stringify(out, null, 2) }] };
  },
});

server.addTool({
  name: "otb.model.history",
  description: "List commit history of a branch on OpenTwinBuilder",
  parameters: z.object({ branch: z.string() }),
  execute: async ({ branch }) => {
    const out = await asJson("model_history", { branch });
    return { content: [{ type: "text", text: JSON.stringify(out, null, 2) }] };
  },
});

if (process.argv[1]?.endsWith("server.ts") || process.argv[1]?.endsWith("server.js")) {
  await server.start({ transportType: "stdio" });
}
