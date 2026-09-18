/**
 * OpenCode V2 plugin — block browser-driven MUTATIONS against PRODUCTION
 * origins unless a human has armed them.
 * Disable with plugins: ["-local.mnm-qa-prod-guard"],
 * MNM_DISABLE_QA_GUARD=1, or the global CLAUDE_DISABLE_PLUGIN_HOOKS=1.
 *
 * Mirrors hooks/qa/pre-tool-prod-write-guard.sh (keep in sync). Contract:
 * `.claude/qa/prod-origins.json` in the consumer repo; no contract ->
 * no-op (fail open, like the .sh hook).
 *
 * Logic (same as .sh):
 *   1. Tool not browser-mutating per `mutatingToolPatterns` -> allow.
 *      NOTE: patterns are matched against OpenCode tool ids, so adapt them
 *      to your harness (e.g. `mcp_playwright_browser_click`). The shipped
 *      example targets Claude MCP names.
 *   2. Page origin not PROD -> allow (local-first rounds run unimpeded).
 *      Origin is the UNION of: the call's own url, $MNM_QA_ORIGIN,
 *      `.claude/qa/.current-origin`, and a URL-shaped scan of the
 *      serialized tool_input. Any one naming a PROD host blocks.
 *   3. PROD + no armed token -> throw (block).
 *   4. PROD + armed token -> allow ONCE and consume it
 *      (`<name>.consumed-<epoch>`). Env $MNM_QA_ARMED_TOKEN may point at it.
 */
import { Plugin } from "@opencode-ai/plugin"
import { existsSync, readFileSync, readdirSync, renameSync, statSync } from "node:fs"
import { join } from "node:path"

function disabled(): boolean {
  return (
    process.env.MNM_DISABLE_QA_GUARD === "1" ||
    process.env.CLAUDE_DISABLE_PLUGIN_HOOKS === "1"
  )
}

function str(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function repoRoot(): string {
  const envRoot = process.env.CLAUDE_PROJECT_DIR ?? ""
  if (envRoot && existsSync(envRoot)) return envRoot
  return process.cwd()
}

function loadContract(): Record<string, unknown> | null {
  const path = join(repoRoot(), ".claude", "qa", "prod-origins.json")
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, "utf8"))
    if (parsed && typeof parsed === "object")
      return parsed as Record<string, unknown>
  } catch {
    // fail open
  }
  return null
}

function escapeRe(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function hostOf(raw: string): string {
  let host = raw.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, "")
  host = host.split("/")[0].split("?")[0].split(":")[0]
  if (host.includes("@")) host = host.split("@").pop() ?? ""
  return host.trim()
}

/** Resolve PROD origin from the union of sources (mirrors the .sh hook). */
function resolveProdOrigin(
  contract: Record<string, unknown>,
  toolInput: Record<string, unknown>,
  raw: string,
): { host: string; source: string } | null {
  const prodOrigins = Array.isArray(contract.prodOrigins)
    ? contract.prodOrigins.map(String).filter(Boolean)
    : []
  if (prodOrigins.length === 0) return null
  const isProd = (host: string): boolean => prodOrigins.includes(host)
  const candidate = str(toolInput.url ?? toolInput.href)
  if (candidate) {
    const host = hostOf(candidate)
    if (host && isProd(host)) return { host, source: "tool_input.url" }
  }
  const envOrigin = process.env.MNM_QA_ORIGIN ?? ""
  if (!candidate && envOrigin) {
    const host = hostOf(envOrigin)
    if (host && isProd(host)) return { host, source: "MNM_QA_ORIGIN" }
  }
  let fileHost = ""
  let fileSource = ""
  if (!candidate && !envOrigin) {
    const rel = typeof contract.currentOriginFile === "string" ? contract.currentOriginFile : ""
    if (rel) {
      const abs = join(repoRoot(), rel)
      try {
        if (statSync(abs).isFile()) {
          fileHost = hostOf(readFileSync(abs, "utf8").split("\n")[0].trim())
          fileSource = rel
        }
      } catch {
        // fail open
      }
    }
    if (fileHost && isProd(fileHost)) return { host: fileHost, source: fileSource }
  }
  const knownHost = candidate ? hostOf(candidate) : envOrigin ? hostOf(envOrigin) : fileHost
  const knownSource = candidate ? "tool_input.url" : envOrigin ? "MNM_QA_ORIGIN" : fileSource
  for (const prod of prodOrigins) {
    let re: RegExp
    try {
      re = new RegExp(`(https?:)?//${escapeRe(prod)}([/:?#"']|\\\\|$)`)
    } catch {
      continue
    }
    if (re.test(raw)) {
      const source =
        knownHost && knownHost !== prod
          ? `tool_input URL (OVERRIDES ${knownSource || "recorded origin"} = ${knownHost}, which is STALE)`
          : "tool_input URL"
      return { host: prod, source }
    }
  }
  return null
}

