/** Path resolution for better-toolkits CLI (zero-dependency, node builtins only). */
import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

/** Monorepo root: env > walk-up from cwd > location of this file. */
export function resolveRepoRoot(cwd = process.cwd()) {
  if (process.env.BETTER_TOOLKITS_ROOT) {
    const p = resolve(process.env.BETTER_TOOLKITS_ROOT);
    if (isRepoRoot(p)) return p;
    throw new Error(`BETTER_TOOLKITS_ROOT is not a repo root: ${p}`);
  }
  let dir = resolve(cwd);
  while (true) {
    if (isRepoRoot(dir)) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Fallback: this file lives at <root>/shared/bootstrap/cli/lib/
  const fromSelf = resolve(HERE, "..", "..", "..", "..");
  if (isRepoRoot(fromSelf)) return fromSelf;
  throw new Error("better-toolkits repo root not found (no .claude-plugin/marketplace.json + toolkits/)");
}

function isRepoRoot(dir) {
  return (
    existsSync(join(dir, ".claude-plugin", "marketplace.json")) &&
    existsSync(join(dir, "toolkits"))
  );
}

/**
 * Resolve the single stderr adapter source (setup-opencode.md order):
 * 1. $BETTER_TOOLKITS_ROOT/shared/hooks/stderr/adapters/opencode-plugin.ts
 * 2. walk-up from cwd for shared/hooks/stderr/adapters/opencode-plugin.ts
 * 3. any single toolkit copy toolkits/<name>/hooks/stderr/adapters/opencode-plugin.ts
 */
export function resolveAdapterPath(repoRoot, fs = { existsSync }) {
  const canonical = join(
    repoRoot,
    "shared",
    "hooks",
    "stderr",
    "adapters",
    "opencode-plugin.ts",
  );
  if (fs.existsSync(canonical)) return canonical;
  const vendored = findToolkitAdapters(repoRoot);
  if (vendored.length === 1) return vendored[0];
  if (vendored.length > 1) {
    throw new Error(
      `multiple vendored stderr adapters found (install exactly one):\n  ${vendored.join("\n  ")}`,
    );
  }
  throw new Error(`stderr adapter not found under ${repoRoot}`);
}

// test seam: list toolkit-vendored adapter copies
export function findToolkitAdapters(repoRoot) {
  const found = [];
  let entries = [];
  try {
    entries = readdirSync(join(repoRoot, "toolkits"), { withFileTypes: true });
  } catch {
    return found;
  }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const p = join(
      repoRoot,
      "toolkits",
      e.name,
      "hooks",
      "stderr",
      "adapters",
      "opencode-plugin.ts",
    );
    if (existsSync(p)) found.push(p);
  }
  return found;
}

export function globalConfigDir() {
  return (
    process.env.OPENCODE_CONFIG_DIR || join(homedir(), ".config", "opencode")
  );
}

/** --config-dir > --project (cwd) > OPENCODE_CONFIG_DIR > ~/.config/opencode */
export function resolveConfigDir(opts = {}) {
  if (opts.configDir) return resolve(opts.configDir);
  if (opts.project) return resolve(process.cwd());
  return globalConfigDir();
}

export function discoveryDir() {
  return join(globalConfigDir(), "plugins", "mnm-no-stderr-redirect");
}

export function discoveryIndex() {
  return join(discoveryDir(), "index.ts");
}

export function commandsScript(repoRoot) {
  return join(repoRoot, "shared", "bootstrap", "scripts", "setup-opencode-commands.sh");
}

export function detectScript(repoRoot) {
  return join(repoRoot, "shared", "hooks", "stderr", "detect.py");
}
