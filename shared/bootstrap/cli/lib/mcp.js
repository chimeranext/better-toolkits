/** MCP phase: wire the canonical 6 MCP servers into opencode.json(c) (setup-opencode.md SSOT).
 *
 * Secrets are NEVER written in clear: slack clientSecret stays an {env:} ref
 * (user provides it via /secret-input → mcp-secrets.env). Everything else is
 * secret-free and fully automatable.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { resolveConfigDir } from "./paths.js";

/** Canonical set — mirrors the SSOT table in setup-opencode.md. */
export function canonicalServers(opts = {}) {
  const home = homedir();
  const nodeBin = opts.nodeBin || join(home, ".local", "node-v22", "bin", "npx");
  const dartBin = opts.dartBin || join(home, "flutter", "bin", "dart");
  const nodePath =
    opts.nodePath ||
    `${join(home, ".local", "node-v22", "bin")}:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`;
  return {
    slack: {
      type: "remote",
      url: "https://mcp.slack.com/mcp",
      oauth: {
        client_id: opts.slackClientId || "REPLACE_WITH_SLACK_CLIENT_ID",
        client_secret: "{env:SLACK_MCP_CLIENT_SECRET}",
        redirect_uri: "http://localhost:3118/callback",
      },
    },
    linear: { type: "remote", url: "https://mcp.linear.app/mcp" },
    "chrome-devtools-mcp": {
      type: "local",
      command: [nodeBin, "-y", "chrome-devtools-mcp@latest"],
      environment: { PATH: nodePath },
    },
    context7: { type: "remote", url: "https://mcp.context7.com/mcp" },
    stitch: {
      type: "local",
      command: [nodeBin, "-y", "google-stitch-mcp@latest"],
      disabled: true,
    },
    dart: {
      type: "local",
      command: [dartBin, "mcp-server", "--force-roots-fallback"],
    },
  };
}

export function planMcpStep(opts = {}) {
  const configDir = resolveConfigDir(opts);
  const target = configMergeTarget(configDir);
  const wanted = canonicalServers(opts);
  const current = readServers(target);
  const missing = [];
  const drifted = [];
  for (const [name, shape] of Object.entries(wanted)) {
    if (!(name in current)) missing.push(name);
    else if (JSON.stringify(current[name]) !== JSON.stringify(shape)) drifted.push(name);
  }
  if (!missing.length && !drifted.length) {
    return { kind: "skip", detail: `mcp servers up to date in ${target}` };
  }
  const parts = [];
  if (missing.length) parts.push(`add ${missing.join(", ")}`);
  if (drifted.length) parts.push(`update ${drifted.join(", ")}`);
  return {
    kind: "mcp",
    detail: `${parts.join("; ")} in ${target}`,
    target,
    wanted,
  };
}

function configMergeTarget(configDir) {
  for (const n of ["opencode.json", "opencode.jsonc"]) {
    if (existsSync(join(configDir, n))) return join(configDir, n);
  }
  return join(configDir, "opencode.json");
}

function readServers(target) {
  try {
    const doc = JSON.parse(readFileSync(target, "utf8"));
    return (doc.mcp && doc.mcp.servers) || {};
  } catch {
    return {};
  }
}

export function applyMcpStep(step) {
  let doc = {};
  try {
    doc = JSON.parse(readFileSync(step.target, "utf8"));
  } catch {
    doc = {};
  }
  if (!doc.$schema) doc.$schema = "https://opencode.ai/config.json";
  doc.mcp = doc.mcp || {};
  doc.mcp.servers = doc.mcp.servers || {};
  Object.assign(doc.mcp.servers, step.wanted);
  writeFileSync(step.target, `${JSON.stringify(doc, null, 2)}\n`);
  console.log(`  done: ${step.detail}`);
}
