/** stitch-chimeranext tests — run with: node --test test/ (mocked gcloud + fetch, no network, no token) */
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  requireEnv,
  buildGetScreenRequest,
  callStitch,
  extractScreenResult,
} from "../server.js";

const API = "https://stitch.googleapis.com/mcp";

/** Return a fetch mock that captures the request and answers with a given JSON. */
function captureFetch(responder) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, init });
    return {
      ok: true,
      json: async () => (typeof responder === "function" ? responder(calls.length) : responder),
    };
  };
  fn.calls = calls;
  return fn;
}

const FAKE_TOKEN = "gcloud-fake-access-token";

describe("requireEnv", () => {
  afterEach(() => {
    delete process.env.STITCH_GCP_PROJECT;
  });
  it("returns the var when set", () => {
    process.env.STITCH_GCP_PROJECT = "344341424155";
    assert.equal(requireEnv("STITCH_GCP_PROJECT"), "344341424155");
  });
  it("throws a UserError naming the missing var", () => {
    delete process.env.STITCH_GCP_PROJECT;
    assert.throws(() => requireEnv("STITCH_GCP_PROJECT"), /STITCH_GCP_PROJECT is not set/);
  });
});

describe("buildGetScreenRequest", () => {
  it("builds the Stitch tools/call payload (projectId = Stitch id, not GCP number)", () => {
    const body = buildGetScreenRequest("9064173060952920822", "screen-1");
    assert.equal(body.jsonrpc, "2.0");
    assert.equal(body.method, "tools/call");
    assert.equal(body.params.name, "get_screen");
    assert.deepEqual(body.params.arguments, {
      projectId: "9064173060952920822",
      screenId: "screen-1",
    });
  });
});

describe("callStitch", () => {
  beforeEach(() => {
    process.env.STITCH_GCP_PROJECT = "344341424155";
  });
  afterEach(() => {
    delete process.env.STITCH_GCP_PROJECT;
  });

  it("sends Authorization Bearer + X-Goog-User-Project and POSTs to /mcp", async () => {
    const fetchFn = captureFetch({ result: { content: [{ type: "text", text: "{}" }] } });
    const rpc = await callStitch(buildGetScreenRequest("p1", "s1"), {
      fetchFn,
      tokenFn: () => FAKE_TOKEN,
    });

    assert.equal(fetchFn.calls.length, 1);
    const { url, init } = fetchFn.calls[0];
    assert.equal(url, API);
    assert.equal(init.method, "POST");
    assert.equal(init.headers.Authorization, `Bearer ${FAKE_TOKEN}`);
    assert.equal(init.headers["X-Goog-User-Project"], "344341424155");
    assert.equal(init.headers["Content-Type"], "application/json");

    const sent = JSON.parse(init.body);
    assert.equal(sent.params.name, "get_screen");
    assert.deepEqual(sent.params.arguments, { projectId: "p1", screenId: "s1" });
    assert.ok(rpc.result);
  });

  it("throws a UserError naming STITCH_GCP_PROJECT when it is missing", async () => {
    delete process.env.STITCH_GCP_PROJECT;
    const fetchFn = captureFetch({});
    await assert.rejects(
      callStitch(buildGetScreenRequest("p1", "s1"), { fetchFn, tokenFn: () => FAKE_TOKEN }),
      /STITCH_GCP_PROJECT is not set/
    );
    assert.equal(fetchFn.calls.length, 0, "no network call should be attempted without config");
  });
});

describe("extractScreenResult", () => {
  it("parses the nested JSON text into download URLs", () => {
    const payload = JSON.stringify({
      screenshot: { downloadUrl: "https://d.example/s.png" },
      htmlCode: { downloadUrl: "https://d.example/s.html" },
      cssCode: { downloadUrl: "https://d.example/s.css" },
    });
    const rpc = { result: { content: [{ type: "text", text: payload }] } };
    assert.deepEqual(extractScreenResult(rpc), {
      screenshot_download_url: "https://d.example/s.png",
      html_download_url: "https://d.example/s.html",
      css_download_url: "https://d.example/s.css",
    });
  });

  it("surfaces raw text when the payload is not JSON", () => {
    const rpc = { result: { content: [{ type: "text", text: "not-json" }] } };
    assert.deepEqual(extractScreenResult(rpc), { raw: "not-json" });
  });

  it("throws a UserError on a Stitch jsonrpc error", () => {
    const rpc = { error: { code: -32603, message: "boom" } };
    assert.throws(() => extractScreenResult(rpc), /Stitch returned an error/);
  });
});
