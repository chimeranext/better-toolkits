/**
 * Install skills with the skills CLI.
 *
 * Declaration: package.json "skills" (antfu/skills-npm). An object entry is
 * `{ source, skills }` — source is the GitHub repo, skills are folder names.
 * Install: `npx skills add <source> --skill <name> --agent '*'`.
 * Every skill, every agent: `npx skills add <source> --all`.
 */
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

export const SKILLS_SOURCE = "chimeranext/better-toolkits";

export function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Skill folder names from a package.json `skills` array. Strings are whole sources. */
export function skillNamesFromField(field) {
  if (!Array.isArray(field)) {
    throw new Error('package.json: "skills" must be an array');
  }
  const names = [];
  for (const entry of field) {
    if (typeof entry === "string") continue;
    if (!entry || typeof entry !== "object" || !Array.isArray(entry.skills)) {
      throw new Error(
        'package.json: "skills" entries must be a source string or { source, skills }',
      );
    }
    if (entry.source !== SKILLS_SOURCE) {
      throw new Error(`package.json skills source must be ${SKILLS_SOURCE}`);
    }
    names.push(...entry.skills);
  }
  return [...new Set(names)].sort();
}

function packagePath(repoRoot, source) {
  const rel = String(source).replace(/^\.\//, "").replace(/\/$/, "");
  return join(repoRoot, rel, "package.json");
}

/** Marketplace plugins that declare skills, plus shared/skills. */
export function loadManifests(repoRoot) {
  const marketPath = join(repoRoot, ".claude-plugin", "marketplace.json");
  if (!existsSync(marketPath)) throw new Error(`missing ${marketPath}`);
  const market = readJson(marketPath);
  const manifests = [];
  for (const entry of market.plugins ?? []) {
    const file = packagePath(repoRoot, entry.source);
    if (!existsSync(file)) continue;
    const pkg = readJson(file);
    if (!pkg.skills) continue;
    manifests.push({
      name: entry.name,
      skills: skillNamesFromField(pkg.skills),
    });
  }
  const shared = join(repoRoot, "shared", "skills", "package.json");
  if (existsSync(shared)) {
    const pkg = readJson(shared);
    manifests.push({
      name: pkg.name,
      skills: skillNamesFromField(pkg.skills),
    });
  }
  return manifests;
}

export function selectManifests(manifests, opts = {}) {
  if (opts.all) return manifests;
  const wanted = opts.toolkits ?? [];
  if (!wanted.length) {
    return { error: "pass --all or one or more --toolkit <name>" };
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
 * argv matches the skills CLI README.
 * `--all` is `--skill '*' --agent '*' -y`. A named agent uses `--skill` + `--agent`.
 * `-g` is user scope. execFile, so `*` is not a shell glob.
 */
export function planAgentSkillsInstall(opts = {}, repoRoot) {
  const agent = opts.agent || "*";
  const globalFlag = opts.project ? [] : ["-g"];
  if (opts.all && agent === "*") {
    const argv = ["npx", "--yes", "skills", "add", SKILLS_SOURCE, "--all", ...globalFlag];
    return {
      kind: "agent-skills",
      argv,
      skills: ["*"],
      toolkits: [],
      detail: `npx skills add ${SKILLS_SOURCE} --all${opts.project ? "" : " -g"}`,
    };
  }
  let manifests;
  try {
    manifests = loadManifests(repoRoot);
  } catch (err) {
    return { error: String(err?.message ?? err) };
  }
  const selected = opts.all ? manifests : selectManifests(manifests, opts);
  if (!Array.isArray(selected)) return selected;
  const skills = opts.all ? ["*"] : skillNames(selected);
  if (!skills.length) {
    return { error: `no skills declared for ${selected.map((m) => m.name).join(", ")}` };
  }
  const skillArgs = skills.flatMap((name) => ["--skill", name]);
  const argv = [
    "npx",
    "--yes",
    "skills",
    "add",
    SKILLS_SOURCE,
    ...skillArgs,
    "--agent",
    agent,
    "-y",
    ...globalFlag,
  ];
  const label = opts.all ? "all toolkits" : selected.map((m) => m.name).join(", ");
  return {
    kind: "agent-skills",
    argv,
    skills,
    toolkits: selected.map((m) => m.name),
    detail: `npx skills add ${SKILLS_SOURCE} ${skills.length} skill(s) from ${label} --agent ${agent}${opts.project ? "" : " -g"}`,
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
