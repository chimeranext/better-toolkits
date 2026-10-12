---
description: Cheap first-pass code review (one-shot via liteLLM) on a parametrizable model — Gemini 3.5 Flash by default, or any provider via --model; supports --adversarial. Curated by the orchestrator against the local repo's CLAUDE.md. Design B — no nested agent.
argument-hint: "[PR# | branch | --uncommitted] [--model <id>] [--adversarial]  (default: <base>...HEAD, gemini-3.5-flash)"
---
# /gemini-code-review — MOVED (shim)

> **DEPRECATION WARNING:** this command merges into `local-pr-review --provider gemini`
> (multi-provider review: Heimdall/Kimi, Gemini, others via API — same interface, different
> backend). This file is a thin shim and will be removed in the next minor.
> NOTE: the `--provider` flag on `local-pr-review` is mnm-side follow-up work
> (no `local-pr-review` command exists in this repo yet); until then, the pre-move
> behavior above is preserved in git history.
