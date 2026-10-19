#!/usr/bin/env node
/**
 * @chimeranext/better-toolkits — harness bootstrap CLI (Phase B).
 *
 * OpenCode/headless: `npx @chimeranext/better-toolkits setup`
 * Protocol SSOT: shared/bootstrap/references/toolkits-initial-setup/protocol.md
 *
 * Default flow: detect → audit → propose → wait for TTY confirm → install → verify.
 * Replaces deprecated: npx @chimeranext/make-no-mistakes install
 */
import { audit, printAudit } from "../lib/audit.js";
import { planInstall, applyInstall } from "../lib/install.js";
import { verify, printVerify } from "../lib/verify.js";
import { confirm } from "../lib/hitl.js";
import { planSelfUpdate, applySelfUpdate, withUpdateLock } from "../lib/self-update.js";
import { planAutoUpdateToggle, applyAutoUpdateToggle, AUTO_UPDATE_ACTIONS } from "../lib/auto-update.js";
import { resolveConfigDir } from "../lib/paths.js";
import { join } from "node:path";

const PROTOCOL = "shared/bootstrap/references/toolkits-initial-setup/protocol.md";

export function parseArgs(argv) {
  const opts = {
    cmd: "help",
    phases: [],
    project: false,
    dryRun: false,
    alsoNpm: false,
    yes: false,
    slackClientId: null,
    configDir: null,
    expertMode: false,
    noAutoUpdate: false,
    noPull: false,
    quiet: false,
    harness: null,
    clone: null,
    autoUpdateAction: null,
  };
  const rest = [...argv];
  if (rest.length && !rest[0].startsWith("-")) opts.cmd = rest.shift();
  if (opts.cmd === "auto-update" && rest.length && !rest[0].startsWith("-")) {
    opts.autoUpdateAction = rest.shift();
  }
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "audit" || a === "install" || a === "verify") opts.phases.push(a);
    else if (a === "--project") opts.project = true;
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--also-npm") opts.alsoNpm = true;
    else if (a === "--yes") opts.yes = true;
    else if (a === "--expert-mode") opts.expertMode = true;
    else if (a === "--no-auto-update") opts.noAutoUpdate = true;
    else if (a === "--no-pull") opts.noPull = true;
    else if (a === "--quiet") opts.quiet = true;
    else if (a === "--harness") opts.harness = rest[++i] ?? null;
    else if (a.startsWith("--harness=")) opts.harness = a.slice("--harness=".length);
    else if (a === "--clone") opts.clone = rest[++i] ?? null;
    else if (a.startsWith("--clone=")) opts.clone = a.slice("--clone=".length);
    else if (a === "--slack-client-id") opts.slackClientId = rest[++i] ?? null;
    else if (a.startsWith("--slack-client-id=")) opts.slackClientId = a.slice("--slack-client-id=".length);
    else if (a === "--config-dir") opts.configDir = rest[++i] ?? null;
    else if (a.startsWith("--config-dir=")) opts.configDir = a.slice("--config-dir=".length);
    else {
      console.error(`ERROR: unknown flag: ${a}`);
      process.exit(64);
    }
  }
  return opts;
}

function printHelp() {
  console.log(`@chimeranext/better-toolkits — harness bootstrap (Phase B)

Usage:
  better-toolkits setup [audit|install|verify] [--project] [--dry-run] [--also-npm] [--config-dir <path>] [--yes] [--expert-mode]
  better-toolkits self-update [--harness opencode|cursor|all] [--expert-mode] [--no-pull] [--dry-run] [--quiet]
  better-toolkits auto-update <enable|disable> [--config-dir <path>] [--dry-run]
  better-toolkits doctor
  better-toolkits help

  setup            detect → audit → propose → confirm → install → verify (default: all phases)
  self-update      git pull --ff-only the monorepo clone + re-sync harness wiring
  auto-update      enable/disable the OpenCode auto-update plugin (idempotent)
  doctor           audit + loaded-state health check (read-only)

Flags:
  --project        mutate ./opencode.json(c) in the cwd (HITL — shared repo config)
  --dry-run        audit + propose only, no writes
  --also-npm       also run the four @chimeranext/* CLI installs
  --slack-client-id <id>  Slack app Client ID for the mcp.slack entry (secret stays {env:})
  --config-dir     override config dir (default ~/.config/opencode)
  --yes            apply without TTY confirm (CI only)
  --expert-mode    author flow: never switch branch, leave a dirty tree alone
                   (default is consumer: always converge on 'main')
  --no-auto-update do not install the OpenCode auto-update plugin (or BETTER_TOOLKITS_AUTO_UPDATE=0)
  --harness <spec> self-update target: opencode | cursor | all (default all)
  --no-pull        re-sync wiring without touching the clone (used by prune)
  --clone <path>   explicit monorepo clone root (or BETTER_TOOLKITS_ROOT)
  --quiet          self-update: no per-step output (plugin/background runs)

Auto-update plugin (#110):
  better-toolkits auto-update enable     install/refresh the plugin + mode sidecar
  better-toolkits auto-update disable    remove the plugin (stops background updates)
  Env: BETTER_TOOLKITS_AUTO_UPDATE=0 disables without uninstalling.

Protocol SSOT: ${PROTOCOL}
Claude/Cursor: install better-toolkits-bootstrap@better-toolkits, then /toolkits-initial-setup`);
}

