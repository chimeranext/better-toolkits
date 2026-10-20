/**
 * Install a toolkit's skills for any agent via the skills CLI.
 *
 * Catalog SSOT is each plugin's toolkit.json (plus shared/skills/toolkit.json).
 * Claude marketplace plugins and Cursor's "Added" list are adapters of that tree.
 */
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

export function readManifestFile(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Marketplace plugins, then the transversal shared/skills catalog when present. */
export function loadManifests(repoRoot) {
  const marketPath = join(repoRoot, ".claude-plugin", "marketplace.json");
  if (!existsSync(marketPath)) {
    throw new Error(`missing ${marketPath}`);
  }
  const market = readManifestFile(marketPath);
  const manifests = [];
  for (const entry of market.plugins ?? []) {
    const rel = String(entry.source ?? "").replace(/^\.\//, "").replace(/\/$/, "");
    const file = join(repoRoot, rel, "toolkit.json");
    if (!existsSync(file)) {
      throw new Error(
        `missing ${file}; run python3 scripts/ci/sync_toolkit_manifests.py write`,
      );
    }
    manifests.push(readManifestFile(file));
  }
  const shared = join(repoRoot, "shared", "skills", "toolkit.json");
  if (existsSync(shared)) manifests.push(readManifestFile(shared));
  return manifests;
}

export function selectManifests(manifests, opts = {}) {
  if (opts.all) return manifests;
  const wanted = opts.toolkits ?? [];
  if (!wanted.length) {
    return {
      error: "pass --all or one or more --toolkit <name> (see toolkit.json name)",
    };
  }
  const byName = new Map(manifests.map((m) => [m.name, m]));
  const selected = [];
  const missing = [];
  for (const name of wanted) {
    const hit = byName.get(name);
    if (!hit) missing.push(name);
    else selected.push(hit);
  }
  if (missing.length) {
    const known = [...byName.keys()].sort().join(", ");
    return { error: `unknown toolkit(s): ${missing.join(", ")}. known: ${known}` };
  }
  return selected;
}

export function skillNames(manifests) {
  const names = new Set();
  for (const manifest of manifests) {
    for (const name of manifest.skills ?? []) names.add(name);
  }
  return [...names].sort();
}

/**
 * argv for `npx skills add <repo> --skill … --agent <agent>`.
 * Global (`-g`) unless opts.project. execFile (no shell), so `*` is literal.
 */
export function planAgentSkillsInstall(opts = {}, repoRoot) {
  let manifests;
  try {
    manifests = loadManifests(repoRoot);
  } catch (err) {
    return { error: String(err?.message ?? err) };
  }
  const selected = selectManifests(manifests, opts);
  if (!Array.isArray(selected)) return selected;
  const skills = skillNames(selected);
  if (!skills.length) {
    return {
      error: `no skills in ${selected.map((m) => m.name).join(", ")}`,
    };
  }
  const agent = opts.agent || "*";
  const argv = [
    "npx",
    "--yes",
    "skills",
    "add",
    repoRoot,
    "--skill",
    ...skills,
    "--agent",
    agent,
    "-y",
  ];
  if (!opts.project) argv.push("-g");
  const label = selected.map((m) => m.name).join(", ");
  return {
    kind: "agent-skills",
    argv,
    skills,
    toolkits: selected.map((m) => m.name),
    detail: `npx skills add ${skills.length} skill(s) from ${label} --agent ${agent}${opts.project ? "" : " -g"}`,
  };
}

export function applyAgentSkillsInstall(plan, opts = {}) {
  if (plan.error) {
    console.error(`ERROR: ${plan.error}`);
    return false;
  }
  if (opts.dryRun) {
    console.log(`  would: ${plan.argv.join(" ")}`);
    return true;
  }
  execFileSync(plan.argv[0], plan.argv.slice(1), {
    stdio: "inherit",
    timeout: 300000,
  });
  console.log(`  done: ${plan.detail}`);
  return true;
}

/** Names a consumer can pass to --toolkit. */
export function listToolkitNames(repoRoot) {
  return loadManifests(repoRoot).map((m) => m.name);
}
