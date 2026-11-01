import { test } from "node:test";
import assert from "node:assert/strict";
import { host, requireKey, posthogApi, runQuery } from "../server.js";

test("host() defaults to localhost:8000 when POSTHOG_HOST is unset", () => {
  delete process.env.POSTHOG_HOST;
  assert.equal(host(), "http://localhost:8000");
});

test("host() uses POSTHOG_HOST and strips trailing slash", () => {
  process.env.POSTHOG_HOST = "http://localhost:9000/";
  assert.equal(host(), "http://localhost:9000");
});

test("requireKey() throws a clear UserError when key is missing", () => {
  delete process.env.POSTHOG_PERSONAL_API_KEY;
  assert.throws(() => requireKey(), /POSTHOG_PERSONAL_API_KEY is not set/);
});

test("requireKey() returns the trimmed key when set", () => {
  process.env.POSTHOG_PERSONAL_API_KEY = "  phc_secret  ";
  assert.equal(requireKey(), "phc_secret");
});

test("posthogApi() targets POSTHOG_HOST (never mcp.posthog.com) with Bearer auth", async () => {
  process.env.POSTHOG_HOST = "http://localhost:8000";
  process.env.POSTHOG_PERSONAL_API_KEY = "phc_secret";
  process.env.POSTHOG_PROJECT_ID = "2";

  let calledUrl;
  const fakeFetch = async (url, opts) => {
    calledUrl = url;
    assert.match(opts.headers.Authorization, /^Bearer phc_secret$/);
    assert.match(url, /^http:\/\/localhost:8000\/api\/projects\/2\//);
    assert.ok(!url.includes("mcp.posthog.com"), "must never route to the cloud MCP");
    return { ok: true, json: async () => ({ result: "ok" }) };
  };

  const out = await posthogApi("/query/", { method: "POST", body: { kind: "TrendsQuery" }, fetchFn: fakeFetch });
  assert.equal(out.result, "ok");
  assert.ok(calledUrl);
});

test("posthogApi() surfaces a non-OK response with the status and path", async () => {
  process.env.POSTHOG_HOST = "http://localhost:8000";
  process.env.POSTHOG_PERSONAL_API_KEY = "phc_secret";
  const fakeFetch = async () => ({ ok: false, status: 401, text: async () => "unauthorized" });
  await assert.rejects(
    () => posthogApi("/query/", { method: "POST", body: {}, fetchFn: fakeFetch }),
    /PostHog API 401 on \/query\//
  );
});

test("posthogApi() rejects when the key is missing even at call time", async () => {
  delete process.env.POSTHOG_PERSONAL_API_KEY;
  process.env.POSTHOG_HOST = "http://localhost:8000";
  await assert.rejects(() => posthogApi("/query/"), /POSTHOG_PERSONAL_API_KEY is not set/);
});

test("runQuery() posts the query inside the { query } envelope", async () => {
  process.env.POSTHOG_HOST = "http://localhost:8000";
  process.env.POSTHOG_PERSONAL_API_KEY = "phc_secret";
  let seenBody;
  const fakeFetch = async (url, opts) => {
    seenBody = JSON.parse(opts.body);
    return { ok: true, json: async () => ({ result: 42 }) };
  };
  const out = await runQuery({ kind: "TrendsQuery", series: [] }, { fetchFn: fakeFetch });
  assert.equal(out.result, 42);
  assert.deepEqual(seenBody, { query: { kind: "TrendsQuery", series: [] } });
});
