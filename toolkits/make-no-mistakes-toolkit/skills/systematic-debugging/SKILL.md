---
name: systematic-debugging
id: obra-superpowers-systematic-debugging
description: >
  Structured debugging approach for AI agents and systems — systematic
  isolation of variables, reproduction of failures, root-cause identification,
  and evidence-backed fixes. Source: obra/superpowers (systematic-debugging).
links:
  repository: https://github.com/obra/superpowers/tree/main/skills/systematic-debugging
  reference: https://github.com/obra/superpowers/blob/main/skills/systematic-debugging/SKILL.md
installed: false
---
# Systematic Debugging

When a feature, test, or protocol evidence shows unexpected results
(e.g., remote check FAIL, auth rotation partial, catalog mismatch),
apply systematic isolation before concluding root cause:

1. **Reproduce** in minimal environment (single process, single file).
2. **Isolate variables** (auth, version, remote, network, process state).
3. **Compare evidence** against protocol reference (`ready-to-review-mergeable/protocol.md`).
4. **Document 5-why chain** (`postmortem-*.md`) with each level backed by artifacts.
5. **Confirm fix** by re-running full evidence chain (not just partial check).

This prevents false conclusions (e.g., attributing a governance/version
failure to broken behavior) and ensures HITL handoff is evidence-based.