function findToken(contract: Record<string, unknown>): string | null {
  const searchRoot = typeof contract.armedTokenSearchRoot === "string" ? contract.armedTokenSearchRoot : ""
  const tokenName = typeof contract.armedTokenFilename === "string" ? contract.armedTokenFilename : ""
  if (!searchRoot || !tokenName) return null
  const envToken = process.env.MNM_QA_ARMED_TOKEN ?? ""
  if (envToken) {
    try {
      if (statSync(envToken).isFile()) return envToken
    } catch {
      // fall through to search
    }
  }
  const root = join(repoRoot(), searchRoot)
  try {
    if (!statSync(root).isDirectory()) return null
  } catch {
    return null
  }
  const walk = (dir: string, depth: number): string | null => {
    if (depth > 2) return null
    let names: string[]
    try {
      names = readdirSync(dir)
    } catch {
      return null
    }
    for (const name of names) {
      const full = join(dir, name)
      try {
        const st = statSync(full)
        if (st.isFile() && name === tokenName) return full
        if (st.isDirectory() && depth < 2) {
          const hit = walk(full, depth + 1)
          if (hit) return hit
        }
      } catch {
        continue
      }
    }
    return null
  }
  return walk(root, 0)
}

function tokenReason(tokenPath: string): string {
  try {
    const lines = readFileSync(tokenPath, "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 3)
    return lines.join("\n")
  } catch {
    return ""
  }
}

export default Plugin.define({
  id: "local.mnm-qa-prod-guard",
  setup: async (ctx) => {
    await ctx.tool.hook("execute.before", (event) => {
      if (disabled()) return
      const contract = loadContract()
      if (!contract) return
      const tool = event.tool
      const patterns = Array.isArray(contract.mutatingToolPatterns)
        ? contract.mutatingToolPatterns.map(String)
        : []
      const mutating = patterns.some((pat) => {
        if (!pat) return false
        try {
          return new RegExp(pat).test(tool)
        } catch {
          return false
        }
      })
      if (!mutating) return
      const input = event.input as unknown
      if (typeof input !== "object" || input === null) return
      const toolInput = input as Record<string, unknown>
      const origin = resolveProdOrigin(contract, toolInput, JSON.stringify(input))
      if (!origin) return
      const tokenPath = findToken(contract)
      const reason = tokenPath ? tokenReason(tokenPath) : ""
      if (tokenPath && reason) {
        const consumed = `${tokenPath}.consumed-${Math.floor(Date.now() / 1000)}`
        try {
          renameSync(tokenPath, consumed)
        } catch {
          return
        }
        return
      }
      const searchRoot = String(contract.armedTokenSearchRoot ?? "docs/qa/rounds")
      const tokenName = String(contract.armedTokenFilename ?? ".write-armed")
      const emptyNote = tokenPath
        ? `\nAn armed token EXISTS but is EMPTY: ${tokenPath}\nThe token IS the written authorization — it must name the action. An empty file is not a decision, so it does not arm anything.\n`
        : ""
      throw new Error(
        `BLOCKED: browser MUTATION against a PRODUCTION origin, with no armed token.\n\n` +
          `Tool:   ${tool}\nOrigin: ${origin.host}  (resolved from ${origin.source})\n${emptyNote}\n` +
          `To proceed, a HUMAN (not the agent) creates the armed token:\n\n` +
          `    echo "<the exact action being authorized>" > ${searchRoot}/<pillar>-<date>/${tokenName}\n\n` +
          `It is SINGLE-USE: this guard consumes it on the first PROD mutation and the next one blocks again.\n` +
          `Contract: .claude/qa/prod-origins.json`,
      )
    })
  },
})
