/**
 * Tests del soporte de GitHub App (`src/lib/github-app.ts`), sin red.
 *
 * Cubre: firma JWT RS256 (verificable con la public key), resolución de config
 * con precedencia user→repo→env, y el flujo de obtención del installation token
 * (fetch mockeado). NUNCA toca la red.
 */

import { test, expect, mock } from "bun:test"
import { generateKeyPairSync } from "node:crypto"
import { mkdtempSync, writeFileSync, chmodSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  resolveGithubAppConfig,
  signAppJwt,
  getGithubAppToken,
  fetchInstallationId,
  fetchInstallationToken,
  GITHUB_APP_ID_ENV,
  GITHUB_APP_KEY_ENV,
  GITHUB_APP_INSTALLATION_ID_ENV,
} from "../src/lib/github-app.ts"

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
})

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), "bifrost-githubapp-"))
}

function freshPem(): string {
  const dir = freshDir()
  const f = join(dir, "app.pem")
  writeFileSync(f, privateKey)
  chmodSync(f, 0o600)
  return f
}

function decodeJwtParts(token: string): { header: Record<string, unknown>; payload: Record<string, unknown> } {
  const [h, p] = token.split(".")
  const header = JSON.parse(Buffer.from(h, "base64url").toString("utf8"))
  const payload = JSON.parse(Buffer.from(p, "base64url").toString("utf8"))
  return { header, payload }
}

test("signAppJwt genera un JWT RS256 con iss=appId y ventana de exp", () => {
  const now = Math.floor(Date.now() / 1000)
  const jwt = signAppJwt("123456", privateKey, now)
  const { header, payload } = decodeJwtParts(jwt)
  expect(header.alg).toBe("RS256")
  expect(header.typ).toBe("JWT")
  expect(payload.iss).toBe("123456")
  expect(payload.iat).toBe(now)
  expect(payload.exp).toBe(now + 5 * 60)
  // La firma debe verificarse con la public key.
  const { createVerify } = require("node:crypto") as typeof import("node:crypto")
  const [h, p, s] = jwt.split(".")
  const verifier = createVerify("RSA-SHA256")
  verifier.update(`${h}.${p}`)
  verifier.end()
  expect(verifier.verify(publicKey, Buffer.from(s, "base64url"))).toBe(true)
})

test("resolveGithubAppConfig: lee de env cuando no hay user/repo", () => {
  const cfg = resolveGithubAppConfig({
    overrideEnv: {
      [GITHUB_APP_ID_ENV]: "123456",
      [GITHUB_APP_KEY_ENV]: "/tmp/app.pem",
      [GITHUB_APP_INSTALLATION_ID_ENV]: "77",
    },
    homeDir: freshDir(), // sin ~/.agents
    cwd: freshDir(), // sin repo
  })
  expect(cfg).toEqual({ appId: "123456", pemPath: "/tmp/app.pem", installationId: 77 })
})

test("resolveGithubAppConfig: user ~/.agents gana sobre env", () => {
  const home = freshDir()
  const agentsDir = join(home, ".agents")
  require("node:fs").mkdirSync(agentsDir, { recursive: true })
  const f = join(agentsDir, ".heimdall.env")
  writeFileSync(
    f,
    `${GITHUB_APP_ID_ENV}=user-app\n${GITHUB_APP_KEY_ENV}=/home/user.pem\n`,
  )
  chmodSync(f, 0o600)
  const cfg = resolveGithubAppConfig({
    overrideEnv: {
      [GITHUB_APP_ID_ENV]: "env-app",
      [GITHUB_APP_KEY_ENV]: "/tmp/env.pem",
    },
    homeDir: home,
    cwd: freshDir(),
  })
  expect(cfg?.appId).toBe("user-app")
  expect(cfg?.pemPath).toBe("/home/user.pem")
})

test("resolveGithubAppConfig: devuelve undefined sin appId ni pem", () => {
  const cfg = resolveGithubAppConfig({ overrideEnv: {}, homeDir: freshDir(), cwd: freshDir() })
  expect(cfg).toBeUndefined()
})

test("fetchInstallationId y fetchInstallationToken usan el Bearer y parsean", async () => {
  const jwt = "fake-jwt"
  let capturedUrl = ""
  let capturedAuth = ""
  const fetchMock = mock(async (url: string, init: RequestInit) => {
    capturedUrl = url
    capturedAuth = (init.headers as Record<string, string>).Authorization
    if (url.includes("/access_tokens")) {
      return new Response(JSON.stringify({ token: "install-token-abc" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }
    return new Response(JSON.stringify({ id: 4242 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  })
  // @ts-expect-error - reemplazo global para el test
  globalThis.fetch = fetchMock

  const installationId = await fetchInstallationId(jwt, "owner", "repo")
  expect(installationId).toBe(4242)
  expect(capturedAuth).toBe(`Bearer ${jwt}`)
  expect(capturedUrl).toContain("/repos/owner/repo/installation")

  const token = await fetchInstallationToken(jwt, 4242)
  expect(token).toBe("install-token-abc")
  expect(capturedUrl).toContain("/app/installations/4242/access_tokens")
})

test("getGithubAppToken resuelve config, firma JWT y devuelve el token", async () => {
  const pem = freshPem()
  const home = freshDir()
  const agentsDir = join(home, ".agents")
  require("node:fs").mkdirSync(agentsDir, { recursive: true })
  const f = join(agentsDir, ".heimdall.env")
  writeFileSync(f, `${GITHUB_APP_ID_ENV}=987\n${GITHUB_APP_KEY_ENV}=${pem}\n`)
  chmodSync(f, 0o600)

  let authSeen = ""
  const fetchMock = mock(async (url: string, init: RequestInit) => {
    authSeen = (init.headers as Record<string, string>).Authorization
    if (url.includes("/access_tokens")) {
      return new Response(JSON.stringify({ token: "install-token-xyz" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }
    return new Response(JSON.stringify({ id: 31337 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  })
  // @ts-expect-error - reemplazo global para el test
  globalThis.fetch = fetchMock

  const { token, appId } = await getGithubAppToken("owner", "repo", {
    homeDir: home,
    cwd: freshDir(),
    overrideEnv: {},
  })
  expect(token).toBe("install-token-xyz")
  expect(appId).toBe("987")
  // El Bearer debe ser un JWT con 3 segmentos (header.payload.signature).
  expect(authSeen.startsWith("Bearer ")).toBe(true)
  const jwt = authSeen.slice("Bearer ".length)
  expect(jwt.split(".")).toHaveLength(3)
})

test("getGithubAppToken lanza error claro cuando la App no está configurada", async () => {
  await expect(
    getGithubAppToken("owner", "repo", { homeDir: freshDir(), cwd: freshDir(), overrideEnv: {} }),
  ).rejects.toThrow(/no configurada|HEIMDALL_GITHUB_APP_ID/)
})
