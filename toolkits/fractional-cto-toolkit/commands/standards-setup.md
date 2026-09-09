---
description: "Adopta los engineering standards (DSMS, IFS, CPS, PRDS, BrS, QT4L) en un repo del cliente: crea AGENTS.md con punteros, docs/process/ con los estándares, .github/PULL_REQUEST_TEMPLATE.md y el template de QA traceability. Igual workflow que inicia un engagement: setup incremental, nunca refactor masivo."
argument-hint: "[--repo <path>] [--standards dsms,ifs,cps,prds,brs,qt4l] [--dry-run]"
---

# /standards-setup — adopt the engineering standards in a client repo

Eres un **fractional CTO** preparando la baseline de ingeniería de un cliente.
Tu output es el **scaffold** que hace exigibles los 6 engineering standards desde
el día uno, ENLAZANDO a las references (SSOT) en lugar de duplicar su contenido.

Convención del monorepo: el `AGENTS.md` del cliente enlaza a estos estándares;
los docs fuentes nunca se duplican en paquetes/apps (`references/engineering-standards/*`).

## Read first

Protocol SSOT: `references/engineering-standards/README.md` (índice de las 6
prácticas) y los adapters por standard:

- `references/engineering-standards/README.md` — DSMS / IFS / CPS / PRDS (inline)
- `references/engineering-standards/branching-strategy.md` — BrS
- `references/engineering-standards/qa-traceability-four-layers.md` — QT4L

## Output (por defecto en `<repo>/`)

- `AGENTS.md` — bloque de punteros obligatorios: los 6 estándares + PR template +
  QA traceability, con la regla "antes de abrir un PR, leer X/Y/Z".
- `docs/process/engineering-standards.md` — índice local (1 por repo, apunta a los
  SSOT) con la tabla de las 6 prácticas + orden de adopción.
- `.github/PULL_REQUEST_TEMPLATE.md` — template PRDS (secciones Resumen, Linear,
  Plan de pruebas, Límites de alcance, Riesgo/rollout, Evidencia).
- `docs/process/qa-traceability.md` — mini-guía QT4L: cuándo es obligatoria la
  sección en `tasks.md` + la tabla scenario → verificación a copiar en todo
  cambio de comportamiento (referencia al SSOT de 4 capas).

Con `--standards` se puede restringir a un subconjunto (p. ej. `--standards
dsms,ifs,cps`); por defecto adopta las 6.

## Flujo

### Paso 1 — Inspeccionar el repo objetivo

- ¿Existe `AGENTS.md`? ¿Ya tiene punteros a standards? (no duplicar)
- ¿Existe `.github/PULL_REQUEST_TEMPLATE.md`? (mergear, no pisar)
- ¿Stack? Dardo/TS/K8s/backend — informa el árbol DSMS sugerido.
- ¿Ramas? Documentar el estado actual en `docs/branching.md` según
  `branching-strategy.md` (por tipo de repo: app vs infra/gitops vs docs).

### Paso 2 — Generar el scaffold

1. Escribe/mergea `AGENTS.md` con el bloque de punteros (nombrando los SSOT
   exactos a leer — rutas relativas al repo).
2. Crea `docs/process/engineering-standards.md` con la tabla de las 6 prácticas
   y el orden de adopción.
3. Crea/pisa `.github/PULL_REQUEST_TEMPLATE.md` con el template PRDS.
4. Crea `docs/process/qa-traceability.md` con el mini-template QT4L.
5. (`--branching`) Escribe `docs/branching.md` por tipo de repo según
   `branching-strategy.md`.

### Paso 3 — Verificar y entregar

- [ ] `AGENTS.md` enlaza a los SSOT (rutas verificables) — sin duplicar el texto completo
- [ ] PR template con todas las secciones PRDS
- [ ] QA traceability template disponible para `tasks.md` de cambios de comportamiento
- [ ] `--dry-run`: sin cambios escritos, solo reporte
- [ ] Cambios ya commiteados en la rama feature del cliente con PRDS (si es un repo git): `gh pr create --draft`

Cierra indicando el siguiente paso: correr **`/standards-audit`** sobre el repo
para verificar el estado de adopción, y (si hay changes de comportamiento
abiertos) exigir la sección QT4L en sus `tasks.md`.

## Relación con otros skills

- `/make-no-mistakes:audit-enforcement-hooks` — audita si hay gates de
  enforcement para reglas estructurales; complementa a este setup (que crea los
  docs, no los hooks).
- `/requirements-authoring` — si el repo maneja specs, el pipeline
  requirements-first (PRD → OpenSpec) convive con estos estándares: QT4L cierra
  el lazo requisitos → tests.