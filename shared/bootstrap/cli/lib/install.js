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
  autoUpdatePluginIndex,
  autoUpdateConfigPath,
  resolveAutoUpdatePluginSource,
} from "./paths.js";
import {
  installSkillsDirs,
  readSkills,
  missingSkills,
} from "./skills.js";
import { planMcpStep, applyMcpStep, planShellEnvStep, applyShellEnvStep } from "./mcp.js";
import { applyAgentSkillsInstall, planAgentSkillsInstall } from "./agent-skills.js";

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

function readBytesOrNull(path) {
  try {
    return readFileSync(path);
  } catch {
    return null;
  }
}

/**
 * The OpenCode **wiring** steps only (adapter copy + commands symlinks + skills
 * entries + auto-update plugin). Shared by `setup` and by the pull-driven
 * re-sync in `lib/self-update.js` — one implementation, two callers.
 */
function planBetterProfileSyncStep(repoRoot) {
  return {
    kind: "better-profile-sync",
    detail: "sync repo .opencode/agents/better.md -> ~/.config/opencode/agents/better.md",
    repoRoot,
  };
}

export function planWiringSteps(opts = {}, repoRoot = resolveRepoRoot()) {
  const configDir = resolveConfigDir(opts);
  const adapter = resolveAdapterPath(repoRoot);
  const source = readFileSync(adapter);
  const installed = readBytesOrNull(discoveryIndex(configDir));
  const steps = [];

  if (installed !== null && Buffer.compare(installed, source) === 0) {
    steps.push({ kind: "skip", detail: `discovery copy up to date (${discoveryIndex(configDir)})` });
  } else {
    steps.push({
      kind: "copy",
      detail: `copy ${adapter} -> ${discoveryIndex(configDir)}${installed ? " (overwrite stale)" : ""}`,
    });
  }

  steps.push({ kind: "commands", detail: "run setup-opencode-commands.sh (link all)" });
  const skillsStep = planSkillsStep(opts, repoRoot);
  if (skillsStep) steps.push(skillsStep);
  steps.push(planBetterProfileSyncStep(repoRoot));
  steps.push(planAutoUpdateStep(opts, repoRoot, configDir));
  return { adapter, steps };
}

export function planInstall(opts = {}) {
  const repoRoot = resolveRepoRoot();
  const { adapter, steps } = planWiringSteps(opts, repoRoot);
  steps.push(planMcpStep(opts));
  steps.push(planShellEnvStep(opts, repoRoot));
  if (opts.skills) {
    const skillsPlan = planAgentSkillsInstall(opts, repoRoot);
    steps.push(
      skillsPlan.error
        ? { kind: "manual", detail: skillsPlan.error }
        : skillsPlan,
    );
  }
  if (opts.alsoNpm) {
    for (const pkg of NPM_PACKAGES) steps.push({ kind: "npm", detail: `npx --yes ${pkg} install` });
  }
  return { repoRoot, adapter, steps };
}

/**
 * Auto-update plugin (#110): an OpenCode discovery-dir plugin that pulls the
 * clone and re-runs the wiring at startup. Default ON (the source of truth is
 * `git pull`); opt out with `--no-auto-update` or `BETTER_TOOLKITS_AUTO_UPDATE=0`.
 * The mode is persisted next to the plugin so the background run knows whether
 * this clone is consumer (`main`) or author (`--expert-mode`).
 */
export function planAutoUpdateStep(opts = {}, repoRoot = resolveRepoRoot(), configDir = resolveConfigDir(opts)) {
  if (opts.noAutoUpdate || process.env.BETTER_TOOLKITS_AUTO_UPDATE === "0") {
    return {
      kind: "skip",
      detail: "auto-update plugin disabled (--no-auto-update / BETTER_TOOLKITS_AUTO_UPDATE=0)",
    };
  }
  const source = resolveAutoUpdatePluginSource(repoRoot);
  if (!existsSync(source)) {
    return { kind: "skip", detail: `auto-update plugin source missing (${source})` };
  }
  const installed = readBytesOrNull(autoUpdatePluginIndex(configDir));
  const stale =
    installed === null || Buffer.compare(installed, readFileSync(source)) !== 0;
  return {
    kind: "auto-update",
    detail: stale
      ? `install auto-update plugin -> ${autoUpdatePluginIndex(configDir)}`
      : `auto-update plugin up to date (${autoUpdatePluginIndex(configDir)})`,
    source,
    target: autoUpdatePluginIndex(configDir),
    configTarget: autoUpdateConfigPath(configDir),
    repoRoot,
    expertMode: opts.expertMode === true,
    stale,
  };
}

function applyAutoUpdateStep(step) {
  mkdirSync(dirname(step.target), { recursive: true });
  if (step.stale) copyFileSync(step.source, step.target);
  const doc = {
    cloneRoot: step.repoRoot,
    expertMode: step.expertMode,
    branch: step.expertMode ? null : "main",
  };
  const next = `${JSON.stringify(doc, null, 2)}\n`;
  let current = null;
  try {
    current = readFileSync(step.configTarget, "utf8");
  } catch {
    current = null;
  }
  if (current !== next) writeFileSync(step.configTarget, next);
  const mode = step.expertMode ? "expert (branch per clone)" : "consumer (branch main)";
  console.log(`  done: auto-update plugin ${step.stale ? "installed" : "verified"} — ${mode}`);
}

/**
 * One `skills` entry per toolkit in opencode.json(c) — without these,
 * skills-only toolkits (e.g. venture-studio, 22 skills, 0 commands) are
 * invisible to OpenCode: skills never surface in `/` autocomplete and no
 * config entry means they don't load at all.
 */
export function planSkillsStep(opts, repoRoot) {
  const configDir = resolveConfigDir(opts);
  const wanted = installSkillsDirs(repoRoot);
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
      const configDir = resolveConfigDir(opts);
      mkdirSync(discoveryDir(configDir), { recursive: true });
      // copy, never symlink — the loader follows realpath for resolution
      copyFileSync(plan.adapter, discoveryIndex(configDir));
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
    } else if (s.kind === "better-profile-sync") {
      const script = path.join(s.repoRoot, "scripts", "ci", "sync-better-profile.sh");
      if (existsSync(script)) {
        execFileSync("bash", [script, "--quiet"], { stdio: "inherit", timeout: 60000 });
      } else {
        console.log("  warn: sync-better-profile.sh missing, skipping");
      }
    } else if (s.kind === "auto-update") {
      applyAutoUpdateStep(s);
    } else if (s.kind === "mcp") {
      applyMcpStep(s);
    } else if (s.kind === "shell-env") {
      applyShellEnvStep(s, opts);
    } else if (s.kind === "agent-skills") {
      applyAgentSkillsInstall(s, opts);
    } else if (s.kind === "npm") {
      const pkg = s.detail.match(/npx --yes (\S+) install/)[1];
      const args = ["--yes", pkg, "install"];
      if (opts.configDir) args.push("--config-dir", opts.configDir);
      if (opts.dryRun) args.push("--dry-run");
      execFileSync("npx", args, { stdio: "inherit", timeout: 300000 });
    }
  }
}
