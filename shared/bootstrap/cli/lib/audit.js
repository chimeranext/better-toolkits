/** Read-only audit of OpenCode wiring (setup-opencode.md Phase 1 table). */
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import {
  resolveRepoRoot,
  resolveAdapterPath,
  resolveConfigDir,
  discoveryIndex,
  commandsScript,
} from "./paths.js";
import { toolkitSkillsDirs, readSkills, missingSkills } from "./skills.js";
import { canonicalServers } from "./mcp.js";

function readBytes(p) {
  try {
    return readFileSync(p);
  } catch {
    return null;
  }
}

function bytesEqual(a, b) {
  return a !== null && b !== null && Buffer.compare(a, b) === 0;
}

function tryPluginList() {
  try {
    const out = execFileSync("opencode", ["plugin", "list"], {
      encoding: "utf8",
      timeout: 15000,
    });
    return { ok: true, loaded: out.includes("mnm-no-stderr-redirect"), out };
  } catch (err) {
    return { ok: false, loaded: false, error: String(err?.message ?? err).split("\n")[0] };
  }
}

function commandsCheck(repoRoot) {
  const script = commandsScript(repoRoot);
  if (!existsSync(script)) return { ok: false, detail: "script missing" };
  try {
    execFileSync("bash", [script, "--check"], { timeout: 30000, stdio: "pipe" });
    return { ok: true, detail: "CHECK OK" };
  } catch {
    return { ok: false, detail: "expected links missing (run install)" };
  }
}

function readConfig(configDir) {
  for (const name of ["opencode.json", "opencode.jsonc"]) {
    const raw = readBytes(`${configDir}/${name}`);
    if (raw) {
      let parsed = null;
      try {
        // strip // and /* */ comments for jsonc
        const stripped = raw
          .toString("utf8")
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .replace(/(^|\s)\/\/.*$/gm, "$1");
        parsed = JSON.parse(stripped);
      } catch {
        parsed = null;
      }
      return { file: `${configDir}/${name}`, parsed };
    }
  }
  return { file: null, parsed: null };
}

export function audit(opts = {}) {
  const repoRoot = resolveRepoRoot();
  const rows = [];
  const add = (check, result, warn = false) => rows.push({ check, result, warn });

  // Config file
  const configDir = resolveConfigDir(opts);
  const cfg = readConfig(configDir);
  add("Config file path", cfg.file ?? `(none — would create ${configDir}/opencode.json)`);

  if (cfg.parsed) {
    const plugins = cfg.parsed.plugins;
    add(
      '"plugins" array',
      Array.isArray(plugins) ? (plugins.length ? plugins.join(", ") : "(empty)") : "(absent)",
      Array.isArray(plugins) && plugins.some((p) => String(p).endsWith(".ts")),
    );
    add(
      'Legacy key "plugin" (singular)',
      cfg.parsed.plugin !== undefined ? "PRESENT — migrate to \"plugins\"" : "absent",
      cfg.parsed.plugin !== undefined,
    );
    const skills = cfg.parsed.skills;
    const wanted = toolkitSkillsDirs(resolveRepoRoot());
    const missing = missingSkills(skills, wanted);
    add(
      '"skills" entries',
      Array.isArray(skills)
        ? `${skills.length} present, ${missing.length} missing of ${wanted.length} toolkit dirs`
        : `(absent — ${wanted.length} toolkit skills dirs unwired)`,
      missing.length > 0,
    );
  } else if (cfg.file) {
    add("Config parse", "UNPARSEABLE — fix JSON/JSONC syntax", true);
  } else {
    add('"plugins" array', "(no config file)");
    add('"skills" entries', "(no config file)");
  }

  // Stderr discovery copy
  let adapter = null;
  try {
    adapter = resolveAdapterPath(repoRoot);
  } catch (err) {
    add("Adapter source", `MISSING — ${err.message}`, true);
  }
  const installed = readBytes(discoveryIndex());
  const source = adapter ? readBytes(adapter) : null;
  if (adapter) add("Adapter source", adapter);
  if (!installed) {
    add("Stderr discovery copy", "missing — run install", true);
  } else if (bytesEqual(installed, source)) {
    add("Stderr discovery copy", "present + bytes match source");
  } else {
    add("Stderr discovery copy", "present but STALE (bytes differ) — run install", true);
  }

  // Duplicates: other copies of the adapter registered anywhere obvious
  add("Duplicate stderr installs", "none checked beyond discovery dir");

  // Plugin loaded?
  const pl = tryPluginList();
  if (!pl.ok) {
    add("Plugin loaded", `unknown (${pl.error})`);
  } else {
    add(
      "Plugin loaded",
      pl.loaded ? "local.mnm-no-stderr-redirect LOADED" : "present on disk but NOT loaded — restart service",
      !pl.loaded && installed !== null,
    );
  }

  // Commands wiring
  const cc = commandsCheck(repoRoot);
  add("commands/ autocomplete wiring", cc.detail, !cc.ok);

  // Canonical MCP set (mcp.servers)
  const wanted = canonicalServers({});
  const have = (cfg.parsed && cfg.parsed.mcp && cfg.parsed.mcp.servers) || {};
  const wantNames = Object.keys(wanted);
  const missingMcp = wantNames.filter((n) => !(n in have));
  add(
    "mcp servers (canonical 6)",
    `${wantNames.length - missingMcp.length}/${wantNames.length} present${missingMcp.length ? ` — missing: ${missingMcp.join(", ")}` : ""}`,
    missingMcp.length > 0,
  );

  return { repoRoot, adapter, configDir, rows };
}

export function printAudit(report) {
  console.log(`repo: ${report.repoRoot}`);
  console.log(`config dir: ${report.configDir}`);
  const w = Math.max(...report.rows.map((r) => r.check.length));
  for (const r of report.rows) {
    const flag = r.warn ? " (!)" : "";
    console.log(`  ${r.check.padEnd(w)}  ${r.result}${flag}`);
  }
  const warns = report.rows.filter((r) => r.warn).length;
  if (warns) console.log(`\n${warns} item(s) need attention — run install.`);
  return warns;
}
