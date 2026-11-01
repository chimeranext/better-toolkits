# convention: codeowners-rotation
id: codeowners-rotation · version: 0.1.0 · status: draft · level: platform
extracted_at: 2026-10-31 · ttl_expires: 2027-04-30
parent: none

## GOAL

Un `.github/CODEOWNERS` (o `CODEOWNERS`) que esté "bien escrito" bajo este record
no tiene reglas muertas: cada patrón matchea al menos un archivo trackeado.

## SOURCES

| # | kind | ref (ID + versión/fecha) | weight | para qué |
|---|------|--------------------------|--------|----------|
| S1 | repo | incidente de rotación de CODEOWNERS (patrón con typo quedó inerte e invisible) | load-bearing | motivación del check |
| S2 | repo | `git ls-files` como corpus de archivos trackeados | load-bearing | base del matcheo |
| S3 | repo | semántica wildmatch de git (referencia para matcheo profundo) | context | plata real del check |

## RULES

- R1 [pipe-discipline] Todo patrón en CODEOWNERS debe matchear ≥1 archivo
  trackeado → S2
- R2 [pipe-discipline] Un patrón muerto (0 matches) es un defecto y debe
  reportarse como error, no como warning → S1
- R3 [pipe-discipline] Patrones con typo (path renombrado o mal escrito) se
  detectan como muertos, no como "cobertura" → S1, S2
- R4 [pipe-discipline] Si el matcheo es superficial (glob), el repo debe
  decidir explícitamente si necesita matcheo de sandbox (`git check-ignore`
  en repo vacío) para repos grandes con `.gitignore` complejos → S3

## COUNTEREXAMPLES

```text
# ❌ wrong: patrón que no matchea nada (resto del archivo intacto)
infrastructure/terraform/**/removed-path/ @org/founders

# ✅ right: patrón que sí matchea archivos existentes
infrastructure/terraform/** @org/founders
```

## GATES

- local: `node scripts/check-codeowners-rot.mjs` (exit 0) + git ls-files
- CI: trigger `pull_request` (path-filtered a CODEOWNERS) + `schedule` diario
  (para detectar rot que ocurre al moverse otros archivos)

## LESSONS

- L1: Una regla muerta es peor que una ausente: hace que el archivo PAREZCA
  cubierto, así que nadie la nota. → RULE R2
- L2: El rot ocurre cuando OTROS archivos se mueven, no cuando se edita
  CODEOWNERS — por eso el trigger `schedule` es necesario. → RULE R2

## RECEIPT

<!-- candidate_sha + risk tier + lenses + verdict — emitido en el dogfood del
     check-codeowners-rot.mjs.tpl -->
