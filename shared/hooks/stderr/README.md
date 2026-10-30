# stderr preserve hooks (make-no-mistakes)

**On by default. Opt-out** when you need to.

This hook enforces **StS — Stderr/Stream Standards**
(see `shared/references/engineering-standards/stderr-stream-standards.md`), the
policy SSOT. This README is the technical implementation; the policy is StS.

Blocks agent shell commands that discard stderr or stdout to a null device, or
fold stderr with bare `2>&1` without a file/`tee` sink. No stream goes to null,
ever: capture with `out=$(cmd)` or sink to log files (fold stderr into the SAME
sink with `> out.log 2>&1` or `2>&1 | tee run.log`). `2> file` (separate error
file) is forbidden.

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
| **Cursor** | `adapters/cursor-before-shell.sh` | **Monorepo:** [`.cursor/hooks.json`](../../../.cursor/hooks.json) (dogfood). **Consumers:** register `beforeShellExecution` in project or user `hooks.json` (wrapper or `${workspaceFolder}/…/cursor-before-shell.sh`) |
| **OpenCode V2** | `adapters/opencode-plugin.ts` | Copy to `~/.config/opencode/plugins/mnm-no-stderr-redirect/index.ts` (global discovery dir, no config entry) - besides blocking stderr, the plugin registers the hosting toolkit's `skills/` + `references/` when they resolve next to it, so OpenCode2 sessions get the toolkit's SKILL.md files and local references directly |
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

- `out=$(cmd)` — capture instead of discarding
- `cmd >all.log 2>&1` / `cmd 2>&1 | tee run.log` — fold stderr into the SAME sink
- `out=$(cmd)` when you only need the exit code

**Forbidden:** `2> file` (separate error file) — it is missed in audits. Only the
combined `> out.log 2>&1` or `2>&1 | tee run.log` forms are allowed (matches the
detector).

## Tests

```bash
bash hooks/stderr/tests/test-detect.sh
```


Monorepo contract: [`docs/multi-harness-ssot.md`](../../../docs/multi-harness-ssot.md).
Canonical tree for all toolkits: this directory (`shared/hooks/stderr`). Toolkit copies under `toolkits/*/hooks/stderr` must stay in sync (vendored for independent plugin publish).
