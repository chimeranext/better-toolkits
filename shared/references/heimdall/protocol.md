# Heimdall — protocol SSOT (local PR review)

Harness-agnostic body. Thin entries: `shared/skills/local-pr-review/SKILL.md`
(skill SSOT), `shared/bootstrap/commands/local-pr-review.md` (Cursor slash;
plugin `skills/local-pr-review` → same skill). Tool implementation:
`shared/heimdall/` (Heimdall engine).

## Multi-provider (additive)

Default stays **Heimdall / Kimi / NVIDIA NIM** (`heimdall-review diff`). Extra
backends share one slash and the same “print only, never post” rules:

| `--provider` | Engine | Auth / API | Status |
|--------------|--------|------------|--------|
| `heimdall` (default) | Kimi K2.6 via **NVIDIA NIM** | `NVIDIA_API_KEY` | **shipped** |
| `openrouter-*` lanes (e.g. `openrouter-free`, `openrouter-kimi-k2.7-code`, `:free` slugs) | Models via [OpenRouter](https://openrouter.ai/) (OpenAI-compatible API) | `OPENROUTER_API_KEY` (optional; same `~/.agents/.heimdall.env` chain as NIM — `--openrouter-env` / `HEIMDALL_OPENROUTER_ENV`) | **shipped** — registry + ADR: `shared/heimdall/docs/content/decisions/openrouter-routing.md` |
| `gemini` / `gemini-direct` (Heimdall one-shot judge) | Gemini 3.5 Flash, **single JSON inference** (no tool loop by default) | `GOOGLE_AI_API_KEY` (Google AI `generateContent`) | **shipped** — `/local-pr-review --provider gemini` o `heimdall-review diff --provider gemini-direct` |

**Do not confuse:** `heimdall-review models:free` lists **NIM / NGC** models tagged
FREE/PREVIEW (validates `NVIDIA_API_KEY` against the integrate catalog). That is
**not** the OpenRouter **free router** (`--provider openrouter-free` → slug
`openrouter/free`). Use both when you want cheap NIM tiers vs OpenRouter’s
rotating free pool.

Heimdall reviews the `git diff` of the current branch with a **one-shot LLM-as-Judge**
(single inference → score 1.0–5.0 + P1–P4 findings; GitHub APPROVE/REQUEST_CHANGES
derived in `review-body-formatter`). **Local except for one network call**: diff →
prompt → render on the machine; egress is one LLM call per review (NVIDIA NIM default).
Legacy multi-turn tool loop: `REVIEWER_AGENTIC_LOOP=1`. Default mode never posts to GitHub.

## Preconditions

1. Engine available — prefer local `heimdall-review` on PATH (or run from
   `shared/heimdall/` with `bun run src/cli/review.ts diff`).
2. Secret `NVIDIA_API_KEY` resolvable **without writing it to disk**:
   - env var, or
   - `/secret-input` → `/secret-use NVIDIA_API_KEY -- <comando>` (preferred for
     agents), or
   - `infisical run -- <comando>` (centralized hygiene), or
   - key-chain local (persisted, owner-only): `.heimdall.env` — `<repo>/.heimdall.env`
     (project scope, gitignored) → `~/.agents/.heimdall.env` (user scope, 0600;
     STAGING+PROD conviven con nombres decorados). Env: `--env` /
     `HEIMDALL_NVIDIA_ENV` (default staging); el env elige la variable dentro del
     archivo, no el nombre del archivo.
   Never paste the key in chat, logs, or tracked files.
   **OpenRouter (optional):** for `openrouter-*` providers, set
   `OPENROUTER_API_KEY` (or decorated `OPENROUTER_API_KEY_STAGING` /
   `OPENROUTER_API_KEY_PROD` in `~/.agents/.heimdall.env` via `key:init`). NIM
   remains required for the default lane even when OpenRouter is configured.
3. Key relocation (dogfooding): `heimdall-review key:migrate --env <e>` moves
   repo keys into `~/.agents/.heimdall.env` (merge, never deletes the original);
   `heimdall-review models:free [--match <sub>]` validates the migrated key
   against the live NIM catalog + NGC tags without ever printing it.

## Flow

1. Resolve base ref: `$ARGUMENTS --base <ref>`, else merge-base with `origin/HEAD`.
2. Run: `heimdall-review diff [--base <ref>]` (prints; never posts).
   PR mode: `heimdall-review pr <n>` prints (dry-run); `--post` posts (requires
   `GITHUB_TOKEN` + explicit user OK — never default).
3. Relay findings grouped by severity (P1 / P2 / P3 / P4) and state the verdict:
   **APPROVE** or **REQUEST_CHANGES**.

## Rules

- Default is read-only toward remotes: no `--post`, no push, no CI triggers.
- `$ARGUMENTS` pass through to `heimdall-review diff` verbatim.
- If the binary is missing and cannot be installed, fall back to `bunx`
  (requires network) or report blocked — never fake a review.
- Secrets: `/secret-clear` when done if staged via `/secret-input`.
