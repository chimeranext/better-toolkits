/**
 * Tests del adapter OpenCode opencode-qa-prod-guard.ts (union de origenes +
 * consumo single-use del token). Corre con `bun test` (sin red, sin plugin
 * real — se stubea @opencode-ai/plugin).
 */
import { test, expect, beforeEach, afterEach, mock } from "bun:test"
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, chmodSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"

mock.module("@opencode-ai/plugin", () => ({
  Plugin: { define: (x: unknown) => x },
}))

const { default: plugin } = await import("../adapters/opencode-qa-prod-guard.ts")

let hookFn: ((event: any) => void) | null = null
let repo = ""

async function setupHook() {
  hookFn = null
  await (plugin as any).setup({
    tool: { hook: async (_n: string, fn: any) => { hookFn = fn } },
  })
}

function run(tool: string, input: unknown): { blocked: boolean; msg: string } {
  try {
    hookFn!({ tool, input })
    return { blocked: false, msg: "" }
  } catch (e) {
    return { blocked: true, msg: (e as Error).message }
  }
}

beforeEach(async () => {
  repo = mkdtempSync(join(tmpdir(), "qa-guard-"))
  mkdirSync(join(repo, ".claude", "qa"), { recursive: true })
  mkdirSync(join(repo, "docs", "qa", "rounds", "p1-test"), { recursive: true })
  process.env.CLAUDE_PROJECT_DIR = repo
  delete process.env.MNM_QA_ORIGIN
  await setupHook()
})

afterEach(() => {
  delete process.env.CLAUDE_PROJECT_DIR
  delete process.env.MNM_QA_ORIGIN
})

const CONTRACT = {
  prodOrigins: ["prod.example.com"],
  mutatingToolPatterns: ["^browser_click$"],
  armedTokenSearchRoot: "docs/qa/rounds",
  armedTokenFilename: ".write-armed",
}

test("sin contrato -> allow", () => {
  const r = run("browser_click", { url: "https://prod.example.com/x" })
  expect(r.blocked).toBe(false)
})

test("tool no-mutante -> allow", () => {
  writeFileSync(join(repo, ".claude", "qa", "prod-origins.json"), JSON.stringify(CONTRACT))
  const r = run("browser_navigate", { url: "https://prod.example.com/x" })
  expect(r.blocked).toBe(false)
})

test("env PROD + URL no-PROD -> BLOCK (union real)", () => {
  writeFileSync(join(repo, ".claude", "qa", "prod-origins.json"), JSON.stringify(CONTRACT))
  process.env.MNM_QA_ORIGIN = "https://prod.example.com/dashboard"
  const r = run("browser_click", { url: "https://staging.example.com/x" })
  expect(r.blocked).toBe(true)
  expect(r.msg).toContain("MNM_QA_ORIGIN")
})

test("archivo PROD + URL no-PROD -> BLOCK", () => {
  const c = { ...CONTRACT, currentOriginFile: ".claude/qa/.current-origin" }
  writeFileSync(join(repo, ".claude", "qa", "prod-origins.json"), JSON.stringify(c))
  writeFileSync(join(repo, ".claude", "qa", ".current-origin"), "https://prod.example.com/y\n")
  const r = run("browser_click", { url: "https://staging.example.com/x" })
  expect(r.blocked).toBe(true)
})

test("token valido -> allow UNA vez y consume", () => {
  writeFileSync(join(repo, ".claude", "qa", "prod-origins.json"), JSON.stringify(CONTRACT))
  const tok = join(repo, "docs", "qa", "rounds", "p1-test", ".write-armed")
  writeFileSync(tok, "allow click login button")
  const r1 = run("browser_click", { url: "https://prod.example.com/x" })
  expect(r1.blocked).toBe(false)
  expect(existsSync(tok)).toBe(false)
  const r2 = run("browser_click", { url: "https://prod.example.com/x" })
  expect(r2.blocked).toBe(true)
})

test("rename imposible -> BLOCK (no via libre)", () => {
  writeFileSync(join(repo, ".claude", "qa", "prod-origins.json"), JSON.stringify(CONTRACT))
  const dir = join(repo, "docs", "qa", "rounds", "p1-test")
  const tok = join(dir, ".write-armed")
  writeFileSync(tok, "allow click login button")
  chmodSync(dir, 0o555)
  let r: { blocked: boolean; msg: string }
  try {
    r = run("browser_click", { url: "https://prod.example.com/x" })
  } finally {
    chmodSync(dir, 0o755)
  }
  expect(r!.blocked).toBe(true)
  expect(r!.msg).toContain("could not be consumed")
})

test("PROD sin token -> BLOCK con mensaje", () => {
  writeFileSync(join(repo, ".claude", "qa", "prod-origins.json"), JSON.stringify(CONTRACT))
  const r = run("browser_click", { url: "https://prod.example.com/x" })
  expect(r.blocked).toBe(true)
  expect(r.msg).toContain("BLOCKED")
})
