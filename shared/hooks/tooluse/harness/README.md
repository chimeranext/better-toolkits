# Tool-use guards — harness wiring

Deterministic local guards, shared across harnesses:

- `enforce-prds.sh` — blocks `gh pr create|edit` when the PR body lacks the PRDS
  sections (Summary, Tracker, Test plan, Scope boundaries).
- `approve-admin-merge.sh` — blocks `gh pr merge --admin` unless a human approves
  via interactive elevation (pkexec/sudo/osascript/UAC).

## Install

1. Replace `__BETTER_TOOLKITS_ROOT__` with the absolute path of your
   better-toolkits clone.
2. Cursor: merge `cursor-settings.example.json` into `.cursor/settings.json`.
3. Claude Code: merge `claude-settings.example.json` into `.claude/settings.json`.
4. OpenCode: merge `opencode-opencode.json.example` into
   `~/.config/opencode/opencode.json` (under `hooks.beforeToolUse`).

> **Claude Code (native):** the example uses `${CLAUDE_PROJECT_DIR}/.claude/hooks/`
> — project-scoped hook scripts. Copy `enforce-prds.sh`, `approve-admin-merge.sh`
> (and optionally `stop-prs-green.sh`) into each project's `.claude/hooks/`.
> Keep `settings.json` and the hooks directory coherent: a hook wired in one but
> not the other is inert.
>
> **OpenCode/Cursor** use absolute paths to the shared scripts in the clone.
>
> **Windows / PowerShell:** use `scripts/ci/install-tooluse-guards.ps1` to copy the
> shared guards into the central hooks home (default `C:\Users\<user>\.agents\hooks`,
> or `-root <dir>`):
>
> ```powershell
> pwsh -File scripts/ci/install-tooluse-guards.ps1
> ```

## Behavior

- Any blocked tool use exits non-zero (or throws) before execution.
- There is no bypass flag. Gate fires ⇒ redraft the PR description (PRDS) or
  perform the human approval step (admin merges).
