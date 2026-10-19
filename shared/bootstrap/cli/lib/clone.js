/**
 * Monorepo clone resolution + fast-forward update planning (zero-dependency).
 *
 * SSOT policy (#110): the source of truth for better-toolkits is the **monorepo
 * clone**, updated with `git pull --ff-only` — never an npm publish. Consumers:
 * `lib/self-update.js` (CLI) and the OpenCode `better-toolkits-auto-update`
 * plugin (which spawns the CLI).
 *
 * Branch policy:
 *   - default (consumer): always converge on `main`, then fast-forward.
 *   - `--expert-mode` (author): never switch branch, never touch a dirty tree.
 *
 * OS awareness: candidate clone roots differ on Linux / WSL / macOS / Windows;
 * the managed fallback clone lives under the OS data dir (XDG on Linux/WSL,
 * Application Support on macOS, LOCALAPPDATA on Windows).
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { homedir, platform as osPlatform } from "node:os";
import { join, resolve } from "node:path";

export const REPO_SLUG = "chimeranext/better-toolkits";
export const DEFAULT_BRANCH = "main";

/** A monorepo clone root contains both the marketplace manifest and `toolkits/`. */
export function isRepoRoot(dir) {
  return (
    !!dir &&
    existsSync(join(dir, ".claude-plugin", "marketplace.json")) &&
    existsSync(join(dir, "toolkits"))
  );
}

