/**
 * Tests de la key-chain de la NIM key (`resolveNvidiaKey` y sus helpers).
 *
 * Cubre la precedencia documentada: env gana / archivo gitignoreado / archivo
 * NO-ignorado rehúsa / nada → error. El guardrail `git check-ignore` se inyecta
 * (`checkIgnored`) para no depender de un repo real, y `process.exit` se mockea
 * para capturar los caminos de aborto sin matar el runner.
 */

import { test, expect, spyOn } from "bun:test"
import { mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  HEIMDALL_ENV_BASENAME,
  parseEnvFile,
  pickNvidiaKey,
  pickNvidiaKeyForEnv,
  findUpwards,
  findRepoRoot,
  findProjectEnvFile,
  agentsKeyFile,
  isOwnerOnly,
  resolveNvidiaKey,
  resolveKeyEnv,
  resolveOpenRouterEnv,
  mergeAgentKeys,
  cmdKeyMigrate,
  cmdModelsFree,
  extractNgcFreeSignals,
  parseNimModelIds,
} from "../src/cli/review.ts"

/** Crea un tmpdir aislado y devuelve su ruta. */
function freshDir(): string {
  return mkdtempSync(join(tmpdir(), "bifrost-keychain-"))
}

/**
 * Tmpdir que se hace pasar por repo (marcador `.git/`), para que el project
 * scope se resuelva por raíz de repo y no por la raíz del filesystem.
 */
function freshRepo(): string {
  const root = freshDir()
  require("node:fs").mkdirSync(join(root, ".git"), { recursive: true })
  return root
}

/** Mockea process.exit para que lance en vez de terminar el runner. */
function trapExit() {
  return spyOn(process, "exit").mockImplementation(((code?: number) => {
    throw new Error(`process.exit(${code})`)
  }) as never)
}

test("parseEnvFile parsea KEY=value, ignora comentarios/vacías y quita comillas", () => {
  const parsed = parseEnvFile(
    ['# comentario', '', 'NVIDIA_API_KEY=nvapi-plain', 'QUOTED="con-comillas"', 'SINGLE=\'simple\''].join(
      "\n",
    ),
  )
  expect(parsed.NVIDIA_API_KEY).toBe("nvapi-plain")
  expect(parsed.QUOTED).toBe("con-comillas")
  expect(parsed.SINGLE).toBe("simple")
  expect(parsed["# comentario"]).toBeUndefined()
})

test("pickNvidiaKey prueba los nombres aceptados en orden", () => {
  expect(pickNvidiaKey({ NVIDIA_API_KEY: "a" })).toBe("a")
  expect(pickNvidiaKey({ NVIDIA_API_KEY_INTERNAL_STAGING: "b" })).toBe("b")
  expect(pickNvidiaKey({ NVIDIA_API_KEY_PUBLIC_PROD: "c" })).toBe("c")
  expect(pickNvidiaKey({ OTRA: "x" })).toBeUndefined()
  // El canónico gana sobre los decorados.
  expect(pickNvidiaKey({ NVIDIA_API_KEY: "canon", NVIDIA_API_KEY_PUBLIC_PROD: "deco" })).toBe(
    "canon",
  )
})

test("findUpwards encuentra el archivo subiendo de un subdir", () => {
  const root = freshDir()
  const sub = join(root, "a", "b")
  require("node:fs").mkdirSync(sub, { recursive: true })
  writeFileSync(join(root, HEIMDALL_ENV_BASENAME), "NVIDIA_API_KEY=x\n")
  expect(findUpwards(HEIMDALL_ENV_BASENAME, sub)).toBe(join(root, HEIMDALL_ENV_BASENAME))
  expect(findUpwards(".otro.env", sub)).toBeUndefined()
})

