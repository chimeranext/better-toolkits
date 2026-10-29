---
description: "Validate SKILL.md files against the Agent Skills specification (agentskills.io). Deterministic, offline, no external deps. Runs scripts/ci/validate-skills.py over the repo skills. Reports non-conformance (missing frontmatter, invalid name/description)."
argument-hint: "[roots...]"
priority: 86
---
# /validate-skills

Read and follow [`references/validate-skills/protocol.md`](../references/validate-skills/protocol.md) (protocol SSOT).

Run the deterministic checker:

```bash
python3 scripts/ci/validate-skills.py
```

`$ARGUMENTS` (opcional): raíces custom a validar. Exit: `0` OK · `1` problemas ·
`2` falta PyYAML.

Esto es una herramienta de conformidad, no una puerta automática de CI todavía: si el repo
aún tiene skills no conformes, el runner los reporta para limpieza progresiva.
