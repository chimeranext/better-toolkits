/** Phase B CLI tests — run with: node --test test/ */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  resolveRepoRoot,
  resolveAdapterPath,
  resolveConfigDir,
} from "../lib/paths.js";
import { planInstall } from "../lib/install.js";
import {
  toolkitSkillsDirs,
  missingSkills,
} from "../lib/skills.js";
import { canonicalServers, planMcpStep } from "../lib/mcp.js";
import {
  ENV_FILE_NAME,
  SECRET_NAME,
  applyShellEnvStep,
  planShellEnvStep,
  shellEnvStatus,
  shellSourceLine,
  userEnvFile,
} from "../lib/mcp.js";

const REAL_ROOT = resolveRepoRoot();

function fakeRoot() {
  const dir = mkdtempSync(join(tmpdir(), "bt-root-"));
  mkdirSync(join(dir, ".claude-plugin"), { recursive: true });
  writeFileSync(join(dir, ".claude-plugin", "marketplace.json"), "{}");
  mkdirSync(join(dir, "toolkits"), { recursive: true });
  return dir;
}

describe("paths", () => {
  it("resolves the real repo root from inside the repo", () => {
    assert.equal(resolveRepoRoot(REAL_ROOT), REAL_ROOT);
  });

  it("resolves the canonical adapter in the real repo", () => {
    const p = resolveAdapterPath(REAL_ROOT);
    assert.match(p, /opencode-plugin\.ts$/);
  });

  it("throws when no adapter exists", () => {
    const dir = fakeRoot();
    assert.throws(() => resolveAdapterPath(dir), /not found/);
  });

  it("resolves config dir: flag > project > env > home", () => {
    assert.equal(
      resolveConfigDir({ configDir: "/tmp/x" }),
      join("/tmp", "x"),
    );
    assert.equal(resolveConfigDir({ project: true }), process.cwd());
  });
});

describe("install plan", () => {
  it("plans copy + commands on a repo with adapter", () => {
    const cwd = process.cwd();
    process.chdir(REAL_ROOT);
    try {
      const plan = planInstall({});
      const kinds = plan.steps.map((s) => s.kind);
      assert.ok(kinds.includes("commands"));
      assert.ok(kinds.includes("copy") || kinds.includes("skip"));
    } finally {
      process.chdir(cwd);
    }
  });

  it("adds npm steps with --also-npm", () => {
    const cwd = process.cwd();
    process.chdir(REAL_ROOT);
    try {
      const plan = planInstall({ alsoNpm: true });
      const npm = plan.steps.filter((s) => s.kind === "npm");
      assert.equal(npm.length, 4);
    } finally {
      process.chdir(cwd);
    }
  });
});

describe("mcp phase", () => {
  it("defines exactly the canonical 6 servers", () => {
    const names = Object.keys(canonicalServers({}));
    assert.deepEqual(names.sort(), ["chrome-devtools-mcp", "context7", "dart", "linear", "slack", "stitch"].sort());
  });

  it("never embeds secrets in clear", () => {
    const raw = JSON.stringify(canonicalServers({ slackClientId: "1.2" }));
    assert.ok(raw.includes("{env:SLACK_MCP_CLIENT_SECRET}"));
  });

  it("plan detects missing servers", () => {
    const cwd = process.cwd();
    process.chdir(REAL_ROOT);
    try {
      const plan = planInstall({});
      assert.ok(plan.steps.some((s) => s.kind === "mcp" || s.kind === "skip"));
    } finally {
      process.chdir(cwd);
    }
  });
});

describe("skills wiring", () => {
  it("finds all ten toolkit skills dirs in the real repo", () => {
    const dirs = toolkitSkillsDirs(REAL_ROOT);
    assert.equal(dirs.length, 10);
    assert.ok(dirs.some((d) => d.endsWith("venture-studio-toolkit/skills")));
  });

  it("missingSkills detects unwired dirs", () => {
    assert.deepEqual(missingSkills(null, ["a", "b"]), ["a", "b"]);
    assert.deepEqual(missingSkills(["a"], ["a", "b"]), ["b"]);
    assert.deepEqual(missingSkills(["a", "b"], ["a", "b"]), []);
  });

  it("plan includes a skills step", () => {
    const cwd = process.cwd();
    process.chdir(REAL_ROOT);
    try {
      const plan = planInstall({});
      assert.ok(plan.steps.some((s) => s.kind === "skills" || s.kind === "skip"));
    } finally {
      process.chdir(cwd);
    }
  });
});