function detectHarness() {
  if (process.env.CLAUDE_PLUGIN_ROOT) return "claude";
  return "opencode";
}

async function cmdSetup(opts) {
  const harness = detectHarness();
  if (harness !== "opencode") {
    console.log(`Harness '${harness}' detected: the CLI only implements the opencode adapter.`);
    console.log("Use /toolkits-initial-setup (bootstrap plugin) for claude/cursor.");
    process.exit(2);
  }
  const phases = opts.phases.length ? opts.phases : ["audit", "install", "verify"];

  if (phases.includes("audit")) {
    console.log("== audit ==");
    const report = audit(opts);
    printAudit(report);
    console.log("");
  }

  if (phases.includes("install")) {
    console.log("== propose ==");
    const plan = planInstall(opts);
    for (const s of plan.steps) console.log(`  - [${s.kind}] ${s.detail}`);
    console.log("");
    if (opts.dryRun) {
      console.log("(dry-run: no writes)");
    } else {
      let ok = opts.yes;
      if (!ok) ok = await confirm("Apply these changes?");
      if (!ok) {
        console.log("Aborted — no changes applied.");
        process.exit(1);
      }
      console.log("== install ==");
      applyInstall(plan, opts);
      console.log("");
    }
  }

  if (phases.includes("verify") && !opts.dryRun) {
    console.log("== verify ==");
    const failed = printVerify(verify(opts));
    process.exit(failed ? 1 : 0);
  }
}

function cmdDoctor() {
  console.log("== doctor ==");
  const report = audit({});
  const warns = printAudit(report);
  console.log("");
  console.log("== verify ==");
  const failed = printVerify(verify({}));
  process.exit(warns || failed ? 1 : 0);
}

async function cmdAutoUpdate(opts) {
  const action = opts.autoUpdateAction;
  if (!AUTO_UPDATE_ACTIONS.includes(action)) {
    console.error(`ERROR: auto-update expects ${AUTO_UPDATE_ACTIONS.join("|")}`);
    process.exit(64);
  }
  let plan;
  try {
    plan = planAutoUpdateToggle(opts.autoUpdateAction, opts);
  } catch (err) {
    console.error(`ERROR: ${String(err?.message ?? err)}`);
    process.exit(64);
  }
  if (plan.ok === false) {
    console.error(`ERROR: ${plan.detail}`);
    process.exit(1);
  }
  if (opts.dryRun) {
    console.log(`== auto-update ${opts.autoUpdateAction} (dry-run) ==`);
    console.log(`  ${plan.detail}`);
    return;
  }
  const r = applyAutoUpdateToggle(plan, opts);
  console.log(`[${r.ok ? "OK" : "FAIL"}] ${r.detail}`);
  process.exit(r.ok ? 0 : 1);
}

async function cmdSelfUpdate(opts) {
  const plan = planSelfUpdate(opts);
  const say = opts.quiet ? () => {} : (m) => console.log(m);

  say("== self-update ==");
  say(`clone:   ${plan.cloneRoot ?? "(none found)"}`);
  say(`harness: ${plan.harnesses.join(", ")}`);
  say(`mode:    ${opts.expertMode ? "expert (branch per clone)" : "consumer (branch main)"}`);
  for (const w of plan.warnings) say(`  ! ${w}`);
  for (const s of plan.steps) say(`  - [${s.kind}] ${s.detail}`);
  say("");

  if (!plan.cloneRoot) process.exit(opts.quiet ? 0 : 1);

  const log = opts.quiet ? () => {} : (m) => console.log(`  ${m}`);
  const lockPath = join(resolveConfigDir(opts), ".better-toolkits-self-update.lock");
  const run = () => applySelfUpdate(plan, { ...opts, log });
  const results = opts.dryRun ? run() : withUpdateLock(run, { lockPath });

  if (results === null) {
    say("another self-update is already running — skipped");
    process.exit(0);
  }
  const failed = results.filter((r) => r.ok === false);
  say("");
  for (const r of results) {
    say(`  [${r.ok ? (r.skipped ? "skip" : "OK") : "FAIL"}] ${r.detail}`);
  }
  process.exit(failed.length ? 1 : 0);
}

const opts = parseArgs(process.argv.slice(2));
if (opts.cmd === "help" || opts.cmd === "--help" || opts.cmd === "-h") printHelp();
else if (opts.cmd === "setup") await cmdSetup(opts);
else if (opts.cmd === "self-update") await cmdSelfUpdate(opts);
else if (opts.cmd === "auto-update") await cmdAutoUpdate(opts);
else if (opts.cmd === "doctor") cmdDoctor();
else {
  console.error(`ERROR: unknown command: ${opts.cmd}`);
  printHelp();
  process.exit(64);
}
