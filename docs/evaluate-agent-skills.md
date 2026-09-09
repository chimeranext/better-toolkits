# Evaluate agent skills (NVIDIA SkillSpector / SkillEvaluator)

better-toolkits wraps **upstream** NVIDIA CLIs — it does **not** vendor their source
(Apache-2.0 peers vs this monorepo’s BSL-1.1).

| Resource | Link |
| --- | --- |
| Why evaluate (not only scan) | https://docs.nvidia.com/skills/evaluating-agent-skills |
| SkillSpector (security) | https://github.com/NVIDIA/SkillSpector |
| SkillEvaluator | https://docs.nvidia.com/skills/skillevaluator |
| Scanning guide | https://docs.nvidia.com/skills/scanning-agent-skills |

## In this monorepo

```text
/make-no-mistakes:evaluate-agent-skills [scan|quality|validate|full] <skill-path>
```

Protocol SSOT:
[`toolkits/make-no-mistakes-toolkit/references/evaluate-agent-skills/protocol.md`](../toolkits/make-no-mistakes-toolkit/references/evaluate-agent-skills/protocol.md)

Worker:
`toolkits/make-no-mistakes-toolkit/scripts/evaluate-agent-skills.sh`

## Install peers

```bash
uv tool install git+https://github.com/NVIDIA/SkillSpector.git
uv tool install --python 3.13 "skillevaluator[all] @ git+https://github.com/NVIDIA/SkillEvaluator.git"
```

Then e.g.:

```bash
bash toolkits/make-no-mistakes-toolkit/scripts/evaluate-agent-skills.sh \
  scan toolkits/make-no-mistakes-toolkit/skills/merge-advisor
```

Tier 3 live evaluation (with/without skill) needs `evals/evals.json` and HITL —
see NVIDIA docs. Default flow stays Tier 1 / quality (deterministic).
