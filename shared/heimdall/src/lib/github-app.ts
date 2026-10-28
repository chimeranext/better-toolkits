/**
 * GitHub App support for Heimdall — resolve an *installation access token* for
 * a GitHub App (so the posted review is authored by the App, like CodeRabbit /
 * Greptile) instead of by `github-actions[bot]` or a personal token.
 *
 * Credentials are read from the same key-chain as the NIM key
 * (`~/.agents/.heimdall.env` → repo `.heimdall.env` → env), keeping one SSOT.
 * The App's private key (`.pem`) is never printed; only its path lives in the
 * key-chain.
 *
 * Flow (RFC 7662 / GitHub App auth):
 *   1. Load config: App ID + path to private key (+ optional installation id).
 *   2. Sign a JWT (RS256) with the App's private key: `iss` = App ID,
 *      `iat`/`exp` (max 10 min lifetime).
 *   3. Resolve the installation id for {owner,repo} (auto) or use the
 *      configured one. GET /repos/{owner}/{repo}/installation.
 *   4. Exchange the JWT for an installation access token:
 *      POST /app/installations/{id}/access_tokens.
 *   5. Use that token as `Bearer` for the review POST → authored by the App.
 */

import { mkdirSync, readFileSync, statSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import { createPrivateKey, createSign } from "node:crypto"

const API_BASE = "https://api.github.com"
const GITHUB_API_VERSION = "2022-11-28"
const ENV_BASENAME = ".heimdall.env"

/** Env vars that name the GitHub App credentials in the key-chain. */
export const GITHUB_APP_ID_ENV = "HEIMDALL_GITHUB_APP_ID"
export const GITHUB_APP_KEY_ENV = "HEIMDALL_GITHUB_APP_KEY" // path to .pem
export const GITHUB_APP_INSTALLATION_ID_ENV = "HEIMDALL_GITHUB_APP_INSTALLATION_ID"

export interface GithubAppConfig {
  appId: string
  pemPath: string
  installationId?: number
}

export interface GithubAppResolveOpts {
  platform?: NodeJS.Platform
  homeDir?: string
  localAppData?: string | undefined
  userProfile?: string | undefined
  cwd?: string
  overrideEnv?: Record<string, string | undefined>
}

function parseEnvFile(content: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const raw of content.split("\n")) {
    const line = raw.trim()
    if (!line || line.startsWith("#")) continue
    const eq = line.indexOf("=")
    if (eq <= 0) continue
    const key = line.slice(0, eq).trim()
    let val = line.slice(eq + 1).trim()
    if (
      val.length >= 2 &&
      ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
    ) {
      val = val.slice(1, -1)
    }
    out[key] = val
  }
  return out
}

function findUpwards(filename: string, startDir: string): string | undefined {
  let dir = startDir
  for (;;) {
    const candidate = join(dir, filename)
    try {
      if (statSync(candidate).isFile()) return candidate
    } catch {
      /* keep climbing */
    }
    const parent = join(dir, "..")
    if (parent === dir) return undefined
    dir = parent
  }
}

function agentsKeyFile(opts: GithubAppResolveOpts): string | undefined {
  const platform = opts.platform ?? process.platform
  if (platform === "win32") {
    const base =
      opts.localAppData ?? process.env.LOCALAPPDATA ?? opts.userProfile ?? process.env.USERPROFILE
    if (!base) return undefined
    return join(base, ".agents", ENV_BASENAME)
  }
  const home = opts.homeDir ?? homedir()
  if (!home) return undefined
  return join(home, ".agents", ENV_BASENAME)
}

/** Read `~/.agents/.heimdall.env` if present (owner-only guard optional). */
function readAgentsVars(opts: GithubAppResolveOpts): Record<string, string> {
  const file = agentsKeyFile(opts)
  if (!file) return {}
  try {
    return parseEnvFile(readFileSync(file, "utf8"))
  } catch {
    return {}
  }
}

function pick(vars: Record<string, string>, names: string[]): string | undefined {
  for (const n of names) {
    const v = (vars[n] ?? "").trim()
    if (v) return v
  }
  return undefined
}

/** Primer valor no-vacío (trata "" y undefined como ausente). */
function firstNonEmpty(...vals: (string | undefined)[]): string | undefined {
  for (const v of vals) {
    if (v && v.trim()) return v.trim()
  }
  return undefined
}

/**
 * Resolve the GitHub App config with precedence user (`~/.agents`) → repo
 * (`.heimdall.env` at repo root) → env. Returns `undefined` when no App ID is
 * configured anywhere (callers fall back to the classic `GITHUB_TOKEN` path).
 */
