---
description: Traducción masiva de contenido de cursos a otro locale usando un modelo económico (Gemini 3.5 Flash por default) vía liteLLM, con fan-out de sub-agents por módulo y curación por el orquestador. Variante cost-optimized de /translate-content.
argument-hint: "[course-slug | course-slug/module-slug] [--model <litellm-id>] [--target-locale <label>]"
---

# Translate Content (Gemini): $ARGUMENTS

A **cost-optimized bulk translation** pass. The heavy translation runs on
**Gemini 3.5 Flash** (cheap/fast) — one one-shot completion per content file
through `${CLAUDE_PLUGIN_ROOT}/scripts/gemini-translate.sh` — while you (the
orchestrator, on a Claude model) own discovery, terminology locking, fan-out,
and curation. This is NOT a replacement for `/translate-content` (full
Claude-model pipeline) on high-stakes content; it's the bulk-throughput path.

Pattern source: `make-no-mistakes:gemini-code-review` (Design B — no nested
agent runs on the cheap model; no tool-call-translation fragility).

## How the two commands relate

| | `/translate-content` | `/translate-content-gemini` (this) |
|---|---|---|
| Translation engine | Claude (consumer's `translator` agent) | Gemini Flash (or any liteLLM model) per file |
| Cost profile | High — full Claude tokens per file | Low — Claude only orchestrates + curates |
| Quality ceiling | Highest (voice-aware end to end) | High after curation; needs the review pass |
| When | Flagship courses, tricky voice | Bulk backlogs, first-pass locale trees |

## Parse `$ARGUMENTS`

Same targeting as `/translate-content`: `{course-slug}` or
`{course-slug}/{module-slug}`. Optional: `--model <litellm-id>` (default
`gemini/gemini-3.5-flash`), `--target-locale <label>` (default Latin American
Spanish). Path conventions are consumer-specific; the chimera-academy convention
(`content/courses/{course-slug}/`, locale tree `es/`) is used below.

## Phase 1 — Discovery (identical contract to /translate-content Phase 1)

Build the TRANSLATION MANIFEST: source files, existing locale-tree files
(`new | update | skip`), estimated count. Read the consumer's translation
rules — `agents/translator.md` (or wherever the consumer keeps them) — and the
bundled `commands/_translation-strategy.md` / `commands/_translation-pipeline.md`
if present, for prior terminology decisions.

**API key check (before the gate):** the worker needs the provider key in the
environment — `gemini/*` → `GEMINI_API_KEY`, `openai|gpt*` → `OPENAI_API_KEY`,
`anthropic|claude-*` → `ANTHROPIC_API_KEY`. Have the operator stage it with
their secret helpers (e.g. `/secret-input` + `/secret-use`); never echo it. If
the key is unavailable, STOP — do not fall back to translating the whole run
yourself (that silently converts a cheap run into an expensive one; offer
`/translate-content` instead).

## Phase 2 — Review Gate

Present the manifest + model + estimated file count and wait for explicit
approval. Surface any files already translated (`update` vs `skip` decisions).

## Phase 3 — Lock terminology (orchestrator, sequential)

Translate the **course overview first** — run the worker on it, then curate it
yourself carefully. From the curated result, write a **glossary file** (temp
path is fine) with the binding decisions: framework names, recurring terms,
title conventions, what stays in English. Every subsequent worker call receives
it via `--glossary`. This is what keeps 40 parallel files terminologically
consistent.

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/gemini-translate.sh" \
  content/courses/{slug}/course-overview.md \
  --rules agents/translator.md \
  --out content/courses/{slug}/es/course-overview.md
```

## Phase 4 — Fan-out (sub-agents, one per module)

Dispatch one sub-agent per module (cap parallelism at 3-4 — each worker call
spawns a liteLLM proxy; they share the port and reuse a running proxy, but the
provider rate limits are shared too). Each sub-agent:

1. Receives: its module's file list, the rules path, the glossary path, the
   model id, and the target locale-tree base path.
2. For each file, in this order (terminology dependency order):
   module-overview → text classes → quizzes → challenges → video briefs:

   ```bash
   bash "${CLAUDE_PLUGIN_ROOT}/scripts/gemini-translate.sh" <src.md> \
     --rules <rules.md> --glossary <glossary.md> \
     --out <locale-tree path with same relative layout>
   ```

3. After writing each file, performs the **mechanical fixups** the worker
   intentionally does not do:
   - adjust relative image paths for the extra locale-tree depth (e.g. add one
     `../` when moving from `module-NN/classes/` to `es/module-NN/classes/`);
   - set `language: "{target-locale}"` in the frontmatter;
   - verify the frontmatter still parses and immutable keys (`au_id`, `slug`,
     `type`, quiz config keys) are byte-identical to the source.
4. Reports per file: OK | fixups applied | FAILED (with the worker's stderr).

If a worker call fails, the sub-agent retries once, then marks the file FAILED
and moves on — never fabricates a translation.

## Phase 5 — Curation (orchestrator; do NOT just relay)

Flash over-normalizes and occasionally drops markers. Curate before declaring
done:

1. **Structural diff** every translated file against its source: same heading
   count, same code-block count, same quiz-marker count (`### Q`, `**Correct:**`,
   `**Explanation:**`), same table shapes. Flag mismatches and re-run or fix.
2. **Sample-read** at least one text class per module against the consumer's
   translation rules (voice, register, banned literalisms). If the consumer
   ships a `translation-reviewer` agent, run it on the sample instead.
3. **Terminology sweep**: grep the locale tree for the glossary's binding terms
   and for their forbidden literal variants.
4. Anything systemically wrong (wrong register, broken quizzes) → fix the
   glossary/rules and re-run the affected files, not the whole tree.

## Phase 6 — Report

```
TRANSLATION RUN — {course} → {locale} · model {model-id}
files: {N} translated, {K} skipped, {F} failed
curation: {issues found → fixed}
follow-ups: {failed files, voice concerns for /translate-content}
```

Remind the operator to clear the staged API key (e.g. `/secret-clear`).

## Failure modes

| Symptom | Cause / fix |
|---|---|
| Worker exits 1 with missing key | Provider key not staged — stage it; do NOT export it into the conversation. |
| Output wrapped in a code fence | The worker strips one level; if it still happens, fix manually and note it. |
| Quiz markers translated (`**Correcto:**`) | Rubric violation — re-run the file; if persistent, pin those markers in the glossary. |
| Frontmatter keys renamed | Re-run the file; the immutable-key check in Phase 4.3 exists exactly for this. |
| Proxy port conflict | Set `GEMINI_TRANSLATE_PORT` to a free port. |