test("findRepoRoot ancla en el ancestro con .git", () => {
  const root = freshRepo()
  const sub = join(root, "shared", "heimdall", "src")
  require("node:fs").mkdirSync(sub, { recursive: true })
  expect(findRepoRoot(sub)).toBe(root)
  // Sin repo, no hay raíz: el project scope no existe.
  expect(findRepoRoot(freshDir())).toBeUndefined()
})

test("findProjectEnvFile solo mira la raíz del repo (un .heimdall.env en un subdir no cuenta)", () => {
  const root = freshRepo()
  const sub = join(root, "sub")
  require("node:fs").mkdirSync(sub, { recursive: true })
  // Archivo en un subdir: NO es project scope.
  writeFileSync(join(sub, HEIMDALL_ENV_BASENAME), "NVIDIA_API_KEY=sub\n")
  expect(findProjectEnvFile(sub)).toBeUndefined()
  // Archivo en la raíz del repo: sí.
  writeFileSync(join(root, HEIMDALL_ENV_BASENAME), "NVIDIA_API_KEY=root\n")
  expect(findProjectEnvFile(sub)).toBe(join(root, HEIMDALL_ENV_BASENAME))
  // Sin repo no hay project scope, aunque el archivo esté en el cwd.
  const loose = freshDir()
  writeFileSync(join(loose, HEIMDALL_ENV_BASENAME), "NVIDIA_API_KEY=loose\n")
  expect(findProjectEnvFile(loose)).toBeUndefined()
})

test("pickNvidiaKeyForEnv elige la variable del env dentro de un solo archivo", () => {
  const vars = {
    NVIDIA_API_KEY_INTERNAL_STAGING: "nvapi-s",
    NVIDIA_API_KEY_PUBLIC_PROD: "nvapi-p",
  }
  expect(pickNvidiaKeyForEnv(vars, "staging")).toBe("nvapi-s")
  expect(pickNvidiaKeyForEnv(vars, "prod")).toBe("nvapi-p")
  // Canónico como fallback universal.
  expect(pickNvidiaKeyForEnv({ NVIDIA_API_KEY: "canon" }, "prod")).toBe("canon")
  expect(pickNvidiaKeyForEnv({ OTRA: "x" }, "staging")).toBeUndefined()
})

test("resolveNvidiaKey: la variable de entorno gana (no toca el filesystem)", async () => {
  const key = await resolveNvidiaKey({
    env: "staging",
    overrideEnv: { NVIDIA_API_KEY: "nvapi-from-env" },
    cwd: "/nonexistent-dir-should-not-matter",
    checkIgnored: async () => true,
  })
  expect(key).toBe("nvapi-from-env")
})

test("resolveNvidiaKey: lee <repo>/.heimdall.env cuando está gitignoreado", async () => {
  const dir = freshRepo()
  writeFileSync(join(dir, HEIMDALL_ENV_BASENAME), "NVIDIA_API_KEY=nvapi-from-file\n")
  const key = await resolveNvidiaKey({
    env: "staging",
    overrideEnv: {}, // sin NVIDIA_API_KEY en el env
    cwd: dir,
    checkIgnored: async () => true, // guardrail OK
  })
  expect(key).toBe("nvapi-from-file")
})

test("resolveNvidiaKey: un solo archivo sirve staging y prod (nombres decorados)", async () => {
  const dir = freshRepo()
  writeFileSync(
    join(dir, HEIMDALL_ENV_BASENAME),
    "NVIDIA_API_KEY_INTERNAL_STAGING=nvapi-staging\nNVIDIA_API_KEY_PUBLIC_PROD=nvapi-prod\n",
  )
  const staging = await resolveNvidiaKey({
    env: "staging",
    overrideEnv: {},
    cwd: dir,
    checkIgnored: async () => true,
  })
  const prod = await resolveNvidiaKey({
    env: "prod",
    overrideEnv: {},
    cwd: dir,
    checkIgnored: async () => true,
  })
  expect(staging).toBe("nvapi-staging")
  expect(prod).toBe("nvapi-prod")
})

