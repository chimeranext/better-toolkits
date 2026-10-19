#!/usr/bin/env node
/**
 * notion-batch-mcp — custom local MCP server (stdio) for loss-less Notion extraction.
 *
 * Why this exists: the native Notion MCP (`https://mcp.notion.com/mcp`) renders
 * bookmark blocks as opaque `<unknown url="page#fragment">` pointers — the
 * destination URL is never exposed by any of its tools. This server talks to
 * the Notion REST API directly, where `bookmark.url` is verbatim.
 *
 * Auth: NOTION_API_KEY env (internal integration token, `ntn_…`). The
 * integration must be shared with (invited to) every page/database fetched.
 * Secret stays in env — never in config JSON, chat, or logs.
 *
 * Tools:
 *   - fetch_tree       recursive page/database → markdown pages + URL inventory
 *   - query_database   flat rows (title + URL + properties) for one database
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API = "https://api.notion.com/v1";
const VERSION = "2022-06-28";

function token() {
  const t = process.env.NOTION_API_KEY;
  if (!t) throw new Error("NOTION_API_KEY is not set in the server environment");
  return t;
}

async function api(path, { method = "GET", body } = {}, fetchFn = fetch) {
  const res = await fetchFn(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token()}`,
      "Notion-Version": VERSION,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Notion API ${res.status} on ${path}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

/** 32-hex id out of a notion.so URL or bare id (dashes optional). */
export function parseId(input) {
  const m = String(input).match(/([0-9a-f]{32})/i) || String(input).match(/([0-9a-f-]{36})/i);
  if (!m) throw new Error(`cannot parse a Notion id from: ${input}`);
  return m[1].replace(/-/g, "").toLowerCase();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function paged(path, body, fetchFn, throttleMs) {
  const items = [];
  let cursor;
  do {
    await sleep(throttleMs);
    const data = await api(path, { method: "POST", body: { ...body, ...(cursor ? { start_cursor: cursor } : {}) } }, fetchFn);
    items.push(...(data.results ?? []));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return items;
}

/** Blocks children uses GET + start_cursor query (unlike query/search POST). */
async function listChildren(blockId, fetchFn, throttleMs) {
  const items = [];
  let cursor;
  do {
    await sleep(throttleMs);
    const q = new URLSearchParams({ page_size: "100", ...(cursor ? { start_cursor: cursor } : {}) });
    const data = await api(`/blocks/${blockId}/children?${q}`, {}, fetchFn);
    items.push(...(data.results ?? []));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return items;
}

async function queryDb(dbId, fetchFn, throttleMs) {
  return paged(`/databases/${dbId}/query`, { page_size: 100 }, fetchFn, throttleMs);
}

/** Rich text array → markdown, links verbatim, annotations preserved. */
export function richText(rich = []) {
  return rich
    .map((r) => {
      let t = r.plain_text ?? r.text?.content ?? "";
      const href = r.href ?? r.text?.link?.url;
      if (r.annotations?.code) t = `\`${t}\``;
      if (r.annotations?.bold) t = `**${t}**`;
      if (r.annotations?.italic) t = `_${t}_`;
      if (r.annotations?.strikethrough) t = `~~${t}~~`;
      if (href) t = `[${t}](${href})`;
      return t;
    })
    .join("");
}

function pageTitle(page) {
  const props = page?.properties ?? {};
  for (const p of Object.values(props)) {
    if (p?.type === "title" && p.title?.length) return richText(p.title);
  }
  return page?.id ?? "untitled";
}

const pageUrl = (id) => `https://app.notion.com/${id.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1$2$3$4$5").replace(/-/g, "")}`;

/**
 * Render one block. Returns {md, descend: [{id, kind}]} — child pages /
 * databases the caller recurses into when depth allows.
 */
export function renderBlock(b) {
  const t = b.type;
  const descend = [];
  const rt = (key) => richText(b[key]?.rich_text ?? []);
  switch (t) {
    case "paragraph": return { md: rt("paragraph"), descend };
    case "heading_1": return { md: `# ${rt("heading_1")}`, descend };
    case "heading_2": return { md: `## ${rt("heading_2")}`, descend };
    case "heading_3": return { md: `### ${rt("heading_3")}`, descend };
    case "bulleted_list_item": return { md: `- ${rt("bulleted_list_item")}`, descend };
    case "numbered_list_item": return { md: `1. ${rt("numbered_list_item")}`, descend };
    case "to_do": return { md: `- [${b.to_do?.checked ? "x" : " "}] ${rt("to_do")}`, descend };
    case "toggleable_heading_1": return { md: `# ${rt("toggleable_heading_1")}`, descend };
    case "toggleable_heading_2": return { md: `## ${rt("toggleable_heading_2")}`, descend };
    case "toggleable_heading_3": return { md: `### ${rt("toggleable_heading_3")}`, descend };
    case "quote": return { md: `> ${rt("quote")}`, descend };
    case "callout": return { md: `> ${b.callout?.icon?.emoji ? b.callout.icon.emoji + " " : ""}${rt("callout")}`, descend };
    case "code": return { md: `\`\`\`${b.code?.language ?? ""}\n${rt("code")}\n\`\`\``, descend };
    case "divider": return { md: "---", descend };
    // THE fix vs native MCP: bookmark destination verbatim, never a bare fragment.
    case "bookmark": {
      const url = b.bookmark?.url ?? "";
      const cap = richText(b.bookmark?.caption ?? []) || url;
      return { md: `[${cap}](${url})`, descend };
    }
    case "embed": return { md: `[embed](${b.embed?.url ?? ""})`, descend };
    case "video": {
      const v = b.video ?? {};
      const url = v.type === "external" ? v.external?.url : `(${v.type} file — fetch a fresh signed URL via files API; expires)`;
      return { md: `[video](${url})`, descend };
    }
    case "image": {
      const im = b.image ?? {};
      const url = im.type === "external" ? im.external?.url : (im.file?.url ?? "");
      const cap = richText(im.caption ?? []) || "image";
      return { md: `![${cap}](${url})${im.type === "file" ? " <!-- signed URL, expires ~1h -->" : ""}`, descend };
    }
    case "file":
    case "pdf": {
      const f = b[t] ?? {};
      const url = f.type === "external" ? f.external?.url : (f.file?.url ?? "");
      return { md: `[${f.name ?? t}](${url})${f.type === "file" ? " <!-- signed URL, expires ~1h -->" : ""}`, descend };
    }
    case "link_preview": return { md: `[${b.link_preview?.url ?? ""}](${b.link_preview?.url ?? ""})`, descend };
    case "child_page":
      descend.push({ id: b.id, kind: "page" });
      return { md: `[[child page: ${b.child_page?.title ?? b.id}]]`, descend };
    case "child_database":
      descend.push({ id: b.id, kind: "database" });
      return { md: `[[child database: ${b.child_database?.title ?? b.id}]]`, descend };
    case "link_to_page": {
      const ref = b.link_to_page?.page_id ?? b.link_to_page?.database_id ?? "";
      return { md: `[→ ${ref}](${ref ? pageUrl(ref) : ""})`, descend };
    }
    case "table": return { md: `<!-- table ${b.id}: rows fetched as children -->`, descend: [{ id: b.id, kind: "children" }] };
    case "table_row": return { md: `| ${(b.table_row?.cells ?? []).map((c) => richText(c).replace(/\|/g, "\\|")).join(" | ")} |`, descend };
    case "column_list":
    case "column":
      return { md: "", descend: [{ id: b.id, kind: "children" }] };
    default:
      if (b.has_children) descend.push({ id: b.id, kind: "children" });
      return { md: `<!-- unsupported block: ${t} (${b.id}) -->`, descend };
  }
}

export async function fetchTree(rootInput, { maxDepth = 4, maxPages = 300, fetchFn = fetch, throttleMs = 350 } = {}) {
  const rootId = parseId(rootInput);
  const pages = [];
  const seen = new Set();
  const queue = [{ id: rootId, kind: "page-or-db", depth: 0 }];

  // Root may be a database: probe both, prefer page then database.
  async function kindOf(id) {
    await sleep(throttleMs);
    const pg = await api(`/pages/${id}`, {}, fetchFn).catch(() => null);
    if (pg?.object === "page") return { kind: "page", page: pg };
    await sleep(throttleMs);
    const db = await api(`/databases/${id}`, {}, fetchFn).catch(() => null);
    if (db?.object === "database") return { kind: "database", db };
    throw new Error(`id ${id} is neither an accessible page nor database (shared with the integration?)`);
  }

  async function fetchPage(id, depth) {
    await sleep(throttleMs);
    const page = await api(`/pages/${id}`, {}, fetchFn);
    const title = pageTitle(page);
    const lines = [`# ${title}`, ``, `> source: ${pageUrl(id)}`, ``];
    const blocks = await listChildren(id, fetchFn, throttleMs);
    for (const b of blocks) {
      const { md, descend } = renderBlock(b);
      if (md) lines.push(md, ``);
      for (const d of descend) {
        if (d.kind === "children") {
          // inline children (toggles, columns, tables): splice their render here
          if (depth + 1 <= maxDepth) {
            const sub = await listChildren(d.id, fetchFn, throttleMs);
            for (const sb of sub) {
              const r = renderBlock(sb);
              if (r.md) lines.push(r.md, ``);
              for (const dd of r.descend) queue.push({ ...dd, depth: depth + 1 });
            }
          }
        } else queue.push({ ...d, depth: depth + 1 });
      }
    }
    pages.push({ id, title, url: pageUrl(id), markdown: lines.join("\n").trimEnd() });
  }

  async function fetchDatabase(id, depth) {
    await sleep(throttleMs);
    const db = await api(`/databases/${id}`, {}, fetchFn);
    const title = richText(db.title ?? []);
    const rows = await queryDb(id, fetchFn, throttleMs);
    const lines = [`# ${title || "database"}`, ``, `> source: ${pageUrl(id)} · rows: ${rows.length}`, ``];
    for (const r of rows) {
      const t = pageTitle(r);
      lines.push(`- [${t}](${pageUrl(r.id)})`);
      if (depth + 1 <= maxDepth) queue.push({ id: r.id, kind: "page", depth: depth + 1 });
    }
    pages.push({ id, title: title || "database", url: pageUrl(id), markdown: lines.join("\n") });
  }

  const root = await kindOf(rootId);
  queue.shift();
  if (root.kind === "page") {
    seen.add(rootId);
    await fetchPage(rootId, 0);
    // enqueue discovered children collected during fetchPage via shared queue trick:
  } else {
    seen.add(rootId);
    await fetchDatabase(rootId, 0);
  }

  // fetchPage/fetchDatabase push to `queue` via closure — drain it:
  while (queue.length && pages.length < maxPages) {
    const next = queue.shift();
    const nid = next.id.replace(/-/g, "");
    if (seen.has(nid)) continue;
    seen.add(nid);
    if (next.depth > maxDepth) continue;
    if (next.kind === "database") await fetchDatabase(nid, next.depth);
    else {
      const k = await kindOf(nid).catch(() => ({ kind: "page" }));
      if (k.kind === "database") await fetchDatabase(nid, next.depth);
      else await fetchPage(nid, next.depth);
    }
  }
  return { root: { id: rootId, url: pageUrl(rootId) }, pages, truncated: queue.length > 0 };
}

// NOTE: fetchPage/fetchDatabase push discovered children into the drain queue
// via closure. They reference `queue` declared above — kept as module pattern
// (single-flight per call since state is per-invocation).

const server = new McpServer({ name: "notion-batch", version: "0.1.0" });

server.tool(
  "fetch_tree",
  "Recursively fetch a Notion page or database with VERBATIM bookmark/video/file URLs (fixes the native Notion MCP blind spot). Returns markdown per page plus inventory. Needs NOTION_API_KEY and the integration invited to the pages.",
  {
    root: z.string().describe("Page/database URL or id (32-hex with or without dashes)"),
    max_depth: z.number().int().min(0).max(6).default(4),
    max_pages: z.number().int().min(1).max(500).default(300),
  },
  async ({ root, max_depth, max_pages }) => {
    const tree = await fetchTree(root, { maxDepth: max_depth, maxPages: max_pages });
    return {
      content: [{ type: "text", text: JSON.stringify({ pages: tree.pages.length, truncated: tree.truncated, inventory: tree.pages.map((p) => ({ title: p.title, url: p.url })) }, null, 2) + "\n\n" + tree.pages.map((p) => `--- PAGE ${p.url} ---\n${p.markdown}`).join("\n\n") }],
    };
  },
);

server.tool(
  "query_database",
  "Flat rows (title + URL + raw properties) for one Notion database. No recursion.",
  { database: z.string().describe("Database URL or id") },
  async ({ database }) => {
    const id = parseId(database);
    const rows = await queryDb(id, fetch, 350);
    const out = rows.map((r) => ({ title: pageTitle(r), url: pageUrl(r.id), properties: r.properties ?? {} }));
    return { content: [{ type: "text", text: JSON.stringify(out, null, 2) }] };
  },
);

if (process.argv[1]?.endsWith("server.js")) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
