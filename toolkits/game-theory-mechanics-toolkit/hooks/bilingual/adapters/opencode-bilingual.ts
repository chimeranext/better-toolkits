/**
 * OpenCode plugin — Bilingual gate (MANDATORY, no opt-in) on Linear MCP save_issue.
 *
 * Blocks CREATING a Linear issue whose body is not a substantive Bilingual brief
 * (## 👤 HUMAN LAYER / ## 🤖 AGENT LAYER / ### Acceptance Criteria / ### Context Files).
 * Updates (calls that carry an `id`) pass through untouched.
 *
 * Harness-agnostic core: it spawns the single deterministic detector
 * `shared/hooks/bilingual/detect.py`. This plugin is the OpenCode adapter;
 * Claude Code uses `shared/hooks/bilingual/pre-linear-save-issue-bilingual.sh`
 * (PreToolUse), Cursor uses `adapters/cursor-before-shell.sh` for the CLI
 * fallback. No adapter reads any .claude config; none is opt-in.
 *
 * Install (OpenCode): copy this dir to `<config-dir>/plugins/<id>/` with
 * `index.ts` (this file) + `detect.py` copied from `shared/hooks/bilingual/`.
 * Protocol SSOT: shared/references/engineering-standards/bilingual-issue-brief.md
 */
import { spawnSync } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { existsSync } from "node:fs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const DETECT = join(__dirname, "detect.py")

function isLinearSaveIssue(tool: string | undefined): boolean {
  if (!tool) return false
  return /linear/i.test(tool) && /save.?issue/i.test(tool)
}

function denyReason(input: unknown): string {
  // null-safe: devuelve "" (allow) o un mensaje no vacío (deny). Sin `null`.
  if (!existsSync(DETECT)) return "" // fail-open on missing infra
  const toolInput = (input ?? {}) as Record<string, unknown>
  // Updates (id present) pass; only CREATE is gated.
  if (toolInput.id !== undefined && toolInput.id !== null && toolInput.id !== "") {
    return ""
  }
  const desc =
    (typeof toolInput.description === "string" ? toolInput.description : "") ||
    (typeof toolInput.body === "string" ? toolInput.body : "")
  if (!desc.trim()) {
    return (
      "BLOCKED — Bilingual: el issue no tiene description. Todo CREATE en Linear " +
      "debe abrirse con un brief Bilingual (## 👤 HUMAN LAYER / ## 🤖 AGENT LAYER / " +
      "### Acceptance Criteria / ### Context Files). Corre /make-no-mistakes:spike-recommend {ID}."
    )
  }
  const proc = spawnSync("python3", [DETECT, "--body", desc], {
    encoding: "utf8",
    timeout: 5000,
  })
  if (proc.error || proc.status === null) return "" // fail-open
  if (proc.status === 0) return ""
  const reason = (proc.stderr || proc.stdout || "BILINGUAL: verifica el cuerpo del issue.").trim()
  return `BLOCKED — Bilingual: ${reason}`
}

export default {
  id: "local.mnm-bilingual",
  setup: async (ctx: OpenCode.PluginContext) => {
    await ctx.tool.hook("execute.before", (event: OpenCode.ExecuteBeforeEvent) => {
      if (!isLinearSaveIssue(event.tool)) return
      const input = event.input as unknown
      if (typeof input !== "object" || input === null) return
      const msg = denyReason(input)
      if (msg) throw new Error(msg)
    })
  },
}