test("resolveNvidiaKey: resuelve el archivo en la raíz aunque el cwd sea un subdir", async () => {
  const root = freshRepo()
  const sub = join(root, "shared", "heimdall")
  require("node:fs").mkdirSync(sub, { recursive: true })
  writeFileSync(join(root, HEIMDALL_ENV_BASENAME), "NVIDIA_API_KEY=nvapi-root\n")
  const key = await resolveNvidiaKey({
    env: "staging",
    overrideEnv: {},
    cwd: sub,
    checkIgnored: async () => true,
  })
  expect(key).toBe("nvapi-root")
})

test("resolveNvidiaKey: sin repo, un .heimdall.env en el cwd NO cuenta como project scope", async () => {
  const loose = freshDir() // sin .git
  writeFileSync(join(loose, HEIMDALL_ENV_BASENAME), "NVIDIA_API_KEY=nvapi-loose\n")
  const home = freshRepo()
  const agentsDir = join(home, ".agents")
  require("node:fs").mkdirSync(agentsDir, { recursive: true })
  const f = join(agentsDir, ".heimdall.env")
  writeFileSync(f, "NVIDIA_API_KEY=nvapi-agents\n")
  require("node:fs").chmodSync(f, 0o600)
  const key = await resolveNvidiaKey({
    env: "staging",
    overrideEnv: {},
    cwd: loose,
    checkIgnored: async () => true,
    platform: "linux",
    homeDir: home,
  })
  expect(key).toBe("nvapi-agents")
})

test("resolveNvidiaKey: REHÚSA si el archivo del repo existe pero NO está gitignoreado", async () => {
  const dir = freshRepo()
  writeFileSync(join(dir, HEIMDALL_ENV_BASENAME), "NVIDIA_API_KEY=nvapi-leak\n")
  const exitSpy = trapExit()
  try {
    await expect(
      resolveNvidiaKey({
        env: "staging",
        overrideEnv: {},
        cwd: dir,
        checkIgnored: async () => false, // NO ignorado → debe rehusar
      }),
    ).rejects.toThrow("process.exit(1)")
  } finally {
    exitSpy.mockRestore()
  }
})

test("resolveNvidiaKey: error claro cuando no hay env ni archivo", async () => {
  const dir = freshRepo() // repo sin .heimdall.env
  const exitSpy = trapExit()
  try {
    await expect(
      resolveNvidiaKey({
        env: "staging",
        overrideEnv: {},
        cwd: dir,
        checkIgnored: async () => true,
        platform: "linux",
        homeDir: freshDir(), // user scope vacío: no existe ~/.agents/.heimdall.env
      }),
    ).rejects.toThrow("process.exit(1)")
  } finally {
    exitSpy.mockRestore()
  }
})

test("resolveKeyEnv: --env, HEIMDALL_NVIDIA_ENV y default staging", () => {
  expect(resolveKeyEnv({ env: "prod" }, {})).toBe("prod")
  expect(resolveKeyEnv({}, { HEIMDALL_NVIDIA_ENV: "prod" })).toBe("prod")
  expect(resolveKeyEnv({}, {})).toBe("staging")
  // --env gana sobre la env var.
  expect(resolveKeyEnv({ env: "staging" }, { HEIMDALL_NVIDIA_ENV: "prod" })).toBe("staging")
})

test("resolveOpenRouterEnv: flag, env propia, herencia de NVIDIA", () => {
  expect(resolveOpenRouterEnv({ "openrouter-env": "prod" }, "staging", {})).toBe("prod")
  expect(resolveOpenRouterEnv({}, "staging", { HEIMDALL_OPENROUTER_ENV: "prod" })).toBe("prod")
  expect(resolveOpenRouterEnv({}, "prod", {})).toBe("prod")
  expect(resolveOpenRouterEnv({}, "staging", {})).toBe("staging")
})

test("resolveKeyEnv: --env inválido aborta", () => {
  const exitSpy = trapExit()
  try {
    expect(() => resolveKeyEnv({ env: "qa" }, {})).toThrow("process.exit(1)")
  } finally {
    exitSpy.mockRestore()
  }
})

