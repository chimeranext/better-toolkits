#!/usr/bin/env node
/**
 * @chimeranext/better-toolkits — CLI stub (Phase A).
 * Full detect/audit/install in Phase B. Mirrors /toolkits-initial-setup protocol.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROTOCOL = join(
  __dirname,
  "..",
  "..",
  "references",
  "toolkits-initial-setup",
  "protocol.md",
);

const [cmd = "help", ...args] = process.argv.slice(2);

function printHelp() {
  console.log(`@chimeranext/better-toolkits (stub)

Commands:
  setup [--dry-run]   HITL bootstrap (audit + propose; install needs TTY or --yes in Phase B)
  doctor              Health check (marketplace, stderr paths)
  help

Replaces deprecated: npx @lapc506/make-no-mistakes install

Protocol SSOT: shared/bootstrap/references/toolkits-initial-setup/protocol.md
Plugin path:    claude plugin install better-toolkits-bootstrap@better-toolkits
`);
}

function cmdSetup() {
  const dryRun = args.includes("--dry-run");
  console.log("@chimeranext/better-toolkits setup");
  console.log("");
  console.log("Phase B will implement full detect → audit → propose → install → verify.");
  console.log("For now, use the slash command /toolkits-initial-setup in Claude Code or Cursor");
  console.log("after installing better-toolkits-bootstrap@better-toolkits.");
  console.log("");
  if (dryRun) {
    console.log("--dry-run: would audit marketplace, hooks, and opencode.jsonc (not implemented yet).");
    return;
  }
  try {
    const proto = readFileSync(PROTOCOL, "utf8");
    const phases = proto.match(/## Phase \d+[^\n]*/g);
    if (phases) {
      console.log("Protocol phases:");
      phases.forEach((p) => console.log(`  ${p.replace("## ", "")}`));
    }
  } catch {
    console.log("(Clone better-toolkits repo for full protocol file.)");
  }
  console.log("");
  console.log("HITL: no global config writes from this stub without --yes (Phase B).");
}

function cmdDoctor() {
  console.log("doctor: stub OK — run `claude plugin marketplace list` and verify better-toolkits-bootstrap.");
}

switch (cmd) {
  case "setup":
    cmdSetup();
    break;
  case "doctor":
    cmdDoctor();
    break;
  case "help":
  case "--help":
  case "-h":
    printHelp();
    break;
  default:
    console.error(`Unknown command: ${cmd}`);
    printHelp();
    process.exit(1);
}
