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
4. OpenCode: the same guards are already configured under
   `hooks.beforeToolUse` in `~/.config/opencode/opencode.json`.

## Behavior

- Any blocked tool use exits non-zero (or throws) before execution.
- There is no bypass flag. Gate fires ⇒ redraft the PR description (PRDS) or
  perform the human approval step (admin merges).
