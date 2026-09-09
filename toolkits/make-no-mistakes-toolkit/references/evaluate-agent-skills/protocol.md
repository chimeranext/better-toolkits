# /evaluate-agent-skills — protocol SSOT

Harness-agnostic body. Thin entries: `commands/evaluate-agent-skills.md`,
`skills/evaluate-agent-skills/SKILL.md`.

Wraps **upstream NVIDIA** tooling — do **not** vendor their trees into this BSL
monorepo (Apache-2.0 peer CLIs).

| Tool | Role | Upstream |
| --- | --- | --- |
| **SkillSpector** | Tier-1 security scan of agent skills | https://github.com/NVIDIA/SkillSpector |
| **SkillEvaluator** | Validation / quality / optional live eval | https://github.com/NVIDIA/SkillEvaluator |
| Docs | Evaluating agent skills | https://docs.nvidia.com/skills/evaluating-agent-skills |

Scanning ≠ quality. Spector answers “is it safe?”. Evaluator Tier 3 answers “does
it help?” via with/without-skill measurement ([NVIDIA docs](https://docs.nvidia.com/skills/evaluating-agent-skills)).

---

## Arguments

```
[scan | quality | validate | full] <path-or-url> [--llm] [--format json|markdown|sarif] [--output <file>] [--no-install]
```

| Mode | Default CLI | Needs |
| --- | --- | --- |
| `scan` (default) | `skillspector scan …` | SkillSpector on PATH (`--no-llm` unless `--llm`) |
| `quality` | `skillevaluator quality-check …` | SkillEvaluator on PATH (keyless) |
| `validate` | `skillevaluator validate … --no-dedup` | SkillEvaluator + recommended Semgrep/Gitleaks/SkillSpector |
| `full` | `scan` then `validate` (HITL before Tier 3) | Same as validate; Tier 3 only with explicit user OK |

`<path-or-url>` — skill directory (`SKILL.md` inside), zip, git URL, or a toolkit
skills tree (e.g. `toolkits/make-no-mistakes-toolkit/skills/merge-advisor`).

`--no-install` — skip auto-install of missing peer CLIs (fail with install hints).

---

## Peer CLIs (auto-install by default)

The worker installs missing peers via **`uv tool install`** when the user invoked
`/evaluate-agent-skills` (or the script) — that is the intentional happy path.
Pass `--no-install` to skip and only check PATH.

```bash
# What the worker runs when skillspector / skillevaluator is missing:
uv tool install git+https://github.com/NVIDIA/SkillSpector.git
uv tool install --python 3.13 "skillevaluator[all] @ git+https://github.com/NVIDIA/SkillEvaluator.git"
```

Requires **`uv`** on PATH when install is needed; otherwise exit 127 with a clear
error (link: https://docs.astral.sh/uv/getting-started/installation/). Install logs
go under `reports/evaluate-agent-skills/uv-tool-install-*.log` (tee).

Recommended extras for full validate evidence (not auto-installed):

```bash
# macOS: brew install semgrep gitleaks
# or:    uv tool install semgrep
```

Worker: `${CLAUDE_PLUGIN_ROOT}/scripts/evaluate-agent-skills.sh`

---

## Flow

### Step 1 — Resolve target

1. If `$ARGUMENTS` empty: ask (Claude `AskUserQuestion` / Cursor `AskQuestion`) for
   mode + path, or default to scanning changed `**/skills/**/SKILL.md` in the
   current git diff vs `main`.
2. Verify target exists (or is a URL/zip Spector accepts).
3. Prefer a directory that contains `SKILL.md`.

### Step 2 — Preflight / install

Prefer the worker — it auto-installs peers unless `--no-install`:

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/evaluate-agent-skills.sh" $ARGUMENTS
```

If invoking CLIs directly: ensure `skillspector` / `skillevaluator` on PATH (or
run the `uv tool install` lines above). If still missing after install attempt:
print hints and **STOP** — do not fabricate findings. Do **not** end with “install
yourself” as the product when the user asked to evaluate — run the worker so it
installs (unless they passed `--no-install`).

### Step 3 — Run

Default Spector: `--no-llm` (deterministic, no provider key). Pass `--llm` only
when the user opts in and a provider key is staged via `/secret-use` (never echo
keys).

Write reports under `reports/evaluate-agent-skills/` when `--output` omitted
(create dir). Prefer `--format markdown` for human curation + `json` for CI.

### Step 4 — Curate (orchestrator)

Do **not** dump raw SARIF/JSON only:

1. Summarize severity counts / risk score / quality grade.
2. Map HIGH/CRITICAL to actionable remediations on the skill files.
3. Drop noise; keep file:line when present.
4. Verdict: **safe to install?** / **publish-ready?** / **blocked** with reasons.
5. For Evaluator live Tier 3: require `evals/evals.json` (or accepted paths from
   NVIDIA docs). Without it, report Tier 3 skipped — same as missing BENCHMARK
   during review. **HITL** before spending sandbox/provider budget on Tier 3.
   Tier 3 is **opt-in**, never the default for `full`.

### Step 5 — Optional CI pointer

Link NVIDIA’s gate recipe: https://docs.nvidia.com/skills/skillevaluator/ci-integration  
Suggest a workflow only when the user asks; do not invent monorepo CI without HITL.

---

## Non-goals

- Vendoring SkillSpector / SkillEvaluator source into better-toolkits.
- Merging this into `/audit` / audit-engine families (orthogonal domain).
- Auto Tier 3 on every skill in the monorepo (costly; opt-in + HITL).
- Replacing Greptile / gemini-code-review for **code** PRs — this is for **skills**.

## Related

- NVIDIA evaluating skills: https://docs.nvidia.com/skills/evaluating-agent-skills  
- Scanning guide: https://docs.nvidia.com/skills/scanning-agent-skills  
- Monorepo note: [`docs/evaluate-agent-skills.md`](../../../../docs/evaluate-agent-skills.md)  
- `/triage-security-findings` — triage scanner output into backlog (after Spector)  
- `/gemini-code-review` — code diff review (different surface)
