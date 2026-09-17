/**
 * OpenCode plugin — enforce PRDS on `git push` / `gh pr create|edit` shell tools.
 *
 * Install as a directory copy under the global discovery dir:
 * `<config-dir>/plugins/<id>/` containing `index.ts` (this file, renamed)
 * plus `detect.py` (copied from `shared/hooks/prds/`). The adapter resolves
 * `detect.py` next to itself and spawns it (no duplicated section logic).
 * Do NOT register the file in the `"plugins"` array (rejected with
 * "configured plugin path must be a directory" on v2.0.5) and do NOT
 * symlink (the loader follows realpath for resolution).
 *
 * Zero-dependency by design: no bare npm imports (the server-side plugin
 * loader, observed v2.0.5, does not resolve them for local plugins).
 * `Plugin.define()` from `@opencode-ai/plugin` is an identity function
 * (verified 1.18.31), so a plain default export is equivalent.
 *
 * Disable: FCTO_DISABLE_PRDS_HOOK=1 or remove/negate this plugin entry.
 * Docs: https://opencode.ai/v2/docs/build/plugins
 */
import { spawnSync } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const DETECT = join(__dirname, "detect.py")

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

export default {
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
}
