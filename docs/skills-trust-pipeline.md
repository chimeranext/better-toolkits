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
- Local con LLM (OpenRouter free): `SKILLSPECTOR_PROVIDER=openai_compatible`,
  `SKILLSPECTOR_COMPAT_BASE_URL=https://openrouter.ai/api/v1`,
  `SKILLSPECTOR_COMPAT_API_KEY` (vía `/secret-input`, jamás en disco),
  `SKILLSPECTOR_MODEL` (default CI: `google/gemma-4-31b-it:free`).
  Caveats free tier verificados 2026-09-16: modelos chicos fallan el schema
  estructurado, el pool compartido devuelve 429 bajo carga, y algunos slugs
  `:free` se dan de baja (verificar en `openrouter.ai/api/v1/models`). Por eso
  el gate CI es estático (determinista) y el LLM es capa on-demand, no gate.

## Evaluación (Tier 2+3, a demanda)

Tier 3 exige task set en `evals/evals.json` junto al `SKILL.md`
([Evaluate Agent Skills](https://docs.nvidia.com/skills/evaluating-agent-skills)).
No se gatea en CI todavía: si tu skill trae evals, el reviewer lo corre a mano.

## Skill cards

Skills nuevos con red/shell/MCP: agregar `skill-card.md` junto al `SKILL.md`
con el template [Skill Cards](https://docs.nvidia.com/skills/skill-cards)
(ver `docs/skill-card-template.md`). La card apunta a la evidencia: reporte
SkillSpector o link al CI, tag de release, riesgos aceptados.
