// Build-time generator: produce the OpenCode HTTP skills catalog (index.json).
// Source of truth: the on-disk skill folders (shared/skills + toolkits/*/skills).
// The catalog is served at <site>/opencode/skills/index.json; each entry is
// downloaded by OpenCode from <base-url>/<name>/<file> and becomes a skill root.
//
// ID rule (OpenCode): the path defines the ID. Because our skills are nested
// under toolkits/*/skills/, we flatten them: the catalog ID is the skill folder
// name; when two toolkits ship a skill with the same folder name, we disambiguate
// with a `<toolkit>-` prefix to avoid ID collisions.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, relative, sep } from "node:path";

const here = dirname(fileURLToPath(import.meta.url)); // apps/web/scripts
const repoRoot = resolve(here, "../../.."); // better-toolkits
const outDir = resolve(here, "../public/opencode/skills");
const outPath = resolve(outDir, "index.json");
const VERSION = "1";

function walkSkillDir(dir) {
  const files = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith(".")) continue;
      const p = resolve(d, e.name);
      if (e.isDirectory()) walk(p);
      else files.push(relative(dir, p).split(sep).join("/"));
    }
  };
  walk(dir);
  return files.sort();
}

function listSkills(root) {
  const out = [];
  if (!existsSync(root)) return out;
  for (const e of readdirSync(root, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    if (!existsSync(resolve(root, e.name, "SKILL.md"))) continue;
    out.push(e.name);
  }
  return out.sort();
}

const entries = [];
const seen = new Map(); // skill folder name -> toolkit that claimed it

const collect = (root, toolkit) => {
  for (const name of listSkills(root)) {
    const dir = resolve(root, name);
    const files = walkSkillDir(dir);
    let id = name;
    if (seen.has(name)) {
      id = `${toolkit}-${name}`; // disambiguate collision
    }
    seen.set(name, toolkit);
    // materialize the skill tree under the catalog out dir so <base>/<name>/<file> resolves
    const dest = resolve(outDir, id);
    for (const f of files) {
      const src = resolve(dir, f);
      const dst = resolve(dest, f);
      mkdirSync(dirname(dst), { recursive: true });
      copyFileSync(src, dst);
    }
    entries.push({ name: id, version: VERSION, files });
  }
};

collect(resolve(repoRoot, "shared", "skills"), "shared");
for (const tk of readdirSync(resolve(repoRoot, "toolkits"), { withFileTypes: true })) {
  if (!tk.isDirectory()) continue;
  collect(resolve(repoRoot, "toolkits", tk.name, "skills"), tk.name.replace(/-toolkit$/, ""));
}

entries.sort((a, b) => a.name.localeCompare(b.name));
mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, JSON.stringify({ skills: entries }, null, 2) + "\n");
console.log(`[gen-skills-catalog] wrote ${entries.length} skills -> ${relative(repoRoot, outPath)}`);
