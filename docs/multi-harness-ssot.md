# Multi-harness SSOT

Durable contract for this monorepo (one of two doctrine pillars — the other is [HITL](hitl.md)). Public doctrine: [toolkits.chimeranext.dev/doctrine](https://toolkits.chimeranext.dev/doctrine/). Decision record: [`openspec/changes/2026-08-20-multi-harness-ssot/`](../openspec/changes/2026-08-20-multi-harness-ssot/).

Install stderr on Claude Code / Cursor / OpenCode2: see the **Multi-harness SSOT** section in the [root README](../README.md).

## Two SSOTs (orthogonal)

| SSOT | Location | Purpose |
|------|----------|---------|
| **Protocol** | `toolkits/<name>/references/<cmd-or-domain>/` (+ `templates/` or `assets/templates/`) | HOW for commands/skills — harness-agnostic markdown |
| **Runtime stderr** | [`shared/hooks/stderr/`](../shared/hooks/stderr/) | Block shell stderr discards; one `detect.py`, N wire-ups |
| **Runtime PRDS** | [`shared/hooks/prds/`](../shared/hooks/prds/) | Gate `git push` / `gh pr create|edit` to PRDS body sections; one `detect.py`, N wire-ups |

## Protocol rules

1. Entry thin (≤ ~120 lines): Claude `commands/*.md`, Cursor `skills/*/SKILL.md` when `/` must surface it.
2. Body lives in `references/`. No second protocol body per harness.
3. Harness notes → `references/.../adapters/` or entry footnotes.

## Runtime stderr rules

1. Canonical tree: `shared/hooks/stderr/` (`detect.py` + adapters + tests).
2. Every toolkit Claude `hooks/hooks.json` registers PreToolUse Bash → claude adapter.
3. OpenCode: file plugin `opencode-plugin.ts`. Cursor: `beforeShellExecution`. Antigravity/Codex: `detect.py --command`.
4. Opt-out: `MNM_DISABLE_STDERR_HOOK=1`, `.claude/config/stderr-hooks.json` `preserve_stderr: false`, OpenCode disable plugin.
5. Done criterion: session with **only** toolkit T installed still blocks `2>/dev/null`.

## Runtime PRDS rules

1. Canonical tree: `shared/hooks/prds/` (`detect.py` + adapters + tests).
2. Fractional-cto Claude `hooks/hooks.json` registers PreToolUse Bash → PRDS adapter (alongside stderr).
3. OpenCode: file plugin `opencode-plugin.ts` (`local.fcto-prds-prepush`). Cursor: `beforeShellExecution`.
4. Opt-out: `FCTO_DISABLE_PRDS_HOOK=1`, `.claude/config/prds-hooks.json` → `{"enforce_prds": false}`, or `# hook-bypass: prds-body-deferred`.
5. Progressive `git push` before any PR exists is allowed; body is enforced once a PR exists and on `gh pr create|edit`.

## Pilot

make-no-mistakes `/implement` → `references/implement/*` + `templates/bilingual-issue-brief.md`.
