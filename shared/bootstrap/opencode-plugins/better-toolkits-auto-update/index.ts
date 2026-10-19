/**
 * OpenCode V2 plugin — keep better-toolkits wiring fresh from the monorepo clone.
 *
 * Source of truth is `git pull` on the clone (never npm). At startup this plugin
 * spawns `better-toolkits self-update --harness opencode` **detached**, so the
 * session pays no latency; the CLI does the fast-forward pull and re-syncs the
 * discovery copy + `commands/` symlinks + `skills` entries (SSOT:
 * `shared/bootstrap/cli/lib/self-update.js`).
 *
 * Deliberate non-goals (they are the reasons the third-party
 * `opencode-plugin-auto-update` could not be adopted — see issue #110):
 *   - never migrates `"plugins"` → legacy `"plugin"` (singular): the canonical
 *     OpenCode V2 key is `"plugins"` and our audit warns on the singular one;
 *   - never rewrites `opencode.json(c)`;
 *   - does not limit itself to npm-registry entries of the plugins array.
 *
 * Zero-dependency by design (node builtins only), installed as a COPY under
 * `~/.config/opencode/plugins/better-toolkits-auto-update/index.ts` — never a
 * symlink and never a `"plugins"` array entry (file entries are rejected).
 *
 * Opt out: `BETTER_TOOLKITS_AUTO_UPDATE=0` (or `--no-auto-update` at setup).
 * Throttle: `BETTER_TOOLKITS_AUTO_UPDATE_INTERVAL_HOURS` (default 0 = every
 * startup; the run is detached, so it is free).
 * Never use `--expert-mode` here: author clones persist that mode in the sidecar
 * `config.json`, and the background run must never switch the author's branch.
 */
import {
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  statSync,
  closeSync,
  writeFileSync,
} from "node:fs";
import { spawn } from "node:child_process";
import { homedir, platform as osPlatform } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PLUGIN_DIR = dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = resolve(PLUGIN_DIR, "..", "..");
const SIDECAR = join(PLUGIN_DIR, "config.json");
const STAMP = join(PLUGIN_DIR, ".last-run");
const LOG_DIR = join(CONFIG_DIR, "logs");
const LOG_FILE = join(LOG_DIR, "better-toolkits-auto-update.log");

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function isRepoRoot(dir) {
  if (!dir) return false;
  return (
    existsSync(join(dir, ".claude-plugin", "marketplace.json")) &&
    existsSync(join(dir, "toolkits"))
  );
}

function walkUp(start) {
  if (!start) return null;
  let dir = resolve(start);
  for (let i = 0; i < 40; i += 1) {
    if (isRepoRoot(dir)) return dir;
    const parent = resolve(dir, "..");
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function osKind() {
  const p = osPlatform();
  if (p === "win32") return "windows";
  if (p === "darwin") return "macos";
  const env = process.env;
  if (env.WSL_DISTRO_NAME || env.WSL_INTEROP) return "wsl";
  return "linux";
}

function candidateParents(home) {
  const kind = osKind();
  if (kind === "windows") return [join(home, "Documents", "GitHub"), join(home, "source", "repos")];
  if (kind === "macos") {
    return [join(home, "Documents", "GitHub"), join(home, "Developer"), join(home, "GitHub")];
  }
  return [
    join(home, "Documentos", "GitHub"),
    join(home, "Documents", "GitHub"),
    join(home, "GitHub"),
    join(home, "src", "github"),
    join(home, "code"),
  ];
}

function resolveCloneRoot(ctx, sidecar) {
  const env = process.env;
  const direct = [env.BETTER_TOOLKITS_ROOT, sidecar?.cloneRoot].filter(Boolean);
  for (const c of direct) if (isRepoRoot(c)) return resolve(c);

  const walked = walkUp(ctx?.directory ?? process.cwd());
  if (walked) return walked;

  const home = homedir();
  for (const parent of candidateParents(home)) {
    const own = join(parent, "better-toolkits");
    if (isRepoRoot(own)) return own;
    const org = join(parent, "chimeranext", "better-toolkits");
    if (isRepoRoot(org)) return org;
  }
  return null;
}

function throttled() {
  const hours = Number(process.env.BETTER_TOOLKITS_AUTO_UPDATE_INTERVAL_HOURS ?? "0");
  if (!Number.isFinite(hours) || hours <= 0) return false;
  try {
    const age = Date.now() - statSync(STAMP).mtimeMs;
    return age < hours * 3600 * 1000;
  } catch {
    return false;
  }
}

function logLine(message) {
  try {
    mkdirSync(LOG_DIR, { recursive: true });
    writeFileSync(LOG_FILE, `[${new Date().toISOString()}] ${message}\n`, { flag: "a" });
  } catch {
    /* logging is best effort */
  }
}

export default {
  id: "local.better-toolkits-auto-update",
  setup: async (ctx) => {
    if (process.env.BETTER_TOOLKITS_AUTO_UPDATE === "0") return;

    const sidecar = readJson(SIDECAR);
    const cloneRoot = resolveCloneRoot(ctx, sidecar);
    if (!cloneRoot) {
      logLine("skip: no better-toolkits clone found (set BETTER_TOOLKITS_ROOT)");
      return;
    }

    const cli = join(cloneRoot, "shared", "bootstrap", "cli", "bin", "better-toolkits.js");
    if (!existsSync(cli)) {
      logLine(`skip: CLI missing at ${cli}`);
      return;
    }

    if (throttled()) {
      logLine("skip: throttled (BETTER_TOOLKITS_AUTO_UPDATE_INTERVAL_HOURS)");
      return;
    }

    const args = [cli, "self-update", "--harness", "opencode", "--quiet"];
    if (sidecar?.expertMode === true) args.push("--expert-mode");

    try {
      mkdirSync(LOG_DIR, { recursive: true });
      const fd = openSync(LOG_FILE, "a");
      const child = spawn(process.execPath, args, {
        detached: true,
        stdio: ["ignore", fd, fd],
        env: { ...process.env, BETTER_TOOLKITS_ROOT: cloneRoot },
      });
      child.unref();
      closeSync(fd);
      writeFileSync(STAMP, `${Date.now()}\n`);
      logLine(`spawned: ${sidecar?.expertMode ? "expert" : "consumer"} mode @ ${cloneRoot}`);
    } catch (err) {
      logLine(`spawn failed: ${String(err?.message ?? err)}`);
    }
  },
};
