---
description: "Scan/evaluate agent skills with NVIDIA SkillSpector + SkillEvaluator (security + quality). Peer CLIs — not vendored. Modes: scan | quality | validate | full."
argument-hint: "[scan|quality|validate|full] <skill-path-or-url> [--llm] [--format markdown|json|sarif] [--output <file>]"
priority: 72
---

# /evaluate-agent-skills: $ARGUMENTS

Read and follow [`references/evaluate-agent-skills/protocol.md`](../references/evaluate-agent-skills/protocol.md) (protocol SSOT).

Prefer the worker when present:

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/evaluate-agent-skills.sh" $ARGUMENTS
```

Then **curate** the report (severity summary + verdict). Do not fabricate findings if
CLIs are missing — print upstream install commands and stop.

Upstream: [SkillSpector](https://github.com/NVIDIA/SkillSpector) ·
[Evaluating agent skills](https://docs.nvidia.com/skills/evaluating-agent-skills).