test("agentsKeyFile resuelve rutas por plataforma (un solo archivo)", () => {
  expect(agentsKeyFile({ platform: "linux", homeDir: "/home/u" })).toBe(
    "/home/u/.agents/.heimdall.env",
  )
  expect(agentsKeyFile({ platform: "darwin", homeDir: "/Users/u" })).toBe(
    "/Users/u/.agents/.heimdall.env",
  )
  expect(
    agentsKeyFile({ platform: "win32", localAppData: "C:\\Users\\u\\AppData\\Local" }),
  ).toBe(join("C:\\Users\\u\\AppData\\Local", ".agents", ".heimdall.env"))
  expect(
    agentsKeyFile({
      platform: "win32",
      localAppData: undefined,
      userProfile: "C:\\Users\\u",
    }),
  ).toBe(join("C:\\Users\\u", ".agents", ".heimdall.env"))
  expect(
    agentsKeyFile({ platform: "win32", localAppData: undefined, userProfile: undefined }),
  ).toBeUndefined()
})

test("isOwnerOnly exige 0600 en POSIX", () => {
  const dir = freshDir()
  const okFile = join(dir, "ok.env")
  const openFile = join(dir, "open.env")
  writeFileSync(okFile, "NVIDIA_API_KEY=x\n")
  writeFileSync(openFile, "NVIDIA_API_KEY=x\n")
  require("node:fs").chmodSync(okFile, 0o600)
  require("node:fs").chmodSync(openFile, 0o644)
  expect(isOwnerOnly(okFile, { platform: "linux" })).toBe(true)
  expect(isOwnerOnly(openFile, { platform: "linux" })).toBe(false)
  expect(isOwnerOnly(join(dir, "no-existe.env"), { platform: "linux" })).toBe(false)
})

test("isOwnerOnly en Windows exige ubicación bajo el perfil", () => {
  const base = "C:\\Users\\u\\AppData\\Local"
  expect(
    isOwnerOnly(base + "\\.agents\\.heimdall.env", {
      platform: "win32",
      localAppData: base,
    }),
  ).toBe(true)
  expect(
    isOwnerOnly("D:\\compartido\\.heimdall.env", {
      platform: "win32",
      localAppData: base,
    }),
  ).toBe(false)
})

test("resolveNvidiaKey: cae a ~/.agents/.heimdall.env cuando no hay env ni archivo en el repo", async () => {
  const home = freshDir()
  const agentsDir = join(home, ".agents")
  require("node:fs").mkdirSync(agentsDir, { recursive: true })
  const f = join(agentsDir, ".heimdall.env")
  writeFileSync(f, "NVIDIA_API_KEY_INTERNAL_STAGING=nvapi-agents\n")
  require("node:fs").chmodSync(f, 0o600)
  const key = await resolveNvidiaKey({
    env: "staging",
    overrideEnv: {},
    cwd: freshDir(), // repo limpio, sin .heimdall.env
    checkIgnored: async () => true,
    platform: "linux",
    homeDir: home,
  })
  expect(key).toBe("nvapi-agents")
})

test("resolveNvidiaKey: en prod lee la decorada PROD del mismo archivo", async () => {
  const home = freshDir()
  const agentsDir = join(home, ".agents")
  require("node:fs").mkdirSync(agentsDir, { recursive: true })
  const f = join(agentsDir, ".heimdall.env")
  writeFileSync(
    f,
    "NVIDIA_API_KEY_INTERNAL_STAGING=nvapi-staging\nNVIDIA_API_KEY_PUBLIC_PROD=nvapi-prod\n",
  )
  require("node:fs").chmodSync(f, 0o600)
  const key = await resolveNvidiaKey({
    env: "prod",
    overrideEnv: {},
    cwd: freshDir(),
    checkIgnored: async () => true,
    platform: "linux",
    homeDir: home,
  })
  expect(key).toBe("nvapi-prod")
})

