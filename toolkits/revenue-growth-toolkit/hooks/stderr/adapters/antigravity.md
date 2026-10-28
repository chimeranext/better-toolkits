# Codex / Antigravity / Kiro / Grok CLI

These harnesses do not yet have a first-class adapter in this folder. Wire the
shared detector as a pre-exec check:

```bash
python3 path/to/make-no-mistakes-toolkit/hooks/stderr/detect.py --command "$COMMAND"
# exit 2 → refuse the tool call
```

Opt-out: `MNM_DISABLE_STDERR_HOOK=1`.

When a stable hook API lands for each harness, add a dedicated adapter next to
`claude-pre-bash.sh` / `cursor-before-shell.sh` / `opencode-plugin.ts`.
