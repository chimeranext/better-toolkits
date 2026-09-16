# setup-claude — Claude Code adapter for /toolkits-initial-setup

## Marketplace + bootstrap

```bash
claude plugin marketplace add chimeranext/better-toolkits
claude plugin install better-toolkits-bootstrap@better-toolkits
```

Audit: `claude plugin marketplace list` — expect `better-toolkits` with `gitRef` and indexed plugins.

## Product toolkits

After bootstrap and HITL:

```bash
claude plugin install make-no-mistakes@better-toolkits
# … additional toolkits from user selection
```

## Stderr

Installing `better-toolkits-bootstrap` registers `hooks/hooks.json` → PreToolUse `Bash` →
`shared/hooks/stderr/adapters/claude-pre-bash.sh` via `${CLAUDE_PLUGIN_ROOT}/../hooks/stderr/...`.

Verify after install:

```bash
# Plugin root should resolve stderr adapter
test -f "$(dirname "$CLAUDE_PLUGIN_ROOT")/hooks/stderr/adapters/claude-pre-bash.sh"
```

Opt-out: `.claude/config/stderr-hooks.json` → `{"preserve_stderr": false}` or
`MNM_DISABLE_STDERR_HOOK=1`.

## Verify

```bash
claude plugin marketplace list
claude plugin list
```

Run `shared/hooks/stderr/tests/test-detect.sh` from repo clone if available.
