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

## Peer CLIs (auto-install)

By default the worker installs missing peers with **`uv`** (happy path when you
invoke `/evaluate-agent-skills`). Pass `--no-install` to skip.

```bash
# What auto-install runs when missing:
uv tool install git+https://github.com/NVIDIA/SkillSpector.git
uv tool install --python 3.13 "skillevaluator[all] @ git+https://github.com/NVIDIA/SkillEvaluator.git"
```

Requires [`uv`](https://docs.astral.sh/uv/getting-started/installation/) on PATH
when install is needed. Logs: `reports/evaluate-agent-skills/uv-tool-install-*.log`.

Example:

```bash
bash toolkits/make-no-mistakes-toolkit/scripts/evaluate-agent-skills.sh \
  scan toolkits/make-no-mistakes-toolkit/skills/merge-advisor

# Skip auto-install (CI / air-gapped):
bash toolkits/make-no-mistakes-toolkit/scripts/evaluate-agent-skills.sh \
  scan toolkits/make-no-mistakes-toolkit/skills/merge-advisor --no-install
```

Tier 3 live evaluation (with/without skill) needs `evals/evals.json` and HITL —
see NVIDIA docs. Default flow stays Tier 1 / quality (deterministic); `full` does
**not** run Tier 3 without an explicit opt-in.
