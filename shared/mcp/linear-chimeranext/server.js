#!/usr/bin/env node
/**
 * linear-chimeranext — local stateless ViteMCP server (stdio) for Linear.
 *
 * Why this exists: the remote `linear-project` MCP is being migrated to a
 * local, stateless ViteMCP server. This server talks directly to Linear's
 * public GraphQL API at https://api.linear.app/graphql using a personal API
 * key passed verbatim in the `Authorization` header (Linear's scheme — no
 * "Bearer" prefix for personal keys).
 *
 * Auth: LINEAR_API_KEY env (personal API key, `lin_api_…`). The secret stays
 * in env — never in config JSON, chat, or logs.
 *
 * Stateless / ViteMCP: targets MCP revision 2026-07-28. There is no
 * `initialize` handshake and no `Mcp-Session-Id` — every request is
 * self-contained and carries its own protocol version and client capabilities.
 *
 * Tools:
 *   - issue_get     fetch one issue by UUID or human identifier (e.g. ENG-123)
 *   - issue_search   full-text search across issues (searchIssues)
 *   - issue_create   create an issue in a team (IssueCreateInput mutation)
 *   - team_list      list teams (id, name, key)
 */
import { ViteMCP, UserError } from "@vitemcp/server";
import { z } from "zod";

const API = "https://api.linear.app/graphql";

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

/** Shared Issue field selection for reads (works for both issue and search). */
const ISSUE_SELECT = `
  id identifier title description url number priority estimate dueDate
  state { id name type }
  assignee { id name }
  creator { id name }
  team { id key name }
  project { id name }
  labels { nodes { id name color } }
  createdAt updatedAt
`;

export const QUERIES = {
  teams: `query { teams { nodes { id name key } } }`,
  issueById: `query($id: String!) { issue(id: $id) { ${ISSUE_SELECT} } }`,
  searchIssues: `query($term: String!, $first: Int!) {
    searchIssues(term: $term, first: $first) { nodes { ${ISSUE_SELECT} } }
  }`,
  issueCreate: `mutation($input: IssueCreateInput!) {
    issueCreate(input: $input) { success issue { id identifier title url state { name } } }
  }`,
};

/**
 * Execute a GraphQL operation against Linear. Returns `data` on success.
 * Throws a UserError on: missing API key, GraphQL errors, or a decline payload
 * (`success: false`). Throws an Error on non-2xx HTTP / non-JSON responses.
 */
export async function gql(query, variables = {}, { fetchFn = fetch } = {}) {
  const key = requireEnv("LINEAR_API_KEY");
  const res = await fetchFn(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: key,
    },
    body: JSON.stringify({ query, variables }),
  });
  let payload;
  try {
    payload = await res.json();
  } catch {
    const text = await res.text().catch(() => "");
    throw new Error(`Linear GraphQL returned non-JSON (${res.status}): ${text.slice(0, 300)}`);
  }
  if (!res.ok) {
    throw new Error(`Linear GraphQL responded ${res.status}: ${JSON.stringify(payload).slice(0, 300)}`);
  }
  if (payload.errors && payload.errors.length) {
    const msg = payload.errors.map((e) => e.message).join("; ");
    throw new UserError(`Linear GraphQL error: ${msg}`);
  }
  if (payload.data === null || payload.data === undefined) {
    throw new Error("Linear GraphQL returned empty data");
  }
  return payload.data;
}

