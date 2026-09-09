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
[scan | quality | validate | full] <path-or-url> [--llm] [--format json|markdown|sarif] [--output <file>]
```

| Mode | Default CLI | Needs |
| --- | --- | --- |
| `scan` (default) | `skillspector scan …` | SkillSpector on PATH (`--no-llm` unless `--llm`) |
| `quality` | `skillevaluator quality-check …` | SkillEvaluator on PATH (keyless) |
| `validate` | `skillevaluator validate … --no-dedup` | SkillEvaluator + recommended Semgrep/Gitleaks/SkillSpector |
| `full` | `scan` then `validate` (HITL before Tier 3) | Same as validate; Tier 3 only with explicit user OK |

`<path-or-url>` — skill directory (`SKILL.md` inside), zip, git URL, or a toolkit
skills tree (e.g. `toolkits/make-no-mistakes-toolkit/skills/merge-advisor`).

---

## Install upstream (peer deps — document, don’t vendor)

```bash
# SkillSpector (security)
uv tool install git+https://github.com/NVIDIA/SkillSpector.git

# SkillEvaluator (quality + Tier 1 validate)
uv tool install --python 3.13 "skillevaluator[all] @ git+https://github.com/NVIDIA/SkillEvaluator.git"

# Full validate evidence (recommended)
# macOS: brew install semgrep gitleaks
# or:    uv tool install semgrep
```

Worker script (optional, same checks):  
`${CLAUDE_PLUGIN_ROOT}/scripts/evaluate-agent-skills.sh`

---

## Flow

### Step 1 — Resolve target

1. If `$ARGUMENTS` empty: ask (Claude `AskUserQuestion` / Cursor `AskQuestion`) for
   mode + path, or default to scanning changed `**/skills/**/SKILL.md` in the
   current git diff vs `main`.
2. Verify target exists (or is a URL/zip Spector accepts).
3. Prefer a directory that contains `SKILL.md`.

### Step 2 — Preflight

```bash
command -v skillspector   # required for scan / full / validate security evidence
command -v skillevaluator # required for quality / validate / full
```

If missing: print install commands above and **STOP** — do not fabricate findings.

### Step 3 — Run

Prefer the worker:

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/evaluate-agent-skills.sh" $ARGUMENTS
```

Or invoke CLIs directly per mode. Default Spector: `--no-llm` (deterministic,
no provider key). Pass `--llm` only when the user opts in and a provider key is
staged via `/secret-use` (never echo keys).

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

### Step 5 — Optional CI pointer

Link NVIDIA’s gate recipe: https://docs.nvidia.com/skills/skillevaluator/ci-integration  
Suggest a workflow only when the user asks; do not invent monorepo CI without HITL.

---

## Non-goals

- Vendoring SkillSpector / SkillEvaluator source into better-toolkits.
- Merging this into `/audit` / audit-engine families (orthogonal domain).
- Auto Tier 3 on every skill in the monorepo (costly; opt-in).
- Replacing Greptile / gemini-code-review for **code** PRs — this is for **skills**.

## Related

- NVIDIA evaluating skills: https://docs.nvidia.com/skills/evaluating-agent-skills  
- Scanning guide: https://docs.nvidia.com/skills/scanning-agent-skills  
- Monorepo note: [`docs/evaluate-agent-skills.md`](../../../../docs/evaluate-agent-skills.md)  
- `/triage-security-findings` — triage scanner output into backlog (after Spector)  
- `/gemini-code-review` — code diff review (different surface)
