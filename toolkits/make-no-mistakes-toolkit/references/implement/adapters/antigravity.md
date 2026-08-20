# Antigravity (and similar CLIs) — invoke implement SSOT

1. Point the agent at the installed make-no-mistakes toolkit root (or monorepo path `toolkits/make-no-mistakes-toolkit/`).
2. Instruct:

   > Read `commands/implement.md`, then Read and follow every file under `references/implement/` in the table order. Issue args: `{ids}`.

3. Wire shell pre-exec to stderr detect:

   ```bash
   python3 path/to/shared/hooks/stderr/detect.py --command "$CMD"
   # exit 2 → block
   ```

Same pattern for Codex / Kiro / Grok CLI when they expose a pre-exec hook.