test("resolveNvidiaKey: REHÚSA ~/.agents/.heimdall.env permisivo aunque tenga key", async () => {
  const home = freshDir()
  const agentsDir = join(home, ".agents")
  require("node:fs").mkdirSync(agentsDir, { recursive: true })
  const f = join(agentsDir, ".heimdall.env")
  writeFileSync(f, "NVIDIA_API_KEY=nvapi-leak\n")
  require("node:fs").chmodSync(f, 0o644)
  const exitSpy = trapExit()
  try {
    await expect(
      resolveNvidiaKey({
        env: "staging",
        overrideEnv: {},
        cwd: freshDir(),
        checkIgnored: async () => true,
        platform: "linux",
        homeDir: home,
      }),
    ).rejects.toThrow("process.exit(1)")
  } finally {
    exitSpy.mockRestore()
  }
})

test("resolveNvidiaKey: el archivo del repo gana sobre ~/.agents", async () => {
  const dir = freshRepo()
  writeFileSync(join(dir, HEIMDALL_ENV_BASENAME), "NVIDIA_API_KEY=nvapi-repo\n")
  const home = freshDir()
  const agentsDir = join(home, ".agents")
  require("node:fs").mkdirSync(agentsDir, { recursive: true })
  const f = join(agentsDir, ".heimdall.env")
  writeFileSync(f, "NVIDIA_API_KEY=nvapi-agents\n")
  require("node:fs").chmodSync(f, 0o600)
  const key = await resolveNvidiaKey({
    env: "staging",
    overrideEnv: {},
    cwd: dir,
    checkIgnored: async () => true,
    platform: "linux",
    homeDir: home,
  })
  expect(key).toBe("nvapi-repo")
})

test("mergeAgentKeys: archivo nuevo trae header + keys pedidas", () => {
  const body = mergeAgentKeys(
    undefined,
    new Map([["NVIDIA_API_KEY_INTERNAL_STAGING", "nvapi-s"]]),
  )
  expect(body).toContain("# Heimdall provider keys")
  expect(body).toContain("NVIDIA_API_KEY_INTERNAL_STAGING=nvapi-s")
  expect(body.endsWith("\n")).toBe(true)
})

test("mergeAgentKeys: preserva el otro env y rota la key del mismo env", () => {
  const prev = [
    "# Heimdall provider keys",
    "NVIDIA_API_KEY_PUBLIC_PROD=nvapi-old-prod",
    "NVIDIA_API_KEY_INTERNAL_STAGING=nvapi-old-staging",
    "",
  ].join("\n")
  const body = mergeAgentKeys(prev, new Map([["NVIDIA_API_KEY_INTERNAL_STAGING", "nvapi-new"]]))
  expect(body).toContain("NVIDIA_API_KEY_PUBLIC_PROD=nvapi-old-prod")
  expect(body).toContain("NVIDIA_API_KEY_INTERNAL_STAGING=nvapi-new")
  expect(body).not.toContain("nvapi-old-staging")
})

/** Captura console.log durante `fn` y devuelve todo lo impreso unido. */
async function captureLog(fn: () => Promise<void>): Promise<string> {
  const lines: string[] = []
  const spy = spyOn(console, "log").mockImplementation(((...args: unknown[]) => {
    lines.push(args.map(String).join(" "))
  }) as never)
  try {
    await fn()
  } finally {
    spy.mockRestore()
  }
  return lines.join("\n")
}

