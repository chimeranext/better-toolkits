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

const PROTOCOL = "shared/bootstrap/references/toolkits-initial-setup/protocol.md";

export function parseArgs(argv) {
  const opts = {
    cmd: "help",
    phases: [],
    project: false,
    dryRun: false,
    alsoNpm: false,
    yes: false,
    configDir: null,
  };
  const rest = [...argv];
  if (rest.length && !rest[0].startsWith("-")) opts.cmd = rest.shift();
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "audit" || a === "install" || a === "verify") opts.phases.push(a);
    else if (a === "--project") opts.project = true;
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--also-npm") opts.alsoNpm = true;
    else if (a === "--yes") opts.yes = true;
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
  better-toolkits setup [audit|install|verify] [--project] [--dry-run] [--also-npm] [--config-dir <path>] [--yes]
  better-toolkits doctor
  better-toolkits help

  setup            detect → audit → propose → confirm → install → verify (default: all phases)
  doctor           audit + loaded-state health check (read-only)

Flags:
  --project        mutate ./opencode.json(c) in the cwd (HITL — shared repo config)
  --dry-run        audit + propose only, no writes
  --also-npm       also run the four @chimeranext/* CLI installs
  --config-dir     override config dir (default ~/.config/opencode)
  --yes            apply without TTY confirm (CI only)

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

const opts = parseArgs(process.argv.slice(2));
if (opts.cmd === "help" || opts.cmd === "--help" || opts.cmd === "-h") printHelp();
else if (opts.cmd === "setup") await cmdSetup(opts);
else if (opts.cmd === "doctor") cmdDoctor();
else {
  console.error(`ERROR: unknown command: ${opts.cmd}`);
  printHelp();
  process.exit(64);
}
