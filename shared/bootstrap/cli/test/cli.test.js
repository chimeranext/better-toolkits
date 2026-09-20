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
