/**
 * `better-toolkits self-update` — the single update path for every harness.
 *
 * Order: resolve clone → `git pull --ff-only` (branch policy in `clone.js`) →
 * per-harness idempotent re-sync. OpenCode re-sync reuses the very same wiring
 * steps as `setup` (`planWiringSteps`), so there is no second implementation to
 * drift. Cursor re-sync runs `agent plugin marketplace update better-toolkits`.
 *
 * Callers (SSOT): `scripts/update-better-toolkits-marketplace-<harness>.sh`
 * (which the plugin spawns at startup and `/refresh-better-toolkits-cache`
 * runs by hand) and `scripts/prune-better-toolkits-cache-opencode.sh`.
 */
import { closeSync, existsSync, mkdirSync, openSync, statSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { planWiringSteps, applyInstall } from "./install.js";
import { applyPull, findClone, planPull, DEFAULT_BRANCH } from "./clone.js";

export const HARNESSES = ["opencode", "cursor"];
export { DEFAULT_BRANCH };

/** Single-flight guard: concurrent startup passes exit fast instead of racing. */
export function withUpdateLock(fn, opts = {}) {
  const lockPath = opts.lockPath;
  if (!lockPath) return fn();
  mkdirSync(dirname(lockPath), { recursive: true });
  const create = () => {
    try {
      return openSync(lockPath, "wx");
    } catch {
      return null;
    }
  };
  let fd = create();
  if (fd === null) {
    try {
      if (Date.now() - statSync(lockPath).mtimeMs > (opts.staleMs ?? 600000)) {
        unlinkSync(lockPath);
        fd = create();
      }
    } catch {
      /* lock vanished between checks */
    }
  }
  if (fd === null) return null; // another pass holds the lock
  try {
    return fn();
  } finally {
    try {
      closeSync(fd);
    } catch {
      /* ignore */
    }
    try {
      unlinkSync(lockPath);
    } catch {
      /* ignore */
    }
  }
}

/** `all` | `opencode` | `cursor` | `opencode,cursor` → validated harness list. */
export function resolveHarnesses(spec) {
  if (!spec || spec === "all") return [...HARNESSES];
  const out = String(spec)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const h of out) {
    if (!HARNESSES.includes(h)) {
      throw new Error(`unknown harness: ${h} (expected ${HARNESSES.join("|")}|all)`);
    }
  }
  return out;
}

/** Cross-platform PATH lookup (no shell, no `which`). */
export function onPath(bin, env = process.env) {
  const sep = process.platform === "win32" ? ";" : ":";
  const exts = process.platform === "win32" ? [".cmd", ".exe", ".bat", ""] : [""];
  for (const dir of String(env.PATH || "").split(sep)) {
    if (!dir) continue;
    for (const ext of exts) {
      const candidate = join(dir, bin + ext);
      if (existsSync(candidate)) return candidate;
    }
  }
  return null;
}

/**
 * Read-only plan. The OpenCode wiring is deliberately deferred (`kind: "wiring"`)
 * and expanded at apply time so it compares bytes *after* the pull landed.
 */
export function planSelfUpdate(opts = {}) {
  const harnesses = resolveHarnesses(opts.harness);
  const cloneRoot = opts.cloneRoot ?? findClone({ explicit: opts.clone });
  const steps = [];
  const warnings = [];

  if (!cloneRoot) {
    warnings.push(
      "no better-toolkits clone found — set BETTER_TOOLKITS_ROOT or clone chimeranext/better-toolkits",
    );
    return { cloneRoot: null, harnesses, steps, warnings };
  }

  if (opts.pull === false) {
    steps.push({ kind: "skip", detail: "pull disabled (--no-pull) — wiring only" });
  } else {
    const plan = planPull({
      cloneRoot,
      expertMode: opts.expertMode === true,
      branch: opts.branch || DEFAULT_BRANCH,
    });
    steps.push({ kind: "pull", detail: `update clone ${cloneRoot}`, plan });
  }

  if (harnesses.includes("opencode")) {
    steps.push({ kind: "wiring", detail: "re-sync OpenCode wiring (adapter + commands + skills)" });
  }
  if (harnesses.includes("cursor")) {
    steps.push(
      onPath("agent")
        ? { kind: "cursor-marketplace", detail: "agent plugin marketplace update better-toolkits" }
        : { kind: "skip", detail: "Cursor CLI ('agent') not on PATH — nothing to update" },
    );
  }

  return { cloneRoot, harnesses, steps, warnings };
}

export function applySelfUpdate(plan, opts = {}) {
  const log = opts.log ?? ((m) => console.log(`  ${m}`));
  const dry = opts.dryRun === true;
  const results = [];

  for (const step of plan.steps) {
    if (step.kind === "pull") {
      if (dry) {
        log(`would ${step.plan.reason}`);
        results.push({ ok: true, skipped: true, detail: step.plan.reason });
        continue;
      }
      const r = applyPull(step.plan, { cloneRoot: plan.cloneRoot, log });
      log(r.ok ? r.detail : `! ${r.detail}`);
      results.push(r);
      continue;
    }

    if (step.kind === "wiring") {
      // Expanded post-pull: bytes are compared against the freshly pulled source.
      const wiring = planWiringSteps(opts, plan.cloneRoot);
      applyInstall({ repoRoot: plan.cloneRoot, adapter: wiring.adapter, steps: wiring.steps }, opts);
      try {
        if (dry) {
          log("would re-sync skills catalog (scripts/ci/sync-skills-catalog.py)");
          results.push({ ok: true, skipped: true, detail: "would re-sync skills catalog" });
        } else {
          execFileSync("python3", ["scripts/ci/sync-skills-catalog.py"], {
            cwd: plan.cloneRoot,
            stdio: "pipe",
            timeout: 60000,
          });
          results.push({ ok: true, detail: "skills catalog re-synced" });
        }
      } catch (err) {
        const msg = String(err?.stderr ?? err?.message ?? err).trim().split("\n").pop();
        results.push({ ok: false, detail: `skills catalog sync failed: ${msg}` });
      }
      results.push({ ok: true, detail: "OpenCode wiring re-synced" });
      continue;
    }

    if (step.kind === "cursor-marketplace") {
      const agent = onPath("agent");
      if (!agent) {
        results.push({ ok: true, skipped: true, detail: "agent CLI not on PATH" });
        continue;
      }
      if (dry) {
        log("would run agent plugin marketplace update better-toolkits");
        results.push({ ok: true, skipped: true, detail: "dry-run" });
        continue;
      }
      try {
        execFileSync(agent, ["plugin", "marketplace", "update", "better-toolkits"], {
          stdio: "pipe",
          timeout: 180000,
        });
        results.push({ ok: true, detail: "marketplace update ok" });
      } catch (err) {
        const msg = String(err?.stderr ?? err?.message ?? err).trim().split("\n").pop();
        results.push({ ok: false, detail: `marketplace update failed: ${msg}` });
      }
      continue;
    }

    results.push({ ok: true, skipped: step.kind === "skip", detail: step.detail });
  }

  return results;
}
