# /validate-skills — protocol SSOT

Valida los `SKILL.md` del repo contra la especificación **Agent Skills**
([agentskills.io/specification](https://agentskills.io/specification)). Es
**determinístico, offline y sin dependencias externas** (solo Python + PyYAML).

## Mínimos verificados (runner `scripts/ci/validate-skills.py`)

| Check | Regla (spec) |
|-------|--------------|
| Frontmatter | YAML válido entre `---` |
| `name` | `^[a-z][a-z0-9-]*[a-z0-9]$`, sin `--`, ≤64, **coincide con el nombre de la carpeta padre** |
| `description` | no vacía, ≤1024 caracteres |
| `compatibility` | si existe, ≤500 caracteres |

Uso:

```bash
python3 scripts/ci/validate-skills.py                 # shared/skills + toolkits/*/skills
python3 scripts/ci/validate-skills.py path/to/skills  # raíces custom
```

Exit: `0` todo OK · `1` problemas · `2` falta PyYAML.

## Herramientas y referencias (ecosistema)

| Recurso | Qué aporta | Uso |
|---------|-----------|-----|
| [Agent Skills spec](https://agentskills.io/specification) | Formato canónico de `SKILL.md` | SSOT del enfo |
| [`skills-ref`](https://github.com/agentskills/agentskills/tree/main/skills-ref) | Validador de referencia oficial (`skills-ref validate`) | útil, pero marcado "demonstration only" — no para producción |
| [SkillCheck Free](https://github.com/olgasafonova/SkillCheck-Free) | Skill de validación (frontmatter, body, naming, semantic, OWASP, Unicode invisible) read-only y offline | instalar como skill (`npx skills add olgasafonova/SkillCheck-Free`) |
| [SkillLens](https://github.com/microsoft/SkillLens) | Estudio sistemático de skills generados por modelo | lectura/insight |
| [SkillOpt](https://github.com/microsoft/skillopt) | Optimización de skills como parámetros entrenables | investigación avanzada |

## Criterio

El runner mínimo (`validate-skills.py`) es la **puerta determinística** en CI. Para
profundidad (semántica, OWASP, Unicode invisible) se usa **SkillCheck Free** como skill
adicional — es un mecanismo de validación LLM-guideado, no una puerta binaria.

## Related

- `commands/dogfood.md` / `references/dogfood/protocol.md` (confirmar que el skill funciona con valores reales)
- `scripts/ci/validate-skills.py` (runner)
