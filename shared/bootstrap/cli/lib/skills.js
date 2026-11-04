/** Skills wiring: one `skills` entry per toolkit in opencode.json(c). */
import { existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { resolveConfigDir } from "./paths.js";

/**
 * Canonical clone root: the PRIMARY worktree of the repo, not a nested one.
 * A setup run from inside a worktree must not write absolute paths to that
 * worktree (they die when the worktree is removed). Ground truth is the git
 * common-dir, resolved via `git worktree list` (first entry = main).
 */
export function canonicalCloneRoot(repoRoot) {
  const envRoot = process.env.BETTER_TOOLKITS_ROOT;
  if (envRoot && existsSync(join(envRoot, ".claude-plugin", "marketplace.json"))) {
    return envRoot;
  }
  try {
    const out = execFileSync("git", ["-C", repoRoot, "worktree", "list", "--porcelain"], {
      encoding: "utf8",
      timeout: 5000,
    });
    const lines = out.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("worktree ")) {
        const path = lines[i].slice("worktree ".length).trim();
        return path;
      }
    }
  } catch {
    // fall through
  }
  return repoRoot;
}

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

/** Transversal skills under `shared/skills/` (e.g. local-pr-review, requirements-authoring). */
export function sharedSkillsDir(repoRoot) {
  const p = join(repoRoot, "shared", "skills");
  return existsSync(p) ? [p] : [];
}

/** Toolkit + transversal dirs for OpenCode `skills` wiring during /toolkits-initial-setup. */
export function installSkillsDirs(repoRoot) {
  return [...toolkitSkillsDirs(repoRoot), ...sharedSkillsDir(repoRoot)].sort();
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

/**
 * Consolidate the skills list: replace the ENTIRE list (on opencode.json/.jsonc)
 * with exactly the wanted dirs. This removes dead/duplicated entries left by
 * previous runs from other worktrees, making setup/refresh deterministic.
 * Returns true when a write happened.
 */
export function ensureConsolidatedSkills(configDir, repoRoot) {
  const wanted = installSkillsDirs(repoRoot).sort();
  const current = readSkills(configDir);
  if (current.unparseable) return { wrote: false, manual: current.file };
  const have = Array.isArray(current.skills) ? [...current.skills].sort() : [];
  const same = have.length === wanted.length && have.every((v, i) => v === wanted[i]);
  if (same) return { wrote: false };
  if (!current.file) return { wrote: false, manual: null };
  try {
    const doc = JSON.parse(readFileSync(current.file, "utf8"));
    doc.skills = wanted;
    writeFileSync(current.file, `${JSON.stringify(doc, null, 2)}\n`);
    return { wrote: true, file: current.file };
  } catch {
    return { wrote: false, manual: current.file };
  }
}
