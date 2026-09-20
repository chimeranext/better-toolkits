/** Skills wiring: one `skills` entry per toolkit in opencode.json(c). */
import { existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { resolveConfigDir } from "./paths.js";

/** Absolute skills dirs of every toolkit that ships one. */
export function toolkitSkillsDirs(repoRoot) {
  const found = [];
  let entries = [];
  try {
    entries = readdirSync(join(repoRoot, "toolkits"), { withFileTypes: true });
  } catch {
    return found;
  }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const p = join(repoRoot, "toolkits", e.name, "skills");
    if (existsSync(p)) found.push(p);
  }
  return found.sort();
}

function configPaths(configDir) {
  return [join(configDir, "opencode.json"), join(configDir, "opencode.jsonc")];
}

export function readSkills(configDir) {
  for (const f of configPaths(configDir)) {
    if (!existsSync(f)) continue;
    try {
      return { file: f, skills: JSON.parse(readFileSync(f, "utf8")).skills ?? null };
    } catch {
      return { file: f, skills: null, unparseable: true };
    }
  }
  return { file: null, skills: null };
}

/** Entries in `wanted` missing from `current`. */
export function missingSkills(current, wanted) {
  const have = new Set(Array.isArray(current) ? current : []);
  return wanted.filter((w) => !have.has(w));
}