test("cmdKeyMigrate: mueve la key del repo a ~/.agents/.heimdall.env sin borrar el original", async () => {
  const fs = require("node:fs")
  const repo = freshRepo()
  writeFileSync(join(repo, HEIMDALL_ENV_BASENAME), "NVIDIA_API_KEY=nvapi-SECRETO-123\n")
  const home = freshDir()
  const out = await captureLog(() =>
    cmdKeyMigrate({ env: "staging" }, { cwd: repo, platform: "linux", homeDir: home, checkIgnored: async () => true }),
  )
  const dest = join(home, ".agents", ".heimdall.env")
  const content = fs.readFileSync(dest, "utf8") as string
  expect(content).toContain("NVIDIA_API_KEY_INTERNAL_STAGING=nvapi-SECRETO-123")
  // El original sigue en su lugar; el comando solo sugiere el rm.
  expect(fs.existsSync(join(repo, HEIMDALL_ENV_BASENAME))).toBe(true)
  expect(out).toContain("rm \"")
  expect(out).toContain(HEIMDALL_ENV_BASENAME)
  // El valor NUNCA se imprime.
  expect(out).not.toContain("nvapi-SECRETO-123")
  // Permisos solo-dueno post-escritura.
  expect(isOwnerOnly(dest, { platform: "linux" })).toBe(true)
})

test("cmdKeyMigrate: --env prod toma la key PROD del mismo archivo, no la de staging", async () => {
  const fs = require("node:fs")
  const repo = freshRepo()
  writeFileSync(
    join(repo, HEIMDALL_ENV_BASENAME),
    "NVIDIA_API_KEY=nvapi-canon\nNVIDIA_API_KEY_PUBLIC_PROD=nvapi-prod\n",
  )
  const home = freshDir()
  await cmdKeyMigrate(
    { env: "prod" },
    { cwd: repo, platform: "linux", homeDir: home, checkIgnored: async () => true },
  )
  const content = fs.readFileSync(join(home, ".agents", ".heimdall.env"), "utf8") as string
  expect(content).toContain("NVIDIA_API_KEY_PUBLIC_PROD=nvapi-prod")
  expect(content).not.toContain("nvapi-canon")
})

test("cmdKeyMigrate: preserva la key del otro env ya guardada", async () => {
  const fs = require("node:fs")
  const repo = freshRepo()
  writeFileSync(join(repo, HEIMDALL_ENV_BASENAME), "NVIDIA_API_KEY=nvapi-staging\n")
  const home = freshDir()
  const agentsDir = join(home, ".agents")
  fs.mkdirSync(agentsDir, { recursive: true })
  writeFileSync(join(agentsDir, ".heimdall.env"), "NVIDIA_API_KEY_PUBLIC_PROD=nvapi-prod\n")
  fs.chmodSync(join(agentsDir, ".heimdall.env"), 0o600)
  await cmdKeyMigrate({ env: "staging" }, { cwd: repo, platform: "linux", homeDir: home, checkIgnored: async () => true })
  const content = fs.readFileSync(join(agentsDir, ".heimdall.env"), "utf8") as string
  expect(content).toContain("NVIDIA_API_KEY_PUBLIC_PROD=nvapi-prod")
  expect(content).toContain("NVIDIA_API_KEY_INTERNAL_STAGING=nvapi-staging")
})

test("cmdKeyMigrate: REHÚSA si el archivo del repo NO está gitignoreado", async () => {
  const repo = freshRepo()
  writeFileSync(join(repo, HEIMDALL_ENV_BASENAME), "NVIDIA_API_KEY=nvapi-leak\n")
  const exitSpy = trapExit()
  try {
    await expect(
      cmdKeyMigrate({ env: "staging" }, { cwd: repo, platform: "linux", homeDir: freshDir(), checkIgnored: async () => false }),
    ).rejects.toThrow("process.exit(1)")
  } finally {
    exitSpy.mockRestore()
  }
})

test("cmdKeyMigrate: falla claro si no hay archivo en la raíz del repo", async () => {
  const exitSpy = trapExit()
  try {
    await expect(
      cmdKeyMigrate({ env: "staging" }, { cwd: freshRepo(), platform: "linux", homeDir: freshDir(), checkIgnored: async () => true }),
    ).rejects.toThrow("process.exit(1)")
  } finally {
    exitSpy.mockRestore()
  }
})

