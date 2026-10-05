/** MCP phase: wire the canonical 6 MCP servers into opencode.json(c) (setup-opencode.md SSOT).
 *
 * Secrets are NEVER written in clear: slack clientSecret stays an {env:} ref
 * (user provides it via /secret-input → mcp-secrets.env). Everything else is
 * secret-free and fully automatable.
 */
import { existsSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
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

/** Shell sourcing for `{env:}` MCP secrets (issue #52).
 *
 * `slack.client_secret` stays an `{env:SLACK_MCP_CLIENT_SECRET}` ref, so the
 * secret must be exported in every shell — otherwise `opencode mcp auth slack`
 * can never complete and the MCP panel is stuck at Sign In. These helpers keep
 * one idempotent source line per *existing* rc file pointing at the 0600 env
 * file that `setup-opencode-mcp-slack.sh` (or `/secret-input` → `/secret-use`)
 * persists. Secret values are never read or written here.
 */
export const SECRET_NAME = "SLACK_MCP_CLIENT_SECRET";
export const ENV_FILE_NAME = "mcp-secrets.env";

export function userEnvFile(home = homedir()) {
  return join(home, ".config", "opencode", ENV_FILE_NAME);
}

export function shellSourceLine(envFile) {
  return `[ -f "${envFile}" ] && source "${envFile}"`;
}

export function rcFiles(home = homedir()) {
  return [join(home, ".bashrc"), join(home, ".zshrc")];
}

export function shellEnvStatus(opts = {}) {
  const home = opts.home || homedir();
  const envFile = opts.envFile || userEnvFile(home);
  const line = shellSourceLine(envFile);
  const existing = rcFiles(home).filter((f) => existsSync(f));
  const unsourced = existing.filter((f) => {
    try {
      return !readFileSync(f, "utf8").includes(ENV_FILE_NAME);
    } catch {
      return true;
    }
  });
  return {
    envFile,
    line,
    rcs: existing,
    unsourced,
    envFileExists: existsSync(envFile),
    secretSet: Boolean((opts.env || process.env)[SECRET_NAME]),
  };
}

export function planShellEnvStep(opts = {}, repoRoot = null) {
  const st = shellEnvStatus(opts);
  if (!st.unsourced.length) {
    return { kind: "skip", detail: `shell rc files already source ${ENV_FILE_NAME}` };
  }
  return {
    kind: "shell-env",
    detail: `source ${ENV_FILE_NAME} in ${st.unsourced.join(", ")}`,
    status: st,
    script: repoRoot ? join(repoRoot, "shared", "bootstrap", "scripts", "setup-opencode-mcp-slack.sh") : null,
  };
}

export function applyShellEnvStep(step, opts = {}) {
  const st = step.status || shellEnvStatus(opts);
  const touched = [];
  for (const f of st.unsourced) {
    if (!existsSync(f)) continue; // never create rc files the user doesn't have
    appendFileSync(f, `\n# OpenCode MCP secrets (ver better-toolkits: opencode-mcp-config)\n${st.line}\n`);
    touched.push(f);
  }
  console.log(
    `  done: shell sourcing ensured (${touched.length ? touched.join(", ") : "already sourced"})`,
  );
  if (st.envFileExists && st.secretSet) return;
  // Secret still missing: prompt for the value when a human is present (GUI,
  // else terminal no-echo via the slack setup script). Non-interactive runs
  // (CI, pipes) only print the manual next steps — never block on stdin.
  const interactive = opts.interactive ?? process.stdin?.isTTY === true;
  const script = opts.slackScript || step.script;
  if (interactive && script && existsSync(script)) {
    execFileSync("bash", [script], { stdio: "inherit" });
    console.log(`  next: source ${st.envFile} && opencode mcp logout slack && opencode mcp auth slack`);
  } else {
    console.log("  next: persist the secret, then auth (browser OAuth is manual):");
    console.log("    bash shared/bootstrap/scripts/setup-opencode-mcp-slack.sh");
    console.log(`    source ${st.envFile} && opencode mcp logout slack && opencode mcp auth slack`);
  }
  // The OAuth code exchange runs in the opencode SERVER process: a server
  // started before the secret existed sends an empty secret and Slack answers
  // `bad_client_secret` even with LEN=32 in every shell (#52). Restart first.
  console.log("  next: restart the server so it picks up the env, then auth:");
  console.log("    opencode service restart");
}
