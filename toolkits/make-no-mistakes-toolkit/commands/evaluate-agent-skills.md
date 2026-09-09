---
description: "Scan/evaluate agent skills with NVIDIA SkillSpector + SkillEvaluator (security + quality). Auto-installs peer CLIs via uv unless --no-install. Modes: scan | quality | validate | full."
argument-hint: "[scan|quality|validate|full] <skill-path-or-url> [--llm] [--format markdown|json|sarif] [--output <file>] [--no-install]"
priority: 72
---

# /evaluate-agent-skills: $ARGUMENTS

Read and follow [`references/evaluate-agent-skills/protocol.md`](../references/evaluate-agent-skills/protocol.md) (protocol SSOT).

Prefer the worker when present (auto-installs SkillSpector / SkillEvaluator via
`uv tool install` when missing; pass `--no-install` to skip):

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/evaluate-agent-skills.sh" $ARGUMENTS
```

Then **curate** the report (severity summary + verdict). Do not fabricate findings if
CLIs are still missing after install (or with `--no-install`) — stop with the
worker’s error. Do **not** hand the user “install these yourself” as the outcome
when they asked to evaluate — run the worker so it installs.

Tier 3 live eval remains opt-in + HITL + `evals/evals.json` (not default).

Upstream: [SkillSpector](https://github.com/NVIDIA/SkillSpector) ·
[Evaluating agent skills](https://docs.nvidia.com/skills/evaluating-agent-skills).
