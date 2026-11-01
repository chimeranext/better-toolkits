/** slack-chimeranext tests — run with: node --test test/ (mocked fetch, no network, no real token) */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { api, token } from "../server.js";

describe("token", () => {
  it("returns SLACK_BOT_TOKEN when set", () => {
    process.env.SLACK_BOT_TOKEN = "xoxb-test";
    assert.equal(token(), "xoxb-test");
    delete process.env.SLACK_BOT_TOKEN;
  });

  it("throws UserError when SLACK_BOT_TOKEN is missing (missing-env)", () => {
    delete process.env.SLACK_BOT_TOKEN;
    assert.throws(() => token(), /SLACK_BOT_TOKEN is not set in the server environment/);
  });
});

describe("api request build", () => {
  it("hits the Slack endpoint with method, Bearer auth header, JSON content-type, and JSON body", async () => {
    process.env.SLACK_BOT_TOKEN = "xoxb-test";
    let captured;
    const mockFetch = async (url, opts) => {
      captured = { url, opts };
      return { ok: true, json: async () => ({ ok: true, channels: [{ id: "C1", name: "general" }] }) };
    };

    const data = await api("POST", "/conversations.list", { types: "public_channel", limit: 100 }, mockFetch);

    assert.equal(captured.url, "https://slack.com/api/conversations.list");
    assert.equal(captured.opts.method, "POST");
    assert.equal(captured.opts.headers.Authorization, "Bearer xoxb-test");
    assert.equal(captured.opts.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(captured.opts.body), { types: "public_channel", limit: 100 });
    assert.equal(data.ok, true);
    delete process.env.SLACK_BOT_TOKEN;
  });

  it("sends no body when params are empty", async () => {
    process.env.SLACK_BOT_TOKEN = "xoxb-test";
    let captured;
    const mockFetch = async (url, opts) => {
      captured = { url, opts };
      return { ok: true, json: async () => ({ ok: true, members: [] }) };
    };

    await api("POST", "/users.list", {}, mockFetch);
    assert.equal(captured.opts.body, undefined);
    delete process.env.SLACK_BOT_TOKEN;
  });
});

describe("api error handling", () => {
  it("throws UserError on Slack error envelope (ok:false)", async () => {
    process.env.SLACK_BOT_TOKEN = "xoxb-test";
    const mockFetch = async () => ({ ok: true, json: async () => ({ ok: false, error: "invalid_auth" }) });
    await assert.rejects(
      api("POST", "/chat.postMessage", { channel: "C1", text: "hi" }, mockFetch),
      /Slack API error on \/chat.postMessage: invalid_auth/,
    );
    delete process.env.SLACK_BOT_TOKEN;
  });

  it("throws on non-2xx HTTP with status", async () => {
    process.env.SLACK_BOT_TOKEN = "xoxb-test";
    const mockFetch = async () => ({ ok: false, status: 429, text: async () => "rate_limited" });
    await assert.rejects(api("POST", "/conversations.list", { types: "public_channel" }, mockFetch), /429/);
    delete process.env.SLACK_BOT_TOKEN;
  });
});
