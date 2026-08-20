# stderr preserve hooks (make-no-mistakes)

**On by default. Opt-out** when you need to.

Blocks agent shell commands that discard stderr (`2>/dev/null`, `&>/dev/null`,
`>/dev/null 2>&1`) or fold stderr with bare `2>&1` without a file/`tee` sink.

Shared detector: [`detect.py`](detect.py).

## Opt-out

| Mechanism | Effect |
|-----------|--------|
| `MNM_DISABLE_STDERR_HOOK=1` | Skip stderr adapters |
| `CLAUDE_DISABLE_PLUGIN_HOOKS=1` | Skip all plugin hooks (Claude) |
| `.claude/config/stderr-hooks.json` → `{"preserve_stderr": false}` | Per-repo opt-out |
| OpenCode: `"plugins": ["-local.mnm-no-stderr-redirect"]` | Disable OpenCode plugin |

## Harness matrix

| Harness | Adapter | Install |
|---------|---------|---------|
| **Claude Code** | `adapters/claude-pre-bash.sh` | Wired in plugin `hooks/hooks.json` when make-no-mistakes is installed |
| **Cursor** | `adapters/cursor-before-shell.sh` | Copy to `.cursor/hooks/` and register `beforeShellExecution` in `.cursor/hooks.json` (or user hooks) |
| **OpenCode V2** | `adapters/opencode-plugin.ts` | `"plugins": ["…/hooks/stderr/adapters/opencode-plugin.ts"]` |
| **Codex / Antigravity / Kiro / Grok CLI** | CLI | `python3 detect.py --command '…'` in your harness pre-exec hook (docs-first v1) |

### Cursor example `.cursor/hooks.json`

```json
{
  "version": 1,
  "hooks": {
    "beforeShellExecution": [
      {
        "command": "bash ${workspaceFolder}/path/to/make-no-mistakes-toolkit/hooks/stderr/adapters/cursor-before-shell.sh"
      }
    ]
  }
}
```

### CLI check

```bash
python3 hooks/stderr/detect.py --command 'gh api … 2>/dev/null'   # exit 2
python3 hooks/stderr/detect.py --command 'cmd 2>&1 | tee run.log' # exit 0
```

## Allowed patterns

- `cmd 2>&1 >/dev/null` — stderr duplicated to original stdout first
- `cmd >out.log 2>err.log` / `cmd >all.log 2>&1` / `cmd 2>&1 | tee run.log`
- `out=$(cmd)` when you only need the exit code

## Tests

```bash
bash hooks/stderr/tests/test-detect.sh
```


Monorepo contract: [`docs/multi-harness-ssot.md`](../../../docs/multi-harness-ssot.md).
Canonical tree for all toolkits: this directory (`shared/hooks/stderr`). Toolkit copies under `toolkits/*/hooks/stderr` must stay in sync (vendored for independent plugin publish).
