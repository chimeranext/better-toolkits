# PRDS runtime hooks (multi-harness)

Enforce [Pull Request Description Standards](../../../shared/references/engineering-standards/prds.md)
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

Install as a directory copy under the global discovery dir
(`~/.config/opencode/plugins/<id>/` with `index.ts` plus `detect.py` side by
side - the adapter resolves `detect.py` next to itself), or under project
`.opencode/plugins/` ([plugins](https://opencode.ai/v2/docs/plugins)).
No `"plugins"` array entry for the file itself (rejected on v2.0.5), no
symlinks, no npm install: the adapter is dependency-free. Verify with
`opencode plugin list` (id `local.fcto-prds-prepush` must appear) plus a
command the gate must reject.

`/toolkits-initial-setup` (OpenCode adapter `setup-opencode.md`) or `npx @chimeranext/better-toolkits setup` can register this
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
