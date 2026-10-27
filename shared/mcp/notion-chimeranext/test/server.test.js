/** notion-batch tests — run with: node --test test/ (mocked fetch, no network, no token) */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseId, richText, renderBlock, fetchTree } from "../server.js";

describe("parseId", () => {
  it("extracts 32-hex from notion URLs", () => {
    assert.equal(parseId("https://app.notion.com/p/a7ad121dfabb477092d25eed4ecd38d0"), "a7ad121dfabb477092d25eed4ecd38d0");
  });
  it("strips dashes from UUIDs", () => {
    assert.equal(parseId("81dc2be4-1e3c-4fe7-8d06-07375a0ee9a9"), "81dc2be41e3c4fe78d0607375a0ee9a9");
  });
  it("throws on garbage", () => {
    assert.throws(() => parseId("not-an-id"), /cannot parse/);
  });
});

describe("richText", () => {
  it("keeps links verbatim with annotations", () => {
    const out = richText([
      { plain_text: "doc", href: "https://example.com/x", annotations: { bold: true } },
    ]);
    assert.equal(out, "[**doc**](https://example.com/x)");
  });
});

describe("renderBlock", () => {
  it("resolves bookmark destinations verbatim (the native-MCP blind spot)", () => {
    const { md } = renderBlock({
      id: "b1", type: "bookmark",
      bookmark: { url: "https://www.youtube.com/playlist?list=PLXkcIZjeJAbDOFwUtdZBe1rzqm5LPvHyF", caption: [] },
    });
    assert.equal(md, "[https://www.youtube.com/playlist?list=PLXkcIZjeJAbDOFwUtdZBe1rzqm5LPvHyF](https://www.youtube.com/playlist?list=PLXkcIZjeJAbDOFwUtdZBe1rzqm5LPvHyF)");
  });
  it("keeps external video URLs", () => {
    const { md } = renderBlock({
      id: "b2", type: "video", video: { type: "external", external: { url: "https://www.youtube.com/watch?v=Sq1S4sZJXMc" } },
    });
    assert.equal(md, "[video](https://www.youtube.com/watch?v=Sq1S4sZJXMc)");
  });
  it("queues child pages for recursion", () => {
    const { descend } = renderBlock({ id: "b3", type: "child_page", child_page: { title: "Sub" } });
    assert.deepEqual(descend, [{ id: "b3", kind: "page" }]);
  });
  it("renders table rows as pipes", () => {
    const { md } = renderBlock({
      id: "b4", type: "table_row",
      table_row: { cells: [[{ plain_text: "a" }], [{ plain_text: "b", href: "https://e.com" }]] },
    });
    assert.equal(md, "| a | [b](https://e.com) |");
  });
});

describe("fetchTree (mocked API)", () => {
  const ROOT = "a".repeat(32);
  const CHILD = "b".repeat(32);
  const routes = {
    [`/v1/pages/${ROOT}`]: { object: "page", id: ROOT, properties: { title: { type: "title", title: [{ plain_text: "Hub" }] } } },
    [`/v1/blocks/${ROOT}/children`]: {
      results: [
        { id: "bm1", type: "bookmark", bookmark: { url: "https://example.com/guide", caption: [] } },
        { id: CHILD, type: "child_page", child_page: { title: "Sub" } },
      ],
    },
    [`/v1/pages/${CHILD}`]: { object: "page", id: CHILD, properties: { title: { type: "title", title: [{ plain_text: "Sub" }] } } },
    [`/v1/blocks/${CHILD}/children`]: {
      results: [{ id: "p1", type: "paragraph", paragraph: { rich_text: [{ plain_text: "hello" }] } }],
    },
  };
  const mockFetch = async (url) => {
    const path = new URL(url).pathname + new URL(url).search;
    const key = Object.keys(routes).find((k) => path.startsWith(k));
    assert.ok(key, `unexpected request: ${url}`);
    return { ok: true, json: async () => routes[key] };
  };

  it("recurses hub → child with verbatim bookmark URL", async () => {
    process.env.NOTION_API_KEY = "test-dummy";
    const tree = await fetchTree(ROOT, { maxDepth: 4, maxPages: 10, fetchFn: mockFetch, throttleMs: 0 });
    assert.equal(tree.pages.length, 2);
    assert.ok(tree.pages[0].markdown.includes("[https://example.com/guide](https://example.com/guide)"));
    assert.ok(tree.pages[1].markdown.includes("hello"));
    delete process.env.NOTION_API_KEY;
  });
});
