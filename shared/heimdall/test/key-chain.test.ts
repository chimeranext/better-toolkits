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
  parseEnvFile,
  pickNvidiaKey,
  findUpwards,
  resolveNvidiaKey,
  resolveKeyEnv,
} from "../src/cli/review.ts"

/** Crea un tmpdir aislado y devuelve su ruta. */
function freshDir(): string {
  return mkdtempSync(join(tmpdir(), "bifrost-keychain-"))
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
  writeFileSync(join(root, ".staging.nvidia.env"), "NVIDIA_API_KEY=x\n")
  expect(findUpwards(".staging.nvidia.env", sub)).toBe(join(root, ".staging.nvidia.env"))
  expect(findUpwards(".prod.nvidia.env", sub)).toBeUndefined()
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

test("resolveNvidiaKey: cae al archivo .{env}.nvidia.env cuando está gitignoreado", async () => {
  const dir = freshDir()
  writeFileSync(join(dir, ".staging.nvidia.env"), "NVIDIA_API_KEY=nvapi-from-file\n")
  const key = await resolveNvidiaKey({
    env: "staging",
    overrideEnv: {}, // sin NVIDIA_API_KEY en el env
    cwd: dir,
    checkIgnored: async () => true, // guardrail OK
  })
  expect(key).toBe("nvapi-from-file")
})

test("resolveNvidiaKey: acepta el nombre decorado en el archivo", async () => {
  const dir = freshDir()
  writeFileSync(join(dir, ".prod.nvidia.env"), "NVIDIA_API_KEY_PUBLIC_PROD=nvapi-prod\n")
  const key = await resolveNvidiaKey({
    env: "prod",
    overrideEnv: {},
    cwd: dir,
    checkIgnored: async () => true,
  })
  expect(key).toBe("nvapi-prod")
})

test("resolveNvidiaKey: REHÚSA si el archivo existe pero NO está gitignoreado", async () => {
  const dir = freshDir()
  writeFileSync(join(dir, ".staging.nvidia.env"), "NVIDIA_API_KEY=nvapi-leak\n")
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
  const dir = freshDir()
  const exitSpy = trapExit()
  try {
    await expect(
      resolveNvidiaKey({
        env: "staging",
        overrideEnv: {},
        cwd: dir,
        checkIgnored: async () => true,
      }),
    ).rejects.toThrow("process.exit(1)")
  } finally {
    exitSpy.mockRestore()
  }
})

test("resolveKeyEnv: --env, BIFROST_NVIDIA_ENV y default staging", () => {
  expect(resolveKeyEnv({ env: "prod" }, {})).toBe("prod")
  expect(resolveKeyEnv({}, { BIFROST_NVIDIA_ENV: "prod" })).toBe("prod")
  expect(resolveKeyEnv({}, {})).toBe("staging")
  // --env gana sobre la env var.
  expect(resolveKeyEnv({ env: "staging" }, { BIFROST_NVIDIA_ENV: "prod" })).toBe("staging")
})

test("resolveKeyEnv: --env inválido aborta", () => {
  const exitSpy = trapExit()
  try {
    expect(() => resolveKeyEnv({ env: "qa" }, {})).toThrow("process.exit(1)")
  } finally {
    exitSpy.mockRestore()
  }
})
