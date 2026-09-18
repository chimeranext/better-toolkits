# Heimdall — protocol SSOT (local PR review)

Harness-agnostic body. Thin entries: `shared/skills/local-pr-review/SKILL.md`
(opencode/skills), toolkit commands that wrap it. Tool implementation:
`shared/heimdall/` (Heimdall engine).

Heimdall reviews the `git diff` of the current branch with an agentic LLM loop
and returns a verdict. **Local except for one network call**: diff → prompt →
render all happen on the machine; the only egress is LLM inference
(NVIDIA NIM, Kimi K2.6 default). It never touches GitHub nor CI in default mode.

## Preconditions

1. Engine available — prefer local `heimdall-review` on PATH (or run from
   `shared/heimdall/` with `bun run src/cli/review.ts diff`).
2. Secret `NVIDIA_API_KEY` resolvable **without writing it to disk**:
   - env var, or
   - `/secret-input` → `/secret-use NVIDIA_API_KEY -- <comando>` (preferred for
     agents), or
   - `infisical run -- <comando>` (centralized hygiene).
   Never paste the key in chat, logs, or tracked files.

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