test("parseNimModelIds extrae ids y tolera payloads raros", () => {
  expect(
    parseNimModelIds({ object: "list", data: [{ id: "a/m1" }, { id: "b/m2" }, {}] }),
  ).toEqual(["a/m1", "b/m2"])
  expect(parseNimModelIds({})).toEqual([])
  expect(parseNimModelIds(null)).toEqual([])
})

test("extractNgcFreeSignals acepta array o mapa y solo emite filas con señal", () => {
  const payload = {
    resources: [
      { resourceId: "org/preview-model", tags: ["nim_type_preview", "chat"] },
      { name: "org/free-model", labels: ["Free", "chat"] },
      { resourceId: "org/plain", tags: ["chat"] },
      { tags: ["free"] },
      "basura",
    ],
  }
  const sigs = extractNgcFreeSignals(payload)
  expect(sigs).toContainEqual({ id: "org/preview-model", free: undefined, preview: true })
  expect(sigs).toContainEqual({ id: "org/free-model", free: true, preview: undefined })
  expect(sigs.some((s) => s.id === "org/plain")).toBe(false)
  expect(extractNgcFreeSignals([{ id: "x/y", tags: ["preview"] }])).toEqual([
    { id: "x/y", free: undefined, preview: true },
  ])
})

/** fetch stub por prefijo de URL para `cmdModelsFree` (nunca toca la red). */
function stubFetch(routes: Record<string, { status: number; body: unknown }>) {
  return (async (url: string): Promise<Response> => {
    const hit = Object.entries(routes).find(([prefix]) => url.startsWith(prefix))?.[1]
    const status = hit?.status ?? 404
    return new Response(JSON.stringify(hit?.body ?? {}), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  }) as typeof fetch
}

const NIM_OK = { object: "list", data: [{ id: "org/preview-model" }, { id: "org/plain" }] }
const NGC_OK = {
  resources: [{ resourceId: "org/preview-model", tags: ["nim_type_preview"] }],
}

test("cmdModelsFree: cruza NIM con tags NGC y nunca imprime la key", async () => {
  const out = await captureLog(() =>
    cmdModelsFree(
      {},
      {
        fetchFn: stubFetch({
          "https://integrate.api.nvidia.com/v1/models": { status: 200, body: NIM_OK },
          "https://api.ngc.nvidia.com/v2/resources": { status: 200, body: NGC_OK },
        }),
        resolveKey: async () => "nvapi-SECRETO-456",
      },
    ),
  )
  expect(out).toContain("key OK (env=staging)")
  expect(out).toContain("org/preview-model")
  expect(out).toContain("org/plain")
  expect(out).toContain("ngc-tags")
  expect(out).toContain("preview: 1")
  expect(out).not.toContain("nvapi-SECRETO-456")
})

test("cmdModelsFree: si NGC falla, degrada a ? con AVISO pero lista NIM", async () => {
  const out = await captureLog(() =>
    cmdModelsFree(
      {},
      {
        fetchFn: stubFetch({
          "https://integrate.api.nvidia.com/v1/models": { status: 200, body: NIM_OK },
        }),
        resolveKey: async () => "nvapi-k",
      },
    ),
  )
  expect(out).toContain("AVISO")
  expect(out).toContain("org/plain")
  expect(out).toContain("nim-only")
})

test("cmdModelsFree: --match filtra y --json emite filas", async () => {
  const out = await captureLog(() =>
    cmdModelsFree(
      { match: "plain", json: true },
      {
        fetchFn: stubFetch({
          "https://integrate.api.nvidia.com/v1/models": { status: 200, body: NIM_OK },
          "https://api.ngc.nvidia.com/v2/resources": { status: 200, body: NGC_OK },
        }),
        resolveKey: async () => "nvapi-k",
      },
    ),
  )
  const rows = JSON.parse(out) as Array<{ id: string }>
  expect(rows.map((r) => r.id)).toEqual(["org/plain"])
})
