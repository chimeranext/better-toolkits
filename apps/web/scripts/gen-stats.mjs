// Build-time generator: compute the site's headline stats from the repo.
// Single source of truth is the monorepo itself — no hardcoded numbers.
// Output: apps/web/src/data/stats.json (consumed by copy.ts).
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");
const outDir = resolve(here, "../src/data");
const outPath = resolve(outDir, "stats.json");

function countFiles(dir, predicate = () => true) {
  if (typeof dir === "string") dir = [dir];
  let n = 0;
  const walk = (d) => {
    let entries = [];
    try { entries = readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.name.startsWith(".")) continue;
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (predicate(p)) n += 1;
    }
  };
  for (const d of dir) walk(d);
  return n;
}

function countLines(dir) {
  if (typeof dir === "string") dir = [dir];
  let lines = 0;
  const walk = (d) => {
    let entries = [];
    try { entries = readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.name.startsWith(".")) continue;
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (p.endsWith(".md")) {
        try { lines += readFileSync(p, "utf8").split("\n").length; } catch { /* ignore */ }
      }
    }
  };
  for (const d of dir) walk(d);
  return lines;
}

// toolkits = marketplace plugins
const marketplace = JSON.parse(readFileSync(resolve(repoRoot, ".claude-plugin/marketplace.json"), "utf8"));
const toolkits = marketplace.plugins.length;

const tksDir = resolve(repoRoot, "toolkits");
const toolkitsDirs = readdirSync(tksDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => join(tksDir, e.name));

const stats = {
  toolkits,
  commands: countFiles(toolkitsDirs.map((d) => join(d, "commands")), (p) => p.endsWith(".md")),
  skills: countFiles([resolve(repoRoot, "shared/skills"), ...toolkitsDirs.map((d) => join(d, "skills"))], (p) => p.endsWith("SKILL.md")),
  agents: countFiles(toolkitsDirs.map((d) => join(d, "agents")), (p) => p.endsWith(".md")),
  templates: countFiles(toolkitsDirs.map((d) => join(d, "templates"))),
  linesOfMethodology: countLines([resolve(repoRoot, "shared/skills"), ...toolkitsDirs.map((d) => join(d, "skills")), ...toolkitsDirs.map((d) => join(d, "references")), ...toolkitsDirs.map((d) => join(d, "commands"))]),
};

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, JSON.stringify(stats, null, 2) + "\n");
console.log(`[gen-stats] wrote ${JSON.stringify(stats)}`);