/** Normalize a raw Linear Issue node into a stable, structured shape. */
export function mapIssue(node) {
  if (!node) return null;
  return {
    id: node.id,
    identifier: node.identifier ?? null,
    title: node.title ?? null,
    description: node.description ?? null,
    url: node.url ?? null,
    number: node.number ?? null,
    priority: node.priority ?? null,
    estimate: node.estimate ?? null,
    dueDate: node.dueDate ?? null,
    state: node.state ? { id: node.state.id, name: node.state.name, type: node.state.type } : null,
    assignee: node.assignee ? { id: node.assignee.id, name: node.assignee.name } : null,
    creator: node.creator ? { id: node.creator.id, name: node.creator.name } : null,
    team: node.team ? { id: node.team.id, key: node.team.key, name: node.team.name } : null,
    project: node.project ? { id: node.project.id, name: node.project.name } : null,
    labels: (node.labels?.nodes ?? []).map((l) => ({ id: l.id, name: l.name, color: l.color ?? null })),
    createdAt: node.createdAt ?? null,
    updatedAt: node.updatedAt ?? null,
  };
}

const server = new ViteMCP({ name: "linear-chimeranext", version: "0.1.0" });

server.addTool({
  name: "team_list",
  description:
    "List Linear teams (id, name, key). Useful to resolve the teamId needed by issue_create. Needs LINEAR_API_KEY.",
  parameters: z.object({}),
  execute: async () => {
    const data = await gql(QUERIES.teams);
    const teams = (data.teams?.nodes ?? []).map((t) => ({ id: t.id, name: t.name, key: t.key ?? null }));
    return { content: [{ type: "text", text: JSON.stringify(teams, null, 2) }] };
  },
});

server.addTool({
  name: "issue_get",
  description:
    "Fetch one Linear issue by UUID or human identifier (e.g. ENG-123). Needs LINEAR_API_KEY.",
  parameters: z.object({
    id: z.string().describe("Issue UUID or identifier (e.g. 'ENG-123')"),
  }),
  execute: async ({ id }) => {
    const data = await gql(QUERIES.issueById, { id });
    const issue = mapIssue(data.issue);
    if (!issue) throw new UserError(`No issue found for id: ${id}`);
    return { content: [{ type: "text", text: JSON.stringify(issue, null, 2) }] };
  },
});

server.addTool({
  name: "issue_search",
  description: "Full-text search Linear issues (searchIssues) by term. Needs LINEAR_API_KEY.",
  parameters: z.object({
    term: z.string().describe("Search term"),
    first: z.number().int().min(1).max(250).default(25).describe("Max results (default 25)"),
  }),
  execute: async ({ term, first }) => {
    const data = await gql(QUERIES.searchIssues, { term, first });
    const issues = (data.searchIssues?.nodes ?? []).map(mapIssue);
    return { content: [{ type: "text", text: JSON.stringify(issues, null, 2) }] };
  },
});

server.addTool({
  name: "issue_create",
  description:
    "Create a Linear issue in a team (teamId required, from team_list). Description is markdown. Priority: 0=none, 1=urgent, 2=high, 3=normal, 4=low. Needs LINEAR_API_KEY.",
  parameters: z.object({
    teamId: z.string().describe("Team UUID (from team_list)"),
    title: z.string().describe("Issue title"),
    description: z.string().optional().describe("Markdown description"),
    assigneeId: z.string().optional().describe("User UUID to assign"),
    labelIds: z.array(z.string()).optional().describe("Label UUIDs to attach"),
    stateId: z.string().optional().describe("Workflow state UUID"),
    priority: z.number().int().min(0).max(4).optional().describe("0-4"),
  }),
  execute: async (args) => {
    const input = { teamId: args.teamId, title: args.title };
    if (args.description !== undefined) input.description = args.description;
    if (args.assigneeId !== undefined) input.assigneeId = args.assigneeId;
    if (args.labelIds !== undefined) input.labelIds = args.labelIds;
    if (args.stateId !== undefined) input.stateId = args.stateId;
    if (args.priority !== undefined) input.priority = args.priority;
    const data = await gql(QUERIES.issueCreate, { input });
    const res = data.issueCreate;
    if (!res?.success) throw new UserError("Linear issueCreate reported success: false");
    return { content: [{ type: "text", text: JSON.stringify(mapIssue(res.issue), null, 2) }] };
  },
});

if (process.argv[1]?.endsWith("server.js")) {
  await server.start({ transportType: "stdio" });
}
