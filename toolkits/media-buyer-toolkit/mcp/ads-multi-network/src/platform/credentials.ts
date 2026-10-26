// Credential resolution (design D7): env → toolkit config file (mode 0600) → per-call.
// Credential VALUES never leave this module into output/error paths; redaction is applied at the router.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { Network } from "../types.js";

export type CredentialSource = "env" | "config" | "call";

export interface ResolvedCredentials {
  source: CredentialSource;
  /** secret values keyed by field name (e.g. access_token, developer_token, bc_id). */
  values: Record<string, string>;
}

const NETWORK_ENV: Record<Network, Record<string, string>> = {
  meta: { access_token: "MEDIA_BUYER_META_ACCESS_TOKEN" },
  tiktok: { access_token: "MEDIA_BUYER_TIKTOK_ACCESS_TOKEN" },
  linkedin: { access_token: "MEDIA_BUYER_LINKEDIN_ACCESS_TOKEN" },
  google: {
    access_token: "MEDIA_BUYER_GOOGLE_ACCESS_TOKEN",
    developer_token: "MEDIA_BUYER_GOOGLE_DEVELOPER_TOKEN",
  },
  youtube: {}, // resolves through the google adapter (same credential set)
  spotify: { access_token: "MEDIA_BUYER_SPOTIFY_ACCESS_TOKEN" },
};

export interface CredentialRequest {
  network: Network;
  requiredFields: string[]; // field names the adapter needs (subset of values keys)
  perCall?: Record<string, string>; // caller-managed secrets
}

function configDir(): string {
  const xdg = process.env.XDG_CONFIG_HOME;
  return xdg && xdg.trim() !== "" ? xdg : path.join(os.homedir(), ".config");
}

export function configFilePath(): string {
  return path.join(configDir(), "media-buyer-toolkit", "credentials.json");
}

function readConfig(): Record<string, unknown> {
  const p = configFilePath();
  if (!fs.existsSync(p)) return {};
  try {
    {
      const st = fs.statSync(p);
      if ((st.mode & 0o777) !== 0o600) {
        throw new Error("credentials.json mode must be 0600");
      }
    }
    return JSON.parse(fs.readFileSync(p, "utf8")) as Record<string, unknown>;
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("credentials.json")) throw e;
    throw new Error("credentials.json is not readable by the toolkit config loader");
  }
}

/**
 * Resolves credentials in the fixed order. Throws not_configured naming the SOURCE
 * and missing field names — never values.
 */
export function resolveCredentials(req: CredentialRequest): ResolvedCredentials {
  // 1. environment variables
  const envSpec = NETWORK_ENV[req.network];
  const envHits: Record<string, string> = {};
  for (const [field, envName] of Object.entries(envSpec)) {
    const v = process.env[envName];
    if (v !== undefined && v !== "") envHits[field] = v;
  }

  // 2. toolkit config file (mode 0600)
  let cfgHits: Record<string, string> = {};
  try {
    const cfg = readConfig();
    const netCfg = (cfg[req.network] ?? {}) as Record<string, unknown>;
    for (const field of Object.keys(envSpec)) {
      const v = netCfg[field];
      if (typeof v === "string" && v !== "") cfgHits[field] = v;
    }
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("credentials.json")) throw e;
    // no config file → fall through
  }

  // 3. per-call argument
  const callHits: Record<string, string> = {};
  for (const [field, v] of Object.entries(req.perCall ?? {})) {
    if (typeof v === "string" && v !== "") callHits[field] = v;
  }

  const merged: Record<string, string> = { ...cfgHits, ...envHits, ...callHits };
  const missing = req.requiredFields.filter((f) => merged[f] === undefined);
  if (missing.length > 0) {
    // env precedence documented; report the source layer you could have used
    const order: CredentialSource[] = ["env", "config", "call"];
    const src = order.find((s) => Object.keys(s === "env" ? envHits : s === "config" ? cfgHits : callHits).length > 0);
    const e = new Error(
      `missing credential field(s): ${missing.join(", ")}. Configure via env, ${configFilePath()} (mode 0600), or the per-call credentials argument.`,
    ) as Error & { missing: string[]; source: CredentialSource };
    (e as { missing: string[] }).missing = missing;
    (e as { source: CredentialSource }).source = src ?? "env";
    throw e;
  }

  // source = the highest-priority layer that supplied any required field
  const suppliedBy: CredentialSource[] = [];
  if (req.requiredFields.some((f) => callHits[f] !== undefined)) suppliedBy.push("call");
  if (req.requiredFields.some((f) => envHits[f] !== undefined)) suppliedBy.push("env");
  if (req.requiredFields.some((f) => cfgHits[f] !== undefined)) suppliedBy.push("config");
  const source: CredentialSource = suppliedBy.includes("call")
    ? "call"
    : suppliedBy.includes("env")
      ? "env"
      : "config";

  return { source, values: merged };
}

/** Collect every secret value currently resolvable — used ONLY for redaction. */
export function allSecretValues(): string[] {
  const out: string[] = [];
  for (const spec of Object.values(NETWORK_ENV)) {
    for (const envName of Object.values(spec)) {
      const v = process.env[envName];
      if (v) out.push(v);
    }
  }
  try {
    const cfg = readConfig() as Record<string, Record<string, unknown>>;
    for (const rec of Object.values(cfg)) {
      for (const v of Object.values(rec)) {
        if (typeof v === "string" && v.length > 8) out.push(v);
      }
    }
  } catch {
    // config file absent or unreadable — nothing to redact from it
  }
  return out;
}
