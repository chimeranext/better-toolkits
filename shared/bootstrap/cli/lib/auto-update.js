/**
 * Enable / disable the OpenCode auto-update plugin (#110).
 *
 * Thin, idempotent wrappers — no update logic lives here:
 *   - enable  → (re)install the discovery-dir copy + write the mode sidecar
 *   - disable → remove the discovery-dir copy (OpenCode unloads it on next start)
 *
 * The sidecar's `expertMode` is preserved across enable so an author clone does
 * not silently become a consumer clone.
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import {
  autoUpdateConfigPath,
  autoUpdatePluginIndex,
  resolveAutoUpdatePluginSource,
  resolveConfigDir,
  resolveRepoRoot,
} from "./paths.js";

export const AUTO_UPDATE_ACTIONS = ["enable", "disable"];

/** Refuse to touch a config dir that is not an opencode config dir. */
function assertConfigDir(configDir) {
  const normalized = String(configDir);
  const looksLike =
    normalized.startsWith("/") && /(^|\/)opencode(\/|$)/.test(normalized.split("://")[0]);
  if (!looksLike) {
    throw new Error(`refusing: not an opencode config dir: ${configDir}`);
  }
}

export function planAutoUpdateToggle(action, opts = {}) {
  if (!AUTO_UPDATE_ACTIONS.includes(action)) {
    throw new Error(`unknown action: ${action} (expected enable|disable)`);
  }
  const repoRoot = resolveRepoRoot();
  const configDir = resolveConfigDir(opts);
  assertConfigDir(configDir);

  const source = resolveAutoUpdatePluginSource(repoRoot);
  if (!existsSync(source)) {
    return { ok: false, action, detail: `plugin source missing: ${source}` };
  }

  if (action === "enable") {
    const installed = existsSync(autoUpdatePluginIndex(configDir));
    return {
      ok: true,
      action,
      detail: installed
        ? `refresh auto-update plugin (${autoUpdatePluginIndex(configDir)})`
        : `install auto-update plugin -> ${autoUpdatePluginIndex(configDir)}`,
      source,
      target: autoUpdatePluginIndex(configDir),
      configTarget: autoUpdateConfigPath(configDir),
      repoRoot,
    };
  }

  const target = join(configDir, "plugins", "better-toolkits-auto-update");
  if (!existsSync(target)) {
    return { ok: true, action, detail: "auto-update plugin not installed — nothing to do", target };
  }
  return { ok: true, action, detail: `remove ${target}`, target };
}

export function applyAutoUpdateToggle(plan, opts = {}) {
  if (!plan || plan.ok === false) {
    return { ok: false, detail: plan?.detail ?? "no plan" };
  }

  if (plan.action === "enable") {
    mkdirSync(dirname(plan.target), { recursive: true });
    copyFileSync(plan.source, plan.target);

    // Preserve an existing sidecar's mode (author clones stay expert).
    let expertMode = false;
    try {
      expertMode = readFileSync(plan.configTarget, "utf8").includes('"expertMode": true');
    } catch {
      /* no sidecar yet */
    }
    const doc = { cloneRoot: plan.repoRoot, expertMode, branch: expertMode ? null : "main" };
    writeFileSync(plan.configTarget, `${JSON.stringify(doc, null, 2)}\n`);
    return { ok: true, detail: `auto-update plugin installed at ${plan.target}` };
  }

  rmSync(plan.target, { recursive: true, force: true });
  return { ok: true, detail: `auto-update plugin removed from ${plan.target}` };
}
