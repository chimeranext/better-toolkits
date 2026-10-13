# Tracker selection — protocol SSOT

Shared by **`spike-recommend`** and **`spec-recommend`** (and any command that creates or updates issues).

**Product rule:** **Linear by default; GitHub Issues as fallback** for consumer repos. **Config-first:** read `linear-setup.json` before probing MCP/CLI so GitHub-native monorepos are not forced through Linear.

---

## Steps

1. **Read `linear-setup.json`** at the repo root when present (`team.key`, `projects`, repo/domain mapping). Classify **Linear-mapped** vs **GitHub-native** (file absent or maps nothing for the current repo ⇒ GitHub-native for tracker choice).

2. **GitHub-native short-circuit.** When step 1 says GitHub-native, use **GitHub Issues** when `gh auth status` succeeds (`gh issue create` / `gh issue edit`). **Do not** prefer Linear MCP on GitHub-only monorepos even if Linear is configured globally in the harness.

3. **Linear** — primary for Linear-mapped repos. Available when step 1 maps this repo/domain to Linear **and** `mcp__plugin_linear_linear__*` tools (or equivalent `mcp__*linear*save_issue`) are exposed. Use `save_issue` (with `id` → update, without `id` → create). _Naming note: the registered MCP namespace uses a single underscore between the two `linear` tokens (`plugin_linear_linear`). Probe the actual tool name in your runtime if a literal call fails._

4. **GitHub Issues** — fallback. Available when `gh auth status` succeeds and the repo is GitHub-native (step 2) **or** when Linear is mapped but Linear MCP is not available in this runtime. Use `gh issue create` / `gh issue edit`.

5. **Never invent** a Linear workspace, team, or project when mapping is missing — missing mapping means GitHub-native, not guessed Linear.

---

## Update mode (URL present)

When the user passes a tracker URL:

- Write only to that tracker when it is available; **never** silently redirect a Linear URL to GitHub or vice versa.
- If the URL's tracker is unavailable, abort with a clear message (do not write elsewhere).

(spike-recommend documents Jira/ClickUp stubs and print-only fallback separately.)
