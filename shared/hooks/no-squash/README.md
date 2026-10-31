# no-squash hooks

**On by default. Opt-out** when you need to.

Blocks agent shell commands that attempt a **squash merge**: `gh pr merge --squash`
(or `-s`) and `git merge --squash` / `--strategy squash`.

The repo forbids squash merges because `--squash` collapses a PR's commit history
and per-commit review comments into a single commit. Merges must preserve history
with `--merge` / `--rebase`.

Shared detector: [`detect.py`](detect.py).

## Opt-out

| Mechanism | Effect |
|-----------|--------|
| `MNM_DISABLE_NO_SQUASH_HOOK=1` | Skip no-squash adapters |
| `CLAUDE_DISABLE_PLUGIN_HOOKS=1` | Skip all plugin hooks (Claude) |
| `.claude/config/no-squash-hooks.json` → `{"enforce_no_squash": false}` | Per-repo opt-out |

## Harness matrix

| Harness | Adapter | Install |
|---------|---------|---------|
| **Claude Code** | `adapters/claude-pre-bash.sh` | `.claude/settings.json` → `PreToolUse` (matcher `Bash`) → `.claude/hooks/pre-bash-no-squash.sh` |
| **Cursor** | `adapters/cursor-before-shell.sh` | **Monorepo:** [`.cursor/hooks.json`](../../../.cursor/hooks.json). **Consumers:** register `beforeShellExecution` in project or user `hooks.json` |
| **OpenCode V2** | merged into `adapters/opencode-plugin.ts` (stderr family) | Same plugin install as stderr (`~/.config/opencode/plugins/mnm-no-stderr-redirect/index.ts`) |

## CLI check

```bash
python3 hooks/no-squash/detect.py --command 'gh pr merge 5 --squash'   # exit 2
python3 hooks/no-squash/detect.py --command 'gh pr merge 5 --merge'     # exit 0
```

## Tests

```bash
bash hooks/no-squash/tests/test-detect.sh
```

Monorepo contract: [`docs/multi-harness-ssot.md`](../../../docs/multi-harness-ssot.md).
Canonical tree for all toolkits: this directory (`shared/hooks/no-squash`). Toolkit
copies under `toolkits/*/hooks/no-squash` must stay in sync (vendored for
independent plugin publish).

Vendor sync (copy this tree into `toolkits/*/hooks/no-squash/`):
`bash scripts/sync-no-squash-from-shared.sh` · Windows: `pwsh -File scripts/sync-no-squash-from-shared.ps1`.
