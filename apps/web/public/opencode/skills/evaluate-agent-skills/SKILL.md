---
name: evaluate-agent-skills
description: >-
  Scan or evaluate AI agent skills with NVIDIA SkillSpector (security) and
  SkillEvaluator (quality/validate). Auto-installs peer CLIs via uv unless
  --no-install. Use when the user asks to scan a skill, evaluate SKILL.md
  packages, run skillspector, check skill safety before install/publish, or
  /evaluate-agent-skills. Not for ordinary code PR review.
---

# evaluate-agent-skills

Read and follow the protocol SSOT:

[`../../references/evaluate-agent-skills/protocol.md`](../../references/evaluate-agent-skills/protocol.md)

Prefer `scripts/evaluate-agent-skills.sh` — it installs missing peers with `uv`
unless `--no-install`. Require `uv` when install is needed; do not dump manual
install instructions as the product when the user asked to evaluate.

Claude: `AskUserQuestion` for mode/path when missing. Cursor: **`AskQuestion`**.
HITL before Tier 3 live evaluation (sandbox + provider cost). Tier 3 is opt-in.
