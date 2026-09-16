/**
 * OpenCode plugin — enforce PRDS on `git push` / `gh pr create|edit` shell tools.
 *
 * Registers via opencode.json `"plugin"` array (absolute path) or copy under
 * `.opencode/plugins/`. Spawns shared detect.py (no duplicated section logic).
 *
 * Disable: FCTO_DISABLE_PRDS_HOOK=1 or remove/negate this plugin entry.
 * Docs: https://opencode.ai/docs/plugins/
 */
import { Plugin } from "@opencode-ai/plugin"
import { spawnSync } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const DETECT = join(__dirname, "..", "detect.py")

function isShellTool(name: string | undefined): boolean {
  if (!name) return false
  const n = name.toLowerCase()
  return n === "shell" || n === "bash" || n === "execute"
}

function denyReason(command: string, cwd: string): string | null {
  if (process.env.FCTO_DISABLE_PRDS_HOOK === "1") return null
  if (process.env.CLAUDE_DISABLE_PLUGIN_HOOKS === "1") return null
  const proc = spawnSync("python3", [DETECT, "--command", command, "--cwd", cwd], {
    encoding: "utf8",
    timeout: 5000,
  })
  if (proc.error || proc.status === null) return null // fail-open
  if (proc.status === 0) return null
  return (proc.stderr || proc.stdout || "PRDS policy blocked this command").trim()
}

export default Plugin.define({
  id: "local.fcto-prds-prepush",
  setup: async (ctx) => {
    await ctx.tool.hook("execute.before", (event) => {
      if (!isShellTool(event.tool)) return
      const command = (event.input as { command?: unknown })?.command
      if (typeof command !== "string") return
      const cwd =
        (event.input as { cwd?: unknown })?.cwd &&
        typeof (event.input as { cwd?: unknown }).cwd === "string"
          ? ((event.input as { cwd: string }).cwd)
          : process.cwd()
      const msg = denyReason(command, cwd)
      if (msg) throw new Error(msg)
    })
  },
})
