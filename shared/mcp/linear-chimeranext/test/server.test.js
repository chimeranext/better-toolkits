/** linear-chimeranext tests — run with: node --test test/ (mocked fetch, no network, no token) */
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { requireEnv, gql, mapIssue, QUERIES } from "../server.js";

const API = "https://api.linear.app/graphql";
const FAKE_KEY = "lin_api_testdummykey123";

/** Return a fetch mock that captures the request and answers with a given body. */
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

describe("requireEnv", () => {
  afterEach(() => {
    delete process.env.LINEAR_API_KEY;
  });
  it("returns the var when set", () => {
    process.env.LINEAR_API_KEY = FAKE_KEY;
    assert.equal(requireEnv("LINEAR_API_KEY"), FAKE_KEY);
  });
  it("throws a UserError naming the missing var", () => {
    delete process.env.LINEAR_API_KEY;
    assert.throws(() => requireEnv("LINEAR_API_KEY"), /LINEAR_API_KEY is not set/);
  });
});

describe("gql — request build + auth header", () => {
  beforeEach(() => {
    process.env.LINEAR_API_KEY = FAKE_KEY;
  });
  afterEach(() => {
    delete process.env.LINEAR_API_KEY;
  });

  it("POSTs to https://api.linear.app/graphql with the API key verbatim in Authorization", async () => {
    const fetchFn = captureFetch({ data: { teams: { nodes: [] } } });
    const data = await gql(QUERIES.teams, {}, { fetchFn });

    assert.equal(fetchFn.calls.length, 1);
    const { url, init } = fetchFn.calls[0];
    assert.equal(url, API);
    assert.equal(init.method, "POST");
    assert.equal(init.headers.Authorization, FAKE_KEY, "personal API key goes verbatim, no Bearer prefix");
    assert.equal(init.headers["Content-Type"], "application/json");

    const sent = JSON.parse(init.body);
    assert.equal(sent.query, QUERIES.teams);
    assert.deepEqual(sent.variables, {});
    assert.deepEqual(data, { teams: { nodes: [] } });
  });

  it("passes variables for parameterized queries/mutations", async () => {
    const fetchFn = captureFetch({ data: { issueCreate: { success: true, issue: { id: "i1" } } } });
    const variables = { input: { teamId: "t1", title: "hi" } };
    await gql(QUERIES.issueCreate, variables, { fetchFn });
    const sent = JSON.parse(fetchFn.calls[0].init.body);
    assert.equal(sent.query, QUERIES.issueCreate);
    assert.deepEqual(sent.variables, variables);
  });

  it("throws a UserError naming LINEAR_API_KEY when it is missing, with no network call", async () => {
    delete process.env.LINEAR_API_KEY;
    const fetchFn = captureFetch({});
    await assert.rejects(gql(QUERIES.teams, {}, { fetchFn }), /LINEAR_API_KEY is not set/);
    assert.equal(fetchFn.calls.length, 0, "no network call should be attempted without a key");
  });

  it("throws a UserError on a GraphQL errors envelope (HTTP 200)", async () => {
    const fetchFn = captureFetch({ errors: [{ message: "Access denied" }] });
    await assert.rejects(gql(QUERIES.teams, {}, { fetchFn }), /Linear GraphQL error: Access denied/);
  });
});

describe("mapIssue", () => {
  it("normalizes a raw Linear issue node", () => {
    const node = {
      id: "i1",
      identifier: "ENG-123",
      title: "Fix bug",
      description: "desc",
      url: "https://linear.app/team/issue/ENG-123",
      number: 123,
      priority: 2,
      estimate: 3,
      dueDate: "2026-11-01",
      state: { id: "s1", name: "In Progress", type: "started" },
      assignee: { id: "u1", name: "Ada" },
      creator: { id: "u2", name: "Bob" },
      team: { id: "t1", key: "ENG", name: "Engineering" },
      project: { id: "p1", name: "Core" },
      labels: { nodes: [{ id: "l1", name: "bug", color: "#ff0000" }] },
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-02-01T00:00:00Z",
    };
    const m = mapIssue(node);
    assert.equal(m.identifier, "ENG-123");
    assert.equal(m.state.name, "In Progress");
    assert.equal(m.team.key, "ENG");
    assert.equal(m.assignee.name, "Ada");
    assert.deepEqual(m.labels, [{ id: "l1", name: "bug", color: "#ff0000" }]);
  });

  it("returns null for null input", () => {
    assert.equal(mapIssue(null), null);
  });
});
