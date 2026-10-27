/**
 * OpenCode V2 plugin — AAARRR Flywheel safety + session log.
 * Disable with plugins: ["-local.mnm-aaarrr-flywheel"],
 * MNM_DISABLE_AAARRR_HOOK=1, or the global CLAUDE_DISABLE_PLUGIN_HOOKS=1.
 *
 * Mirrors (keep in sync):
 *   - hooks/spend-safety.sh (warn-only on shell calls that write Meta
 *     Graph API payable assets; never blocks -> execute.after appends the
 *     warning to the result so the agent must confirm with the user).
 *   - hooks/session-log.sh (session-idle event appends a timestamped entry
 *     to .aaarrr/learnings/session-log.md; always exits 0 -> fail open).
 *
 * Stop mapping follows the opencode-hooks package convention (Stop runs on
 * the session-idle event).
 */
import { Plugin } from "@opencode-ai/plugin"
import { existsSync, mkdirSync, appendFileSync, statSync } from "node:fs"
import { dirname, join } from "node:path"
import { execFileSync } from "node:child_process"

const SHELL_TOOLS = new Set(["shell", "bash"])

function disabled(): boolean {
  return (
    process.env.MNM_DISABLE_AAARRR_HOOK === "1" ||
    process.env.CLAUDE_DISABLE_PLUGIN_HOOKS === "1"
  )
}

function str(value: unknown): string {
  return typeof value === "string" ? value : ""
}

/** Warn-only spend-safety scan (mirrors spend-safety.sh). Never throws. */
function spendWarnings(command: string): string[] {
  const warnings: string[] = []
  if (!command) return warnings
  if (/graph\.facebook\.com/.test(command)) {
    if (/POST|DELETE|PUT|PATCH/.test(command)) {
      if (/\/campaigns([^/]|$)|\/adsets([^/]|$)|\/ads([^/]|$)|\/adcreatives|\/customaudiences/.test(command)) {
        warnings.push(
          "AAARRR Safety: Graph API write a campaña/adset/ad/audience detectado.\n    → Confirma con el usuario antes de ejecutar. Las campañas deben crearse PAUSED.",
        )
      }
      if (/status=ACTIVE|"status":\s*"ACTIVE"/.test(command)) {
        warnings.push(
          "AAARRR Safety: Activación detectada (status=ACTIVE).\n    → Esta acción inicia gasto. Confirma explícitamente con el usuario.",
        )
      }
      if (/daily_budget=|"daily_budget":/.test(command)) {
        warnings.push(
          "AAARRR Safety: Cambio de daily_budget detectado.\n    → Verifica que el nuevo budget esté dentro de max_daily_spend en settings.json.",
        )
      }
    }
    // graph.facebook.com insights reads are read-only -> silent, like the .sh.
  }
  return warnings
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

function findAaarrrDir(): string | null {
  let dir = process.cwd()
  for (let depth = 0; depth < 32; depth++) {
    try {
      if (statSync(join(dir, ".aaarrr")).isDirectory()) return join(dir, ".aaarrr")
    } catch {
      // keep walking up
    }
    const parent = dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
  return null
}

function appendSessionLog(): void {
  const aaarrrDir = findAaarrrDir()
  if (!aaarrrDir) return
  const learningsDir = join(aaarrrDir, "learnings")
  try {
    mkdirSync(learningsDir, { recursive: true })
  } catch {
    return
  }
  const sessionLog = join(learningsDir, "session-log.md")
  if (!existsSync(sessionLog)) {
    try {
      appendFileSync(
        sessionLog,
        "# AAARRR Session Log\n\nTimestamped entries auto-appended by the AAARRR Flywheel stop hook.\nCada entry registra cuándo terminó una sesión y qué áreas del flywheel se tocaron.\n\n---\n\n",
      )
    } catch {
      return
    }
  }
  const timestamp = new Date().toISOString().replace(/\.\d+Z$/, "Z")
  let changedFiles = ""
  try {
    changedFiles = execFileSync("git", ["status", "--porcelain", aaarrrDir], {
      encoding: "utf8",
      timeout: 10000,
    })
      .split("\n")
      .slice(0, 20)
      .join("\n")
      .trim()
  } catch {
    changedFiles = ""
  }
  const touched: string[] = []
  for (const area of ["plans", "metrics", "learnings", "diagnoses", "experiments", "cohorts"]) {
    if (changedFiles.includes(`${area}/`)) touched.push(area)
  }
  if (changedFiles.includes("config.json")) touched.push("config")
  const changeCount = changedFiles ? changedFiles.split("\n").filter(Boolean).length : 0
  const entry =
    `## Session: ${timestamp}\n\n` +
    `- **Áreas tocadas:** ${touched.length > 0 ? touched.join(", ") : "none detected"}\n` +
    `- **Files changed:** ${changeCount}\n` +
    (changedFiles ? `- **Changes:**\n\`\`\`\n${changedFiles}\n\`\`\`\n` : "") +
    `\n---\n\n`
  try {
    appendFileSync(sessionLog, entry)
  } catch {
    // fail open
  }
}

type EventSubscription = {
  subscribe: (opts?: { signal?: AbortSignal }) => AsyncIterable<Record<string, unknown>>
}

export default Plugin.define({
  id: "local.mnm-aaarrr-flywheel",
  setup: async (ctx) => {
    await ctx.tool.hook("execute.after", (event) => {
      if (disabled()) return
      if (event.status !== "completed") return
      if (!SHELL_TOOLS.has(event.tool as string)) return
      const input = event.input as unknown
      if (typeof input !== "object" || input === null) return
      const command = str((input as Record<string, unknown>).command)
      for (const warning of spendWarnings(command)) {
        appendWarning(event as { result?: unknown }, warning)
      }
    })
    const events = ctx.event as unknown as EventSubscription
    const controller = new AbortController()
    void (async () => {
      try {
        for await (const evt of events.subscribe({ signal: controller.signal })) {
          try {
            if (disabled()) continue
            if (!evt || evt.type !== "session.idle") continue
            appendSessionLog()
          } catch {
            // fail open
          }
        }
      } catch {
        // subscription ended; fail open
      }
    })()
    return () => controller.abort()
  },
})