describe("shell env sourcing (#52)", () => {
  function fakeHome({ bashrc = true, zshrc = false, sourced = false, envFile = false, secret = false } = {}) {
    const home = mkdtempSync(join(tmpdir(), "bt-home-"));
    if (bashrc) {
      writeFileSync(
        join(home, ".bashrc"),
        sourced ? `# test\n[ -f "/x/${ENV_FILE_NAME}" ] && source "/x/${ENV_FILE_NAME}"\n` : "# test\n",
      );
    }
    if (zshrc) writeFileSync(join(home, ".zshrc"), "# test\n");
    const env = secret ? { [SECRET_NAME]: "s3cr3t" } : {};
    if (envFile) {
      mkdirSync(join(home, ".config", "opencode"), { recursive: true });
      writeFileSync(join(home, ".config", "opencode", ENV_FILE_NAME), "export S=1\n");
    }
    return { home, env };
  }

  it("source line points at the user env file", () => {
    const { home } = fakeHome();
    const expected = `[ -f "${userEnvFile(home)}" ] && source "${userEnvFile(home)}"`;
    assert.equal(shellSourceLine(userEnvFile(home)), expected);
  });

  it("plan skips when rc files already source the env file", () => {
    const { home, env } = fakeHome({ sourced: true });
    assert.equal(planShellEnvStep({ home, env }).kind, "skip");
  });

  it("plan proposes shell-env for unsourced rc files", () => {
    const { home, env } = fakeHome({ zshrc: true });
    const step = planShellEnvStep({ home, env });
    assert.equal(step.kind, "shell-env");
    assert.ok(step.detail.includes(".bashrc") && step.detail.includes(".zshrc"));
  });

  it("apply appends once and never creates missing rc files", () => {
    const { readFileSync, existsSync } = process.getBuiltinModule("node:fs");
    const { home, env } = fakeHome();
    applyShellEnvStep(planShellEnvStep({ home, env }), { home, env, interactive: false });
    applyShellEnvStep(planShellEnvStep({ home, env }), { home, env, interactive: false });
    const content = readFileSync(join(home, ".bashrc"), "utf8");
    assert.equal(content.split(ENV_FILE_NAME).length - 1, 2); // comment + source line
    assert.equal(existsSync(join(home, ".zshrc")), false);
  });

  it("apply prompts for the secret when interactive (stub script, no real prompt)", () => {
    const { existsSync } = process.getBuiltinModule("node:fs");
    const { home, env } = fakeHome();
    const marker = join(home, "prompt-ran");
    const stub = join(home, "stub-slack-setup.sh");
    writeFileSync(stub, `#!/usr/bin/env bash\necho ran > ${marker}\n`);
    const logs = [];
    const origLog = console.log;
    console.log = (m) => logs.push(String(m));
    try {
      applyShellEnvStep(planShellEnvStep({ home, env }, null), { home, env, interactive: true, slackScript: stub });
    } finally {
      console.log = origLog;
    }
    assert.equal(existsSync(marker), true); // stub ran instead of printing next-steps
    assert.ok(logs.some((l) => l.includes("opencode mcp logout slack")));
    assert.ok(logs.some((l) => l.includes("opencode service restart")));
  });

  it("status reports secret presence from the environment", () => {
    const full = shellEnvStatus({ ...fakeHome({ sourced: true, envFile: true, secret: true }) });
    assert.equal(full.secretSet, true);
    assert.equal(full.envFileExists, true);
    assert.deepEqual(full.unsourced, []);
    const empty = shellEnvStatus(fakeHome({ sourced: true, envFile: true }));
    assert.equal(empty.secretSet, false);
  });

  it("install plan includes the shell-env step", () => {
    const cwd = process.cwd();
    process.chdir(REAL_ROOT);
    try {
      const plan = planInstall({});
      assert.ok(plan.steps.some((s) => s.kind === "shell-env" || s.kind === "skip"));
    } finally {
      process.chdir(cwd);
    }
  });
});
