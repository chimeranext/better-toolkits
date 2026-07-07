// Build-time generator: derive the toolkit catalog from the monorepo marketplace.json
// (the single source of truth) into src/data/toolkits.json. Runs on prebuild/predev.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url)); // apps/web/scripts
const repoRoot = resolve(here, "../../.."); // better-toolkits
const marketplacePath = resolve(repoRoot, ".claude-plugin/marketplace.json");
const outDir = resolve(here, "../src/data");
const outPath = resolve(outDir, "toolkits.json");

const marketplace = JSON.parse(readFileSync(marketplacePath, "utf8"));

const rows = marketplace.plugins.map((p) => {
  const dir = String(p.source).replace(/^\.\/toolkits\//, "").replace(/\/$/, "");
  return { plugin: p.name, dir, version: p.version, category: p.category ?? null };
});

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, JSON.stringify(rows, null, 2) + "\n");
console.log(`[gen-toolkits] wrote ${rows.length} toolkits -> src/data/toolkits.json`);
