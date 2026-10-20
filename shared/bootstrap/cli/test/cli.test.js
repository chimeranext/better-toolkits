/** Phase B CLI tests — run with: node --test test/ */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
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
  installSkillsDirs,
  missingSkills,
} from "../lib/skills.js";
import { canonicalServers, planMcpStep, whichBin } from "../lib/mcp.js";
import {
  ENV_FILE_NAME,
  SECRET_NAME,
  applyShellEnvStep,
  planShellEnvStep,
  shellEnvStatus,
  shellSourceLine,
  userEnvFile,
} from "../lib/mcp.js";
import {
  isRepoRoot,
  osKind,
  dataDir,
  candidateCloneParents,
  findClone,
  planPull,
  applyPull,
} from "../lib/clone.js";
import { resolveHarnesses, onPath, withUpdateLock } from "../lib/self-update.js";
import { planAutoUpdateToggle, applyAutoUpdateToggle } from "../lib/auto-update.js";
import { planAgentSkillsInstall, SKILLS_SOURCE } from "../lib/agent-skills.js";

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
  it("defines exactly the canonical 7 servers", () => {
    const names = Object.keys(canonicalServers({}));
    assert.deepEqual(names.sort(), ["chrome-devtools-mcp", "context7", "dart", "linear", "notion", "slack", "stitch"].sort());
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
  it("finds toolkit skills dirs in the real repo", () => {
    const dirs = toolkitSkillsDirs(REAL_ROOT);
    assert.equal(dirs.length, 12);
    assert.ok(dirs.some((d) => d.endsWith("venture-studio-toolkit/skills")));
  });

  it("installSkillsDirs includes shared/skills (transversal)", () => {
    const dirs = installSkillsDirs(REAL_ROOT);
    assert.equal(dirs.length, 13);
    assert.ok(dirs.some((d) => d.endsWith("shared/skills")));
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

describe("node path autodetect (#54)", () => {
  function fakeBinDir() {
    const dir = mkdtempSync(join(tmpdir(), "bt-bindir-"));
    writeFileSync(join(dir, "npx"), "#!/bin/sh\n");
    return dir;
  }

  it("whichBin finds binaries on the given PATH", () => {
    const dir = fakeBinDir();
    assert.equal(whichBin("npx", "FALLBACK", dir), join(dir, "npx"));
  });

  it("whichBin falls back when absent or PATH empty", () => {
    const dir = fakeBinDir();
    assert.equal(whichBin("missing-tool", "FALLBACK", dir), "FALLBACK");
    assert.equal(whichBin("npx", "FALLBACK", ""), "FALLBACK");
    assert.equal(whichBin("npx", "FALLBACK", null), "FALLBACK");
  });

  it("canonicalServers prefers PATH binaries, keeps explicit overrides", () => {
    const dir = fakeBinDir();
    const wanted = canonicalServers({ pathEnv: dir });
    assert.equal(wanted["chrome-devtools-mcp"].command[0], join(dir, "npx"));
    assert.ok(wanted["chrome-devtools-mcp"].environment.PATH.startsWith(`${dir}:`));
    const custom = canonicalServers({ nodeBin: "/custom/npx" });
    assert.equal(custom["chrome-devtools-mcp"].command[0], "/custom/npx");
  });
});

describe("clone resolution + pull planning (#110)", () => {
  function git(cwd, args) {
    return execFileSync("git", ["-C", cwd, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  }

  function makeRepo() {
    const base = mkdtempSync(join(tmpdir(), "bt-clone-"));
    const origin = join(base, "origin.git");
    const work = join(base, "work");
    execFileSync("git", ["init", "--bare", origin], { stdio: "ignore" });
    execFileSync("git", ["init", "-b", "main", work], { stdio: "ignore" });
    git(work, ["remote", "add", "origin", origin]);
    // Repo markers so isRepoRoot() accepts the fixture as a monorepo clone.
    mkdirSync(join(work, ".claude-plugin"), { recursive: true });
    writeFileSync(join(work, ".claude-plugin", "marketplace.json"), "{}");
    mkdirSync(join(work, "toolkits"), { recursive: true });
    writeFileSync(join(work, "README.md"), "one\n");
    git(work, ["add", "."]);
    git(work, ["-c", "user.email=t@t", "-c", "user.name=t", "commit", "-m", "one"]);
    git(work, ["push", "-u", "origin", "main"]);
    return { base, origin, work };
  }

  it("isRepoRoot requires marketplace.json + toolkits/", () => {
    const dir = fakeRoot();
    assert.equal(isRepoRoot(dir), true);
    assert.equal(isRepoRoot(join(tmpdir(), "nope")), false);
  });

  it("osKind classifies platforms and WSL", () => {
    assert.equal(osKind("win32"), "windows");
    assert.equal(osKind("darwin"), "macos");
    assert.equal(osKind("linux", {}), "linux");
    assert.equal(osKind("linux", { WSL_DISTRO_NAME: "Ubuntu" }), "wsl");
  });

  it("dataDir is OS-appropriate", () => {
    const home = "/home/u";
    assert.equal(dataDir({ platform: "linux", env: {}, home }), "/home/u/.local/share/better-toolkits");
    assert.equal(dataDir({ platform: "darwin", env: {}, home }), "/home/u/Library/Application Support/better-toolkits");
    assert.equal(dataDir({ platform: "win32", env: { LOCALAPPDATA: "C:/l" }, home }), "C:/l/better-toolkits");
    assert.equal(dataDir({ platform: "linux", env: { XDG_DATA_HOME: "/x" }, home }), "/x/better-toolkits");
  });

  it("candidateCloneParents covers GitHub default roots", () => {
    const parents = candidateCloneParents({ platform: "linux", env: {}, home: "/home/u" });
    assert.ok(parents.includes("/home/u/Documents/GitHub"));
    assert.ok(parents.includes("/home/u/Documentos/GitHub"));
  });

  it("findClone finds a clone under a GitHub root", () => {
    const home = mkdtempSync(join(tmpdir(), "bt-home-"));
    const clone = join(home, "Documents", "GitHub", "chimeranext", "better-toolkits");
    mkdirSync(join(clone, ".claude-plugin"), { recursive: true });
    writeFileSync(join(clone, ".claude-plugin", "marketplace.json"), "{}");
    mkdirSync(join(clone, "toolkits"), { recursive: true });
    const neutral = join(home, "Documents");
    assert.equal(findClone({ env: {}, home, platform: "linux", cwd: neutral }), clone);
    assert.equal(findClone({ explicit: clone, env: {}, home, platform: "linux", cwd: neutral }), clone);
  });

  it("planPull: consumer converges on main, expert keeps the branch", () => {
    const { work } = makeRepo();
    assert.equal(planPull({ cloneRoot: work }).action, "pull");

    git(work, ["checkout", "-b", "feat"]);
    assert.deepEqual(
      { action: planPull({ cloneRoot: work }).action, branch: planPull({ cloneRoot: work }).branch },
      { action: "switch-and-pull", branch: "main" },
    );
    assert.deepEqual(
      { action: planPull({ cloneRoot: work, expertMode: true }).action, branch: planPull({ cloneRoot: work, expertMode: true }).branch },
      { action: "pull", branch: "feat" },
    );
  });

  it("planPull skips a dirty tree instead of touching it", () => {
    const { work } = makeRepo();
    writeFileSync(join(work, "README.md"), "dirty\n");
    const plan = planPull({ cloneRoot: work });
    assert.equal(plan.action, "skip");
    assert.equal(plan.dirty, true);
  });

  it("applyPull fast-forwards and reports the change", () => {
    const { work } = makeRepo();
    writeFileSync(join(work, "README.md"), "two\n");
    git(work, ["add", "."]);
    git(work, ["-c", "user.email=t@t", "-c", "user.name=t", "commit", "-m", "two"]);
    git(work, ["push", "origin", "main"]);
    git(work, ["reset", "--hard", "HEAD~1"]);

    const plan = planPull({ cloneRoot: work });
    const r = applyPull(plan, { cloneRoot: work });
    assert.equal(r.ok, true);
    assert.equal(r.changed, true);
    assert.match(r.detail, /main: \w{7} → \w{7}/);
  });

  it("applyPull refuses to fast-forward a diverged clone", () => {
    const { base, origin, work } = makeRepo();
    // Divergence: work advances with "local", a second clone advances origin
    // with "upstream" — neither is an ancestor of the other.
    writeFileSync(join(work, "README.md"), "local\n");
    git(work, ["add", "."]);
    git(work, ["-c", "user.email=t@t", "-c", "user.name=t", "commit", "-m", "local"]);

    const other = join(base, "other");
    execFileSync("git", ["clone", origin, other], { stdio: "ignore" });
    writeFileSync(join(other, "README.md"), "upstream\n");
    git(other, ["add", "."]);
    git(other, ["-c", "user.email=t@t", "-c", "user.name=t", "commit", "-m", "upstream"]);
    git(other, ["push", "origin", "main"]);

    const r = applyPull(planPull({ cloneRoot: work }), { cloneRoot: work });
    assert.equal(r.ok, false);
    assert.match(r.detail, /cannot fast-forward/);
  });
});

describe("self-update harness resolution (#110)", () => {
  it("resolveHarnesses accepts all|opencode|cursor|csv", () => {
    assert.deepEqual(resolveHarnesses("all"), ["opencode", "cursor"]);
    assert.deepEqual(resolveHarnesses("opencode"), ["opencode"]);
    assert.deepEqual(resolveHarnesses("cursor,opencode"), ["cursor", "opencode"]);
    assert.throws(() => resolveHarnesses("nope"), /unknown harness/);
  });

  it("onPath finds binaries without a shell", () => {
    const dir = mkdtempSync(join(tmpdir(), "bt-path-"));
    writeFileSync(join(dir, "agent"), "#!/bin/sh\n");
    assert.equal(onPath("agent", { PATH: dir }), join(dir, "agent"));
    assert.equal(onPath("missing", { PATH: dir }), null);
  });

  it("withUpdateLock runs once and releases", () => {
    const dir = mkdtempSync(join(tmpdir(), "bt-lock-"));
    const lock = join(dir, "l.lock");
    let n = 0;
    const out = withUpdateLock(() => { n += 1; return "ran"; }, { lockPath: lock });
    assert.equal(out, "ran");
    assert.equal(n, 1);
    assert.equal(existsSync(lock), false);
  });
});

describe("auto-update enable/disable (#110)", () => {
  it("plans and applies enable then disable (idempotent)", () => {
    const home = mkdtempSync(join(tmpdir(), "bt-au-"));
    const configDir = join(home, "cfg", "opencode");
    mkdirSync(configDir, { recursive: true });
    const opts = { configDir };

    const en = planAutoUpdateToggle("enable", opts);
    assert.equal(en.ok, true);
    assert.equal(en.action, "enable");
    const r1 = applyAutoUpdateToggle(en, opts);
    assert.equal(r1.ok, true);
    assert.ok(existsSync(en.target));

    const en2 = planAutoUpdateToggle("enable", opts);
    assert.match(en2.detail, /refresh auto-update plugin/);
    applyAutoUpdateToggle(en2, opts);

    const dis = planAutoUpdateToggle("disable", opts);
    assert.equal(dis.ok, true);
    const r2 = applyAutoUpdateToggle(dis, opts);
    assert.equal(r2.ok, true);
    assert.equal(existsSync(dis.target), false);

    const dis2 = planAutoUpdateToggle("disable", opts);
    assert.match(dis2.detail, /not installed/);
  });

  it("refuses a config dir that is not opencode", () => {
    assert.throws(() => planAutoUpdateToggle("enable", { configDir: "/tmp/evil" }), /not an opencode config dir/);
  });

  it("rejects an unknown action", () => {
    assert.throws(() => planAutoUpdateToggle("nope", { configDir: "/tmp/x/opencode" }), /unknown action/);
  });
});

describe("agent skills install", () => {
  function catalogRoot() {
    const dir = fakeRoot();
    const plugin = join(dir, "toolkits", "example");
    mkdirSync(join(plugin, ".claude-plugin"), { recursive: true });
    writeFileSync(
      join(dir, ".claude-plugin", "marketplace.json"),
      JSON.stringify({
        plugins: [{ name: "example", version: "1.0.0", source: "./toolkits/example" }],
      }),
    );
    writeFileSync(
      join(plugin, "package.json"),
      JSON.stringify({
        name: "example",
        skills: [
          {
            source: SKILLS_SOURCE,
            skills: ["merge-advisor", "implement-advisor"],
          },
        ],
      }),
    );
    mkdirSync(join(dir, "shared", "skills"), { recursive: true });
    writeFileSync(
      join(dir, "shared", "skills", "package.json"),
      JSON.stringify({
        name: "@chimeranext/better-toolkits-shared",
        skills: [{ source: SKILLS_SOURCE, skills: ["requirements-authoring"] }],
      }),
    );
    return dir;
  }

  it("plans one skills add for the named toolkit", () => {
    const plan = planAgentSkillsInstall(
      { toolkits: ["example"], agent: "cursor" },
      catalogRoot(),
    );
    assert.equal(plan.error, undefined);
    assert.deepEqual(plan.skills, ["implement-advisor", "merge-advisor"]);
    assert.equal(plan.argv[0], "npx");
    assert.ok(plan.argv.includes(SKILLS_SOURCE));
    assert.equal(plan.argv[plan.argv.indexOf("--agent") + 1], "cursor");
    assert.ok(plan.argv.includes("-g"));
    assert.equal(plan.argv.includes("requirements-authoring"), false);
  });

  it("refuses a selection that names no toolkit", () => {
    const plan = planAgentSkillsInstall({}, catalogRoot());
    assert.match(plan.error, /pass --all or/);
  });

  it("--all is the skills CLI shorthand and skips -g when --project", () => {
    const plan = planAgentSkillsInstall({ all: true, project: true }, catalogRoot());
    assert.ok(plan.argv.includes("--all"));
    assert.equal(plan.argv.includes("-g"), false);
    assert.equal(plan.argv.includes("--skill"), false);
  });

  it("a named agent with --all passes --skill *", () => {
    const plan = planAgentSkillsInstall({ all: true, agent: "cursor" }, catalogRoot());
    assert.equal(plan.argv[plan.argv.indexOf("--skill") + 1], "*");
    assert.equal(plan.argv[plan.argv.indexOf("--agent") + 1], "cursor");
    assert.ok(plan.argv.includes("-g"));
  });
});
