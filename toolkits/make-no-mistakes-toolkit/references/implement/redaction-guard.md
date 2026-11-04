Stop unless the issue body is a substantive Bilingual Format brief. **This is a
deterministic gate, not a recommendation**: run the detector and, if it denies
(exit 2), do not proceed.

Full fill-in template: [`templates/bilingual-issue-brief.md`](../../templates/bilingual-issue-brief.md). Markers/stubs: [`docs/bilingual-format-standard.md`](../../docs/bilingual-format-standard.md). Deterministic detector: `shared/hooks/bilingual/detect.py`.

# Redaction-quality sanity guard (deterministic)

Before continuing past Input Resolution, run the detector on each fetched issue's
`description`:

```bash
python3 "$ROOT/shared/hooks/bilingual/detect.py" --body-file /tmp/issue-body.md
python3 "$ROOT/shared/hooks/bilingual/detect.py" --body "<issue description>"
```

The detector fails (exit 2) when the body is missing the Bilingual markers
(`## 👤 HUMAN LAYER`, `## 🤖 AGENT LAYER`, `### Acceptance Criteria`, `### Context Files`),
is empty, is a 1-liner, or is pure stubs ("TBD", "N/A everywhere"). It also
enforces marker order (HUMAN before AGENT; AC + Context Files inside AGENT).

If the detector denies, **STOP** and tell the user:

> Issue `{ID}` isn't in Bilingual Format. Implementation agents produce shallow work against un-redacted briefs. Run `/make-no-mistakes:spike-recommend {ID}` first to normalize the description in Linear, then re-run `/make-no-mistakes:implement {ID}`.
>
> If you've already redacted it manually and want to proceed anyway, say so explicitly and I'll continue (explicit bypass `# hook-bypass: bilingual-body-deferred`).

La ruta de enforcement es **harness-agnostic y MANDATORY** (sin opt-in): Linear
MCP `save_issue` vía plugin OpenCode `adapters/opencode-bilingual.ts`, hook Claude
`pre-linear-save-issue-bilingual.sh` (PreToolUse), y CLI fallback
`adapters/cursor-before-shell.sh` / `adapters/claude-pre-bash.sh` (`linear … create|edit`,
`gh issue create|edit`). Ninguno lee `.claude/config/hygiene-hooks.json`. No hay
config que lo desactive; único bypass explícito: `# hook-bypass: bilingual-body-deferred`.
No procedas en silencio — esto es una parada de enforcement determinística, no una
recomendación; el resto del protocol de abajo no cambia.