function safeRead(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

function dedupe(list) {
  return [...new Set(list.filter(Boolean))];
}

/** `windows` | `macos` | `wsl` | `linux`. */
export function osKind(platform = osPlatform(), env = process.env) {
  if (platform === "win32") return "windows";
  if (platform === "darwin") return "macos";
  if (env.WSL_DISTRO_NAME || env.WSL_INTEROP || /microsoft/i.test(safeRead("/proc/version"))) {
    return "wsl";
  }
  return "linux";
}

/** OS-appropriate managed clone location (used only when no clone exists). */
export function dataDir(opts = {}) {
  const platform = opts.platform ?? osPlatform();
  const env = opts.env ?? process.env;
  const home = opts.home ?? homedir();
  const kind = osKind(platform, env);
  if (kind === "windows") {
    return join(env.LOCALAPPDATA || join(home, "AppData", "Local"), "better-toolkits");
  }
  if (kind === "macos") {
    return join(home, "Library", "Application Support", "better-toolkits");
  }
  return join(env.XDG_DATA_HOME || join(home, ".local", "share"), "better-toolkits");
}

/**
 * Places a GitHub CLI user commonly clones into. `better-toolkits` may sit
 * directly there or one level deep under an org folder (e.g. `chimeranext/`).
 */
export function candidateCloneParents(opts = {}) {
  const platform = opts.platform ?? osPlatform();
  const env = opts.env ?? process.env;
  const home = opts.home ?? homedir();
  const kind = osKind(platform, env);
  const out = [];
  if (kind === "windows") {
    out.push(join(home, "Documents", "GitHub"), join(home, "source", "repos"));
  } else if (kind === "macos") {
    out.push(
      join(home, "Documents", "GitHub"),
      join(home, "Developer"),
      join(home, "GitHub"),
      join(home, "src"),
    );
  } else {
    // Linux + WSL: English and Spanish folder names both occur in practice.
    out.push(
      join(home, "Documentos", "GitHub"),
      join(home, "Documents", "GitHub"),
      join(home, "GitHub"),
      join(home, "src", "github"),
      join(home, "code"),
      join(home, "repos"),
    );
  }
  return dedupe(out);
}

function nestedCloneCandidates(parent) {
  const out = [];
  let entries = [];
  try {
    entries = readdirSync(parent, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const p = join(parent, e.name, "better-toolkits");
    if (existsSync(p)) out.push(p);
  }
  return out;
}

function walkUp(start) {
  let dir = resolve(start);
  for (let i = 0; i < 40; i += 1) {
    if (isRepoRoot(dir)) return dir;
    const parent = resolve(dir, "..");
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * Resolution order: explicit flag → BETTER_TOOLKITS_ROOT → BETTER_TOOLKITS_CLONE
 * → walk-up from cwd → OS-aware GitHub roots. Returns an absolute path or null.
 */
export function findClone(opts = {}) {
  const explicit = opts.explicit ?? null;
  const env = opts.env ?? process.env;
  const home = opts.home ?? homedir();
  const platform = opts.platform ?? osPlatform();
  const cwd = opts.cwd ?? process.cwd();

  const candidates = [];
  if (explicit) candidates.push(explicit);
  if (env.BETTER_TOOLKITS_ROOT) candidates.push(env.BETTER_TOOLKITS_ROOT);
  if (env.BETTER_TOOLKITS_CLONE) candidates.push(env.BETTER_TOOLKITS_CLONE);
  const walked = walkUp(cwd);
  if (walked) candidates.push(walked);
  for (const parent of candidateCloneParents({ platform, env, home })) {
    candidates.push(join(parent, "better-toolkits"));
    candidates.push(...nestedCloneCandidates(parent));
  }
  for (const c of candidates) {
    try {
      const abs = resolve(c);
      if (isRepoRoot(abs)) return abs;
    } catch {
      /* ignore malformed candidates */
    }
  }
  return null;
}

/** Default git runner — `stdio` is piped (never a shell, never `2>/dev/null`). */
export function execGit(cwd, args) {
  try {
    const out = execFileSync("git", ["-C", cwd, ...args], {
      encoding: "utf8",
      timeout: 120000,
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { ok: true, out: String(out).trim() };
  } catch (err) {
    const stderr = typeof err?.stderr === "string" ? err.stderr : "";
    const message = stderr.trim().split("\n").pop() || String(err?.message ?? err);
    return { ok: false, out: "", err: message };
  }
}

/**
 * Decide what to do, without mutating anything.
 * action: "up-to-date" | "pull" | "switch-and-pull" | "skip" | "none"
 * `ok: false` means the reason is a hard problem the caller should surface.
 */
export function planPull(opts = {}) {
  const cloneRoot = opts.cloneRoot ?? null;
  const expertMode = opts.expertMode === true;
  const branch = opts.branch || DEFAULT_BRANCH;
  const git = opts.git ?? execGit;

  if (!isRepoRoot(cloneRoot)) {
    return { action: "none", ok: false, reason: "no monorepo clone found" };
  }
  if (!existsSync(join(cloneRoot, ".git"))) {
    return { action: "none", ok: false, reason: `${cloneRoot} is not a git worktree` };
  }

  const status = git(cloneRoot, ["status", "--porcelain"]);
  if (!status.ok) {
    return { action: "none", ok: false, reason: `git status failed: ${status.err}` };
  }
  if (status.out) {
    return {
      action: "skip",
      ok: true,
      dirty: true,
      reason: expertMode
        ? "uncommitted changes — expert mode leaves your work alone"
        : "uncommitted changes — pull skipped (commit or stash first)",
    };
  }

  const head = git(cloneRoot, ["rev-parse", "--abbrev-ref", "HEAD"]);
  if (!head.ok || head.out === "HEAD") {
    return { action: "skip", ok: true, reason: "detached HEAD — not switching" };
  }

  const target = expertMode ? head.out : branch;
  if (!expertMode && head.out !== branch) {
    return {
      action: "switch-and-pull",
      ok: true,
      branch: target,
      from: head.out,
      reason: `on '${head.out}' — switching to '${branch}' (default) then fast-forward`,
    };
  }
  return { action: "pull", ok: true, branch: target, reason: `fast-forward '${target}'` };
}

/**
 * Apply a plan from `planPull`. Always fast-forward-only and fail-open: a clone
 * that cannot fast-forward is reported, never force-merged.
 */
export function applyPull(plan, opts = {}) {
  const cloneRoot = opts.cloneRoot;
  const git = opts.git ?? execGit;
  const branch = plan?.branch || DEFAULT_BRANCH;
  const log = opts.log ?? (() => {});

  if (!plan || plan.action === "none") return { ok: false, detail: plan?.reason ?? "nothing to do" };
  if (plan.action === "skip") return { ok: true, skipped: true, detail: plan.reason };

  // Explicit refspec: `git remote add` (unlike `git clone`) does not configure
  // remote.origin.fetch, so a bare `git fetch origin <branch>` may leave
  // refs/remotes/origin/<branch> untouched.
  const fetched = git(cloneRoot, [
    "fetch",
    "--prune",
    "origin",
    `+refs/heads/${branch}:refs/remotes/origin/${branch}`,
  ]);
  if (!fetched.ok) return { ok: false, detail: `git fetch failed: ${fetched.err}` };

  if (plan.action === "switch-and-pull") {
    const checkout = git(cloneRoot, ["checkout", branch]);
    if (!checkout.ok) return { ok: false, detail: `git checkout ${branch} failed: ${checkout.err}` };
    log(`switched ${plan.from} → ${branch}`);
  }

  const before = git(cloneRoot, ["rev-parse", "HEAD"]);
  const merged = git(cloneRoot, ["merge", "--ff-only", `origin/${branch}`]);
  if (!merged.ok) {
    return {
      ok: false,
      detail: `cannot fast-forward '${branch}' (diverged?) — resolve by hand: ${merged.err}`,
    };
  }
  const after = git(cloneRoot, ["rev-parse", "HEAD"]);
  const changed = before.ok && after.ok && before.out !== after.out;
  return {
    ok: true,
    changed,
    detail: changed
      ? `${branch}: ${before.out.slice(0, 7)} → ${after.out.slice(0, 7)}`
      : `${branch} already up to date`,
  };
}

/** Managed fallback clone descriptor — only used with explicit consent (`--clone`). */
export function planClone(opts = {}) {
  if (opts.cloneRoot) return null;
  const dir = opts.dir || dataDir(opts);
  return { action: "clone", dir, url: `https://github.com/${REPO_SLUG}.git` };
}

export function applyClone(step, opts = {}) {
  const git = opts.git ?? execGit;
  const log = opts.log ?? (() => {});
  if (!step) return { ok: true, skipped: true, detail: "clone exists" };
  try {
    execFileSync(
      "git",
      ["clone", "--depth", "1", "--branch", DEFAULT_BRANCH, step.url, step.dir],
      { stdio: "ignore", timeout: 300000 },
    );
  } catch (err) {
    return { ok: false, detail: `git clone failed: ${String(err?.message ?? err)}` };
  }
  log(`cloned ${step.url} → ${step.dir}`);
  return { ok: true, changed: true, detail: `cloned to ${step.dir}`, cloneRoot: step.dir };
}
