# Proposal — code-conventions-layer

Change ID: `code-conventions-layer`

## Why

Las convenciones de "código bien escrito" viven hoy sin una fuente pineada y
versionada por lenguaje: links sueltos, docs sin versionar o memoria de sesión.
Además, cuando existen, se enforcean como **blockers** — impide auditar quién
incumple más y con qué tendencia, porque no queda registro acumulado de la deuda.

Esta change consolida en UNA capa (`shared/references/conventions/`) los dos
cambios que antes estaban separados:

1. **Molde/schema** (antes `add-conventions-layer`): árbol parametrizable
   `language/<id>/` + `frameworks/<fw>.md`, record versionado (SemVer/TTL),
   SOURCES pineadas con peso, RULES por mecanismo, GATE dual-lane, RECEIPT.
2. **Auditoría** (antes `code-conventions-audit`): checks warn-no-block, registro
   versionado en `internal-audits`, y `/code-conventions-audit`.

## What Changes

- Árbol `shared/references/conventions/` con plantilla única
  (`convention-record`) y `level: language | framework | platform | dataset`.
- Record versionado: id kebab-case, SemVer, `status`, `extracted_at`/`ttl_expires`,
  SOURCES pineadas con peso (`load-bearing | context`), RULES por mecanismo,
  COUNTEREXAMPLES, GATE dual (local rápido + CI completo, ambos pineados),
  LESSONS numeradas, RECEIPT con `candidate_sha`.
- Primer record ejemplar `language/elixir` v0.1.0 + hijo `frameworks/phoenix`.
- Checks de convención → `warn` (no-block) + registro de cada violación.
- Registrador warn (make-no-mistakes): acumula y pushea en batch a `internal-audits`.
- Repo de auditoría: default por entidad (`<org>/internal-audits`), centralización
  opt-in vía `auditsRepo`.
- `/code-conventions-audit` (assurance-toolkit): lee el log y produce reporte de
  cumplimiento.
- GATES de `language/*` → warn + registro (no block).

## Capabilities

### New Capabilities

- `shared/conventions-record`: schema y método genérico para cualquier lenguaje
  (árbol, pin de fuentes, reglas por mecanismo, gates dual-lane, TTL, receipt).
- `shared/conventions-audit`: protocolo de auditoría unificada (registro versionado
  en `internal-audits`, checks warn no-block, reporte histórico).
- `shared/conventions-elixir`: instancia ejemplar para dogfooding.

### Modified Capabilities

- `assurance-governance` / `assurance-testing-audit`: incluyen
  `code-conventions-audit`.
- records `language/*`: GATES pasan de block a warn + registro.

## Impact

- Afecta: `shared/references/conventions/` (nuevo), `assurance-toolkit`,
  `make-no-mistakes-toolkit`, nuevo repo `internal-audits`.
- Éxito verificable: `openspec validate --change code-conventions-layer` pasa;
  existe plantilla + record ejemplar; el módulo sample Elixir pasa los gates;
  el registrador escribe `internal-audits/.../code-conventions-audit-YYYY-MM-DD.md`;
  `/code-conventions-audit` reporta.
