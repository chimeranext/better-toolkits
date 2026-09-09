# PRDS runtime hooks (multi-harness)

Enforce [Pull Request Description Standards](../../../toolkits/fractional-cto-toolkit/references/engineering-standards/prds.md)
on agent shell tools that push or write PR bodies.

| Piece | Role |
| --- | --- |
| `detect.py` | SSOT — exit `0` allow / `2` deny |
| `adapters/claude-pre-bash.sh` | Claude Code PreToolUse Bash |
| `adapters/cursor-before-shell.sh` | Cursor `beforeShellExecution` |
| `adapters/opencode-plugin.ts` | OpenCode `"plugin"` / `.opencode/plugins/` ([docs](https://opencode.ai/docs/plugins/)) |

## Policy (v1)

| Command | Behavior |
| --- | --- |
| `gh pr create` / `gh pr edit` | **Block** if body (inline or `--body-file`) lacks non-empty **Summary**, **Tracker/Linear**, **Test plan**, **Scope boundaries** |
| `git push` with open PR for branch | **Block** if live PR body fails the same check (`gh pr view`) |
| `git push` with **no** PR yet | **Allow** (PRDS progressive-push / draft workflow) |
| Unrelated shell | Allow |

Soft warns (stderr only): PR title shape, diff ≳ 400 lines.

## Opt-out / bypass

- `FCTO_DISABLE_PRDS_HOOK=1`
- `.claude/config/prds-hooks.json` → `{"enforce_prds": false}`
- One-shot: `# hook-bypass: prds-body-deferred` in the shell command

## Install

### Claude Code (fractional-cto plugin)

`hooks/hooks.json` registers PreToolUse → `hooks/prds/adapters/claude-pre-bash.sh`
(vendored from this tree). Install/update the fractional-cto marketplace plugin.

### Cursor

`.cursor/hooks.json`:

```json
{
  "version": 1,
  "hooks": {
    "beforeShellExecution": [
      {
        "command": "bash ${workspaceFolder}/shared/hooks/prds/adapters/cursor-before-shell.sh"
      }
    ]
  }
}
```

(Or the path under an installed toolkit’s `hooks/prds/`.)

### OpenCode

`opencode.json` / `opencode.jsonc` ([plugins](https://opencode.ai/docs/plugins/)):

```jsonc
{
  "plugin": [
    "/absolute/path/to/better-toolkits/shared/hooks/prds/adapters/opencode-plugin.ts"
  ]
}
```

Or copy the adapter into `.opencode/plugins/`. Prefer **one** absolute path; restart OpenCode after changes.

`/make-no-mistakes:opencode-setup` (when available) can be extended to register this
plugin alongside stderr — until then, add the path manually.

## Vendor sync

```bash
bash scripts/sync-prds-from-shared.sh
```

Copies this tree into `toolkits/*/hooks/prds/` (same pattern as stderr).

## Tests

```bash
bash shared/hooks/prds/tests/test-detect.sh
```
