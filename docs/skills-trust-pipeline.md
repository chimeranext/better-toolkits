# Skills trust pipeline (SkillSpector + evals + cards)

Cómo conviven escaneo, evaluación, firmas y skill cards en este monorepo.
Basado en [A Trust Pipeline for Agent Skills](https://docs.nvidia.com/skills/agent-skill-trust-pipeline).

## Capas

| Pregunta | Evidencia | Estado aquí |
|---|---|---|
| ¿Es seguro instalarlo? | Reporte SkillSpector | ✅ CI `skillspector.yml` (bloquea HIGH+) |
| ¿Mejora al agente? | `BENCHMARK.md` + `evals/evals.json` | ⬜ Solo skills que lo traigan (ver Tier 3) |
| ¿Qué hace y quién lo ownerea? | Skill card | ⬜ Template abajo; obligatoria para skills nuevos con tools/red |
| ¿Es lo que se revisó? | Firma `skill.oms.sig` | ⬜ No implementado |

## Scan (Tier 1, activo)

- `scripts/skillspector-gate.py [--no-llm]` escanea los 121+ skills y falla si
  alguno supera score 50. Ver [Scan Agent Skills](https://docs.nvidia.com/skills/scanning-agent-skills).
- Hallazgos aceptados por humano van al `.skillspector-baseline.yaml` de cada
  skill (nunca global silencioso). Regenerar baseline = re-revisar.
- LLM (on-demand, no gate): provider `openai_compatible` contra OpenRouter
  free u OpenCode Zen (ver `scripts/free-models.json`, con `lastFetched`).
  Prioridad en CI: Zen (`SKILLSPECTOR_ZEN_API_KEY`) > OpenRouter
  (`SKILLSPECTOR_COMPAT_API_KEY`) > estático. Keys vía secrets; jamás en disco.
- Tercera opción (no verificada end-to-end): OpenCode Zen como provider
  `openai_compatible` con `SKILLSPECTOR_COMPAT_BASE_URL=https://opencode.ai/zen/v1`.
  Requiere API key propia de `opencode.ai/auth` (la credencial local de
  `auth.json` da 403 en llamadas directas — verificado 2026-09-16) y un modelo
  free con endpoint `chat/completions` (Big Pickle, MiMo-V2.5, Ling Flash Fin,
  Nemotron 3 Ultra/Lightning — todos por tiempo limitado; Muse Spark
  Contributor Free solo sirve `responses`, incompatible con skillspector).
  Ojo privacidad: el tier Contributor Free entrena con tus prompts; Nemotron
  free es trial loggeado (no mandar secretos ni IP sensible).

## Evaluación (Tier 2+3, a demanda)

Tier 3 exige task set en `evals/evals.json` junto al `SKILL.md`
([Evaluate Agent Skills](https://docs.nvidia.com/skills/evaluating-agent-skills)).
No se gatea en CI todavía: si tu skill trae evals, el reviewer lo corre a mano.

## Skill cards

Skills nuevos con red/shell/MCP: agregar `skill-card.md` junto al `SKILL.md`
con el template [Skill Cards](https://docs.nvidia.com/skills/skill-cards)
(ver `docs/skill-card-template.md`). La card apunta a la evidencia: reporte
SkillSpector o link al CI, tag de release, riesgos aceptados.
