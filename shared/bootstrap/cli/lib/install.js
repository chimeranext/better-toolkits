/** Install phase: copy adapter (idempotent) + wire commands + skills + optional npm. */
import { existsSync, mkdirSync, readFileSync, copyFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import {
  resolveRepoRoot,
  resolveAdapterPath,
  resolveConfigDir,
  discoveryDir,
  discoveryIndex,
  commandsScript,
} from "./paths.js";
import {
  toolkitSkillsDirs,
  readSkills,
  missingSkills,
} from "./skills.js";

/**
 * Optional npm CLIs (--also-npm), published under the @chimeranext scope.
 * (The old @lapc506 scope is legacy — historical references to the
 * deprecated `npx @lapc506/make-no-mistakes install` stay frozen in
 * CHANGELOGs and protocol docs.)
 */
export const NPM_PACKAGES = [
  "@chimeranext/make-no-mistakes",
  "@chimeranext/atomic-design-toolkit",
  "@chimeranext/business-model-toolkit",
  "@chimeranext/app-gtm-release-toolkit",
];

export function planInstall(opts = {}) {
  const repoRoot = resolveRepoRoot();
  const adapter = resolveAdapterPath(repoRoot);
  const source = readFileSync(adapter);
  let installed = null;
  try {
    installed = readFileSync(discoveryIndex());
  } catch {
    installed = null;
  }
  const steps = [];
  if (installed !== null && Buffer.compare(installed, source) === 0) {
    steps.push({ kind: "skip", detail: `discovery copy up to date (${discoveryIndex()})` });
  } else {
    steps.push({
      kind: "copy",
      detail: `copy ${adapter} -> ${discoveryIndex()}${installed ? " (overwrite stale)" : ""}`,
    });
  }
  steps.push({ kind: "commands", detail: "run setup-opencode-commands.sh (link all)" });
  const skillsStep = planSkillsStep(opts, repoRoot);
  if (skillsStep) steps.push(skillsStep);
  if (opts.alsoNpm) {
    for (const pkg of NPM_PACKAGES) steps.push({ kind: "npm", detail: `npx --yes ${pkg} install` });
  }
  return { repoRoot, adapter, steps };
}

/**
 * One `skills` entry per toolkit in opencode.json(c) — without these,
 * skills-only toolkits (e.g. venture-studio, 22 skills, 0 commands) are
 * invisible to OpenCode: skills never surface in `/` autocomplete and no
 * config entry means they don't load at all.
 */
export function planSkillsStep(opts, repoRoot) {
  const configDir = resolveConfigDir(opts);
  const wanted = toolkitSkillsDirs(repoRoot);
  if (!wanted.length) return null;
  const current = readSkills(configDir);
  if (current.unparseable) {
    return {
      kind: "manual",
      detail: `${current.file} has comments (jsonc) — add "skills" entries by hand: ${wanted.join(", ")}`,
    };
  }
  const missing = missingSkills(current.skills, wanted);
  if (!missing.length) {
    return { kind: "skip", detail: `skills entries up to date in ${current.file}` };
  }
  const target = current.file ?? join(configDir, "opencode.json");
  return {
    kind: "skills",
    detail: `${current.file ? "merge" : "create"} ${missing.length} skills entries in ${target}`,
    target,
    missing,
  };
}

function applySkillsStep(step) {
  mkdirSync(dirname(step.target), { recursive: true });
  let doc = {};
  try {
    doc = JSON.parse(readFileSync(step.target, "utf8"));
  } catch {
    doc = {};
  }
  if (!doc.$schema) doc.$schema = "https://opencode.ai/config.json";
  const have = new Set(Array.isArray(doc.skills) ? doc.skills : []);
  for (const m of step.missing) have.add(m);
  doc.skills = [...have].sort();
  writeFileSync(step.target, `${JSON.stringify(doc, null, 2)}\n`);
  console.log(`  done: ${step.detail}`);
}

export function applyInstall(plan, opts = {}) {
  const dry = opts.dryRun === true;
  for (const s of plan.steps) {
    if (s.kind === "skip") {
      console.log(`  skip: ${s.detail}`);
      continue;
    }
    if (s.kind === "manual") {
      console.log(`  manual: ${s.detail}`);
      continue;
    }
    if (dry) {
      console.log(`  would: ${s.detail}`);
      continue;
    }
    if (s.kind === "copy") {
      mkdirSync(discoveryDir(), { recursive: true });
      // copy, never symlink — the loader follows realpath for resolution
      copyFileSync(plan.adapter, discoveryIndex());
      console.log(`  done: ${s.detail}`);
    } else if (s.kind === "commands") {
      const script = commandsScript(plan.repoRoot);
      if (!existsSync(script)) {
        console.log("  warn: commands script missing, skipping");
        continue;
      }
      execFileSync("bash", [script], { stdio: "inherit", timeout: 120000 });
    } else if (s.kind === "skills") {
      applySkillsStep(s);
    } else if (s.kind === "npm") {
      const pkg = s.detail.match(/npx --yes (\S+) install/)[1];
      const args = ["--yes", pkg, "install"];
      if (opts.configDir) args.push("--config-dir", opts.configDir);
      if (opts.dryRun) args.push("--dry-run");
      execFileSync("npx", args, { stdio: "inherit", timeout: 300000 });
    }
  }
}
