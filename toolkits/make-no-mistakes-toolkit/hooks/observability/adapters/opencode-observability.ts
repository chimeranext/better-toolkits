/**
 * OpenCode V2 plugin — observability instrumentation guard (INSTRUMENT stage).
 * Disable with plugins: ["-local.mnm-observability"],
 * MNM_DISABLE_OBSERVABILITY_HOOK=1, or the global
 * CLAUDE_DISABLE_PLUGIN_HOOKS=1.
 *
 * Mirrors hooks/observability/pre-write-observability-guard.sh (keep in
 * sync): direct posthog-js imports WARN (pre-existing backlog), direct
 * window.fbq calls / second Sentry.init / direct web-vitals imports BLOCK.
 * Warn-only output is appended in execute.after (PostToolUse convention:
 * warnings cannot block); blocks throw in execute.before.
 *
 * No-op when the consumer repo has no contract file: $OBSERVABILITY_GUARDRAIL_JSON,
 * <root>/observability-guardrail.json, or
 * <root>/.claude/config/observability-guardrail.json (fail open, like .sh).
 */
import { Plugin } from "@opencode-ai/plugin"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

const EDIT_TOOLS = new Set(["edit", "write", "apply_patch"])

function disabled(): boolean {
  return (
    process.env.MNM_DISABLE_OBSERVABILITY_HOOK === "1" ||
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
  const root = repoRoot()
  const override = process.env.OBSERVABILITY_GUARDRAIL_JSON ?? ""
  const candidates = [
    ...(override ? [override] : []),
    join(root, "observability-guardrail.json"),
    join(root, ".claude", "config", "observability-guardrail.json"),
  ]
  for (const path of candidates) {
    let raw = ""
    try {
      raw = readFileSync(path, "utf8")
    } catch {
      continue
    }
    try {
      const parsed: unknown = JSON.parse(raw)
      if (parsed && typeof parsed === "object")
        return parsed as Record<string, unknown>
    } catch {
      continue
    }
  }
  return null
}

function listOf(contract: Record<string, unknown>, key: string): string[] {
  const value = contract[key]
  return Array.isArray(value) ? value.map(String).filter(Boolean) : []
}

/**
 * Glob allowlist matching mirrors the .sh glob_allowlisted translation
 * (escape dots, protect `**`, single `*` never crosses `/`).
 */
function globToRegExp(glob: string): RegExp | null {
  try {
    let re = glob.replace(/\./g, "\\.")
    re = re.split("/**/").join("__OBS_GLOBSTAR_SLASH__")
    re = re.split("**").join("__OBS_GLOBSTAR__")
    re = re.split("*").join("[^/]*")
    re = re.split("__OBS_GLOBSTAR_SLASH__").join("(\\/.*)?")
    re = re.split("__OBS_GLOBSTAR__").join(".*")
    return new RegExp(`(^|/)${re}$|(^|/)${re}(/|$)`)
  } catch {
    return null
  }
}

function allowlisted(patterns: string[], filePath: string): boolean {
  return patterns.some((entry) => {
    const re = globToRegExp(entry)
    return re ? re.test(filePath) : false
  })
}

/** Strip comment-only lines (mirrors the .sh sed filter). */
function stripComments(payload: string): string {
  return payload
    .split("\n")
    .filter((line) => !/^[ \t]*(\*|\/\/|\/\*)/.test(line))
    .join("\n")
}

const POSTHOG_IMPORT = /from\s+['"`]posthog-js/
const META_PIXEL = /window\.fbq|(^|[^.\w])fbq\s*\(/
const SENTRY_INIT = /Sentry\.init\s*\(/
const WEB_VITALS_IMPORT = /from\s+['"`]web-vitals/

function payloadOf(input: unknown): { filePath: string; payload: string } {
  const rec = (input ?? {}) as Record<string, unknown>
  const filePath = str(rec.file_path ?? rec.filePath ?? rec.path)
  const edits = Array.isArray(rec.edits)
    ? (rec.edits as Record<string, unknown>[])
    : []
  const payload = str(
    rec.content ??
      rec.new_string ??
      rec.newString ??
      edits
        .map((e) => str(e.new_string ?? e.newString))
        .filter(Boolean)
        .join("\n"),
  )
  return { filePath, payload }
}

function evaluate(input: unknown): { warn: string | null; block: string | null } {
  const none = { warn: null, block: null }
  const contract = loadContract()
  if (!contract) return none
  const { filePath, payload: rawPayload } = payloadOf(input)
  if (!filePath || !rawPayload) return none
  if (!/\.(ts|tsx|js|jsx)$/.test(filePath)) return none
  if (allowlisted(listOf(contract, "allowlist"), filePath)) return none
  const payload = stripComments(rawPayload)
  if (!payload) return none
  const blocks: string[] = []
  // posthog warns (pre-existing backlog); the warning only surfaces when
  // nothing else blocks, like the .sh hook.
  const posthogHit =
    POSTHOG_IMPORT.test(payload) &&
    !allowlisted(listOf(contract, "posthogImportAllowlist"), filePath)
  if (
    META_PIXEL.test(payload) &&
    !allowlisted(listOf(contract, "metaPixelAllowlist"), filePath)
  ) {
    blocks.push("direct Meta Pixel call (window.fbq)")
  }
  if (
    SENTRY_INIT.test(payload) &&
    !allowlisted(listOf(contract, "sentryInitAllowlist"), filePath)
  ) {
    blocks.push("second Sentry.init")
  }
  if (
    WEB_VITALS_IMPORT.test(payload) &&
    !allowlisted(listOf(contract, "webVitalsImportAllowlist"), filePath)
  ) {
    blocks.push("direct web-vitals import")
  }
  if (blocks.length > 0) {
    const allowlist = listOf(contract, "allowlist")
    return {
      warn: null,
      block:
        `BLOCKED: Observability guardrail rejected instrumentation drift.\n\n` +
        `Attempted: ${filePath}\nPattern:   ${blocks.join(", ")}\n\n` +
        `Instrumentation must go through the shared chokepoint, never a vendor global inside product code:\n\n` +
        `  window.fbq    -> useMetaTracking  (src/hooks/useMetaTracking.ts)\n` +
        `  Sentry.init   -> src/lib/sentry.ts | supabase/functions/_shared/sentry.ts\n` +
        `  web-vitals    -> useWebVitals     (src/hooks/useWebVitals.ts)\n` +
        (allowlist.length > 0
          ? `\nContent allowlist:\n${allowlist.map((a) => `  - ${a}`).join("\n")}\n`
          : "") +
        `\nTo approve a real exception, edit observability-guardrail.json in the same change so the contract stays reviewable.`,
    }
  }
  if (posthogHit) {
    return {
      warn:
        `[pre-write-observability-guard] WARN: direct posthog-js import in ${filePath}\n\n` +
        `Instrumentation belongs behind a shared hook (usePostHogAnalytics). ` +
        `This warns rather than blocks because the pattern has a pre-existing backlog. Do not add another.`,
      block: null,
    }
  }
  return none
}

/**
 * Surface a warn-only verdict in execute.after (PostToolUse convention —
 * warnings cannot block a call that already ran). Handles every
 * Tool.Result shape: plain string, `{ output: string }` (shell/edit/write),
 * `{ content: string }`, or `{ content: [{ type: "text", ... }] }` (MCP).
 */
function appendWarning(event: { result?: unknown }, warning: string): void {
  const result = event.result as unknown
  if (typeof result === "string") {
    ;(event as { result: unknown }).result = `${result}\n${warning}`
    return
  }
  if (result && typeof result === "object") {
    const rec = result as Record<string, unknown>
    if (typeof rec.output === "string") {
      ;(event as { result: unknown }).result = {
        ...(rec as object),
        output: `${rec.output}\n${warning}`,
      }
      return
    }
    if (typeof rec.content === "string") {
      ;(event as { result: unknown }).result = {
        ...(rec as object),
        content: `${rec.content}\n${warning}`,
      }
      return
    }
    if (Array.isArray(rec.content)) {
      ;(event as { result: unknown }).result = {
        ...(rec as object),
        content: [...rec.content, { type: "text", text: warning }],
      }
    }
  }
}

export default Plugin.define({
  id: "local.mnm-observability",
  setup: async (ctx) => {
    await ctx.tool.hook("execute.before", (event) => {
      if (disabled()) return
      if (!EDIT_TOOLS.has(event.tool)) return
      const input = event.input as unknown
      if (typeof input !== "object" || input === null) return
      const { block } = evaluate(input)
      if (block) throw new Error(block)
    })
    await ctx.tool.hook("execute.after", (event) => {
      if (disabled()) return
      if (event.status !== "completed") return
      if (!EDIT_TOOLS.has(event.tool as string)) return
      const input = event.input as unknown
      if (typeof input !== "object" || input === null) return
      const { warn } = evaluate(input)
      if (warn) appendWarning(event as { result?: unknown }, warn)
    })
  },
})
