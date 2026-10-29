// Dogfood test: verify the OpenTwinBuilder Feature Factory inbound surface works
// end-to-end through this client. Requires the OpenTwinBuilder binary to be
// built (see client.ts OTB_MCP_BIN default). Run: `npm test` / `tsx --test test/`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { callOtb, feature, Session } from "../src/client.js";

test("capability_report surfaces tools (inbound surface)", async () => {
  const raw = await callOtb("tools/list");
  const tools = (raw as { tools?: Array<{ name: string }> }).tools ?? [];
  const names = tools.map((t) => t.name);
  for (const required of ["feature_generate", "feature_test", "feature_register", "model_commit"]) {
    assert.ok(names.includes(required), `missing tool: ${required}`);
  }
});

test("feature factory: generate → test → register", async () => {
  const gen = (await feature.generate("sprocket", "feature sprocket ...")) as {
    content?: Array<{ text?: string }>;
  };
  assert.ok(JSON.parse(gen?.content?.[0]?.text ?? "{}").feature.name === "sprocket");

  const tst = (await feature.test("sprocket", "feature sprocket ...")) as {
    content?: Array<{ text?: string }>;
  };
  assert.equal(JSON.parse(tst?.content?.[0]?.text ?? "{}").ok, true);

  const reg = (await feature.register("sprocket", "feature sprocket ...")) as {
    content?: Array<{ text?: string }>;
  };
  assert.equal(JSON.parse(reg?.content?.[0]?.text ?? "{}").registered, "sprocket");
});

test("model versioning: commit + history (single session)", async () => {
  const s = await Session.open();
  try {
    const commit = (await s.callTool("model_commit", {
      branch: "main", label: "v1", message: "init",
    })) as { content?: Array<{ text?: string }> };
    assert.ok(JSON.parse(commit?.content?.[0]?.text ?? "{}").version >= 1);

    const hist = (await s.callTool("model_history", { branch: "main" })) as {
      content?: Array<{ text?: string }>;
    };
    const parsed = JSON.parse(hist?.content?.[0]?.text ?? "{}");
    assert.ok(parsed.history?.length >= 1, `history empty: ${JSON.stringify(parsed)}`);
  } finally {
    s.close();
  }
});

test("feature factory workflows through a persistent session", async () => {
  const s = await Session.open();
  try {
    const g = (await s.callTool("feature_generate", { name: "flange", code: "feature flange ..." })) as {
      content?: Array<{ text?: string }>;
    };
    assert.ok(JSON.parse(g?.content?.[0]?.text ?? "{}").feature.name === "flange");
    const t = (await s.callTool("feature_test", { name: "flange", code: "feature flange ..." })) as {
      content?: Array<{ text?: string }>;
    };
    assert.equal(JSON.parse(t?.content?.[0]?.text ?? "{}").ok, true);
    const r = (await s.callTool("feature_register", { name: "flange", code: "feature flange ..." })) as {
      content?: Array<{ text?: string }>;
    };
    assert.equal(JSON.parse(r?.content?.[0]?.text ?? "{}").registered, "flange");
  } finally {
    s.close();
  }
});