export function resolveGithubAppConfig(opts: GithubAppResolveOpts = {}): GithubAppConfig | undefined {
  const env = opts.overrideEnv ?? process.env
  const cwd = opts.cwd ?? process.cwd()
  const appId = pick(env, [GITHUB_APP_ID_ENV])
  const pemPath = pick(env, [GITHUB_APP_KEY_ENV])
  const installRaw = pick(env, [GITHUB_APP_INSTALLATION_ID_ENV]) ?? ""

  const agentsVars = readAgentsVars(opts)
  const agentsAppId = pick(agentsVars, [GITHUB_APP_ID_ENV])
  const agentsPem = pick(agentsVars, [GITHUB_APP_KEY_ENV])
  const agentsInstall = pick(agentsVars, [GITHUB_APP_INSTALLATION_ID_ENV]) ?? ""

  const repoFile = findUpwards(ENV_BASENAME, cwd)
  let repoVars: Record<string, string> = {}
  if (repoFile) {
    try {
      repoVars = parseEnvFile(readFileSync(repoFile, "utf8"))
    } catch {
      repoVars = {}
    }
  }
  const repoAppId = pick(repoVars, [GITHUB_APP_ID_ENV])
  const repoPem = pick(repoVars, [GITHUB_APP_KEY_ENV])
  const repoInstall = pick(repoVars, [GITHUB_APP_INSTALLATION_ID_ENV]) ?? ""

  const id = agentsAppId ?? repoAppId ?? appId
  const pem = agentsPem ?? repoPem ?? pemPath
  if (!id || !pem) return undefined

  const install = firstNonEmpty(agentsInstall, repoInstall, installRaw)
  return {
    appId: id,
    pemPath: pem,
    installationId: install ? Number(install) : undefined,
  }
}

/** Read the App's private key file (PKCS#8). Throws if unreadable. */
export function readAppPrivateKey(pemPath: string): string {
  return readFileSync(pemPath, "utf8")
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url")
}

/**
 * Sign a JWT (RS256) with the App's private key. `iss` = App ID; lifetime of
 * 5 minutes (GitHub caps at 10). Deterministic and pure given the inputs.
 */
export function signAppJwt(appId: string, privateKeyPem: string, nowSec = Math.floor(Date.now() / 1000)): string {
  const header = { alg: "RS256", typ: "JWT" }
  const payload = { iat: nowSec, exp: nowSec + 5 * 60, iss: appId }
  const unsigned = `${b64url(Buffer.from(JSON.stringify(header)))}.${b64url(
    Buffer.from(JSON.stringify(payload)),
  )}`
  const key = createPrivateKey(privateKeyPem)
  const signer = createSign("RSA-SHA256")
  signer.update(unsigned)
  signer.end()
  const sig = signer.sign(key).toString("base64url")
  return `${unsigned}.${sig}`
}

async function api<T>(path: string, jwt: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": GITHUB_API_VERSION,
      Authorization: `Bearer ${jwt}`,
      ...(init.headers ?? {}),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GitHub API ${init.method ?? "GET"} ${path} → ${res.status} ${text.slice(0, 300)}`)
  }
  return (await res.json()) as T
}

/** Resolve the installation id for {owner,repo}. GET /repos/{o}/{r}/installation. */
export async function fetchInstallationId(jwt: string, owner: string, repo: string): Promise<number> {
  const data = await api<{ id: number }>(`/repos/${owner}/${repo}/installation`, jwt)
  return data.id
}

/** Exchange the JWT for an installation access token (authored as the App). */
export async function fetchInstallationToken(jwt: string, installationId: number): Promise<string> {
  const data = await api<{ token: string }>(
    `/app/installations/${installationId}/access_tokens`,
    jwt,
    { method: "POST" },
  )
  return data.token
}

/**
 * Convenience: resolve config → sign JWT → resolve installation (auto or from
 * config) → return the installation access token. Throws with a clear message
 * on any auth/network failure.
 */
export async function getGithubAppToken(
  owner: string,
  repo: string,
  opts: GithubAppResolveOpts = {},
): Promise<{ token: string; appId: string }> {
  const config = resolveGithubAppConfig(opts)
  if (!config) {
    throw new Error(
      `GitHub App no configurada. Seteá ${GITHUB_APP_ID_ENV} y ${GITHUB_APP_KEY_ENV} ` +
        `en ~/.agents/.heimdall.env (o repo .heimdall.env / env), y usá --github-app.`,
    )
  }
  const pem = readAppPrivateKey(config.pemPath)
  const jwt = signAppJwt(config.appId, pem)
  const installationId =
    config.installationId ?? (await fetchInstallationId(jwt, owner, repo))
  const token = await fetchInstallationToken(jwt, installationId)
  return { token, appId: config.appId }
}
