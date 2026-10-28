// Meta Ads CLI transport — the official, ToS-sanctioned channel for agentic ad
// management (Meta "Ads CLI", part of Ads AI Connectors). We exec `meta ads
// <resource> <action>` instead of issuing raw Graph API HTTP from the Meta
// adapter. This keeps agent ad-buying on Meta's supported surface.
//
// Note: ASYNC child_process.execFile is used; the rest of this MCP is sync
// today, so callers await this and we keep it isolated. If the binary is absent
// the adapter returns a loud not_configured/error (never silent).

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface AdsCliResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  data?: unknown; // parsed JSON when --json is used
}

/**
 * Run `meta ads <resource> <action> [args...]` with defaults for automation.
 * Always uses `--json` (or `--table` fallback) and `--no-input`.
 */
export async function adsCli(
  resource: string,
  action: string,
  args: string[] = [],
  opts: { accountId?: string; env?: Record<string, string> } = {},
): Promise<AdsCliResult> {
  const base = ["ads", resource, action, "--no-input", "--json", ...args];
  if (opts.accountId) base.push("--ad-account-id", opts.accountId);

  try {
    const { stdout, stderr } = await execFileAsync("meta", base, {
      env: { ...process.env, ...(opts.env ?? {}) },
    });
    let data: unknown = undefined;
    try {
      data = JSON.parse(stdout);
    } catch {
      /* not JSON — keep raw */
    }
    return { ok: true, stdout, stderr, data };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; code?: number; message?: string };
    return {
      ok: false,
      stdout: err.stdout ?? "",
      stderr: err.stderr ?? err.message ?? "",
    };
  }
}

/** Check Ads CLI availability (used by `status()`). */
export async function adsCliAvailable(): Promise<boolean> {
  try {
    await execFileAsync("meta", ["--version"]);
    return true;
  } catch {
    return false;
  }
}
