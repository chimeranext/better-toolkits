# Engineering Standards for any startup — the 6 best practices

> Adaptable desde el día uno. Estos estándares nacen de la práctica adoptada en
> HabitaNexus (`docs/process/code-organization-standards.md` y
> `docs/process/pull-request-description-and-scope.md`) y del estándar Seacrets.Online
> (`branching-strategy.md`, `qa-traceability-four-layers.md`). Se ofrecen aquí como
> baseline que cualquier startup puede adoptar desde el inicio. **No son un framework
> greenfield**: nombran y hacen exigibles convenciones que ya son buen estándar de industria.

| Sigla | Nombre | Alcance | Fuente |
| --- | --- | --- | --- |
| **DSMS** | Domain-Sliced Module Structure | Dónde viven los archivos (carpetas/módulos) | `code-organization-standards.md` |
| **IFS** | Intra-File Structure | Cómo se lee un archivo de arriba a abajo | `code-organization-standards.md` |
| **CPS** | Categorized Public Surface | Cómo exportan barrels/entrypoints públicos | `code-organization-standards.md` |
| **PRDS** | Pull Request Description Standards | Qué va en la descripción de un PR y qué tan grande es un PR revisable | `pull-request-description-and-scope.md` |
| **BrS** | Branching Strategy | Ramas, nombres y protección por tipo de repo | [branching-strategy.md](branching-strategy.md) |
| **QT4L** | QA Traceability (four layers) | Cómo un cambio mapea requisitos → tests automatizados → QA manual → ronda HITL | [qa-traceability-four-layers.md](qa-traceability-four-layers.md) |

**Orden de adopción:** documentar y revisar DSMS → IFS → CPS → PRDS → BrS → QT4L.
**Prioridad del día a día:** IFS, PRDS y QT4L (ritmo de lectura, ritmo de revisión y
trazabilidad requisito→test en cada cambio).

## Política de adopción

- **Solo incremental** — aplicar al añadir o editar materialmente código de esa área. NO
  refactorizar árboles legacy para cumplir.
- **Repos satélite** — el `AGENTS.md` del repo del cliente enlaza a este doc; no duplicar
  el texto completo en paquetes/apps.
- **No es licencia de refactor** — adoptar estos estándares no autoriza reordenaciones
  masivas fuera del alcance del ticket actual.

---

## 1. DSMS — Domain-Sliced Module Structure

Organizar carpetas/módulos por **dominio/capacidad primero**, y luego por capa técnica.

- Apps/mobile: `lib/features/{feature}/{presentation|domain|data}/`
- Backend: módulos por bounded context (`apps/{contexto}/`)
- Paquetes compartidos: `packages/{paquete}/`
- UI/design system: `{feature}/{atoms|molecules|organisms|templates}/`

Reglas: tras la raíz (`lib/`, `apps/{app}/`) el siguiente segmento DEBE ser un dominio
(`coworking`, `checkout`, `contract`, …), no una capa técnica pelada (`widgets/`,
`services/` en la raíz). Las capas van debajo de la feature. Lo cross-feature vive en
`core/`/`shared/` reservados.

Anti-patrones: layer-first top-level (`lib/widgets/Button.dart` sin feature), árboles
legacy planos + domain-sliced mezclados en el mismo PR.

PR checklist: módulos nuevos con `{feature}/{layer}/`, sin carpetas técnicas nuevas en
top-level, primitivas compartidas en `core/`/`shared/`.

## 2. IFS — Intra-File Structure

Orden canónico y secciones etiquetadas DENTRO de un único archivo fuente.

**Orden canónico (Dart/TS):**

1. Imports (framework → vendor → relativos; en Dart `dart:` → `package:` → relativos)
2. Tipos & interfaces (props/entidades primero)
3. Constantes & config
4. Clase principal / API pública
5. Helpers privados (menor detalle hacia abajo)
6. Exports al final (barrels con lógica local)

**Banners de sección obligatorios** (qué contiene + por qué existe):

```dart
// ---------------------------------------------------------------------------
// Types — formas de props y estado interno del widget
// ---------------------------------------------------------------------------
```

Reglas: secciones mayores con banner `// ---`; comentarios inline para el *why* local de
edge cases, nunca para el *what*; doc comments (`///`) solo para API pública.

Anti-patrones: archivo >~500 líneas sin extraer a hermanos DSMS; niveles de abstracción
mezclados; bloques misteriosos sin etiqueta; exports dispersos a mitad de archivo.

## 3. CPS — Categorized Public Surface

Barrels públicos y entrypoints agrupan exports por **slice de dominio**, luego por
**tipo** (runtime → type-only → deprecated), con banners.

- Entrypoints de paquete: `lib/{paquete}.dart`
- Barrels de feature: `features/{feature}/{feature}.dart`
- UI repos: marcar capas Atomic en top-level (`// Atoms`) y anidar banners de feature.

Reglas: agrupar por feature DSMS primero; dentro, runtime → `export type`/`show` de tipos
→ deprecated; banners obligatorios; siempre `export type` para símbolos solo-tipo (TS);
sin exports especulativos sin consumidor.

Anti-patrones: `export`/`export type` intercalados sin agrupar; espagueti de features en
una lista sin etiquetar; `export` pelado de tipos; exports sin uso.

## 4. PRDS — Pull Request Description Standards

PRs de la startup son **human-in-the-loop**. Un revisor debe entender el cambio, confiar
en el plan de pruebas y detectar scope creep sin releer cada línea de un mega-diff.

**Template de descripción** (o template automático en `.github/PULL_REQUEST_TEMPLATE.md`):

```markdown
## Resumen
- Qué cambia (resultado, no lista de archivos)
- Por qué ahora (problema, ticket o enlace a spec/PRD)
- Cómo (1–2 frases del enfoque — solo cuando el diff no es obvio)

## Linear
Fixes <ID-TRACKER-N>
- Issue: <url>
- OpenSpec (si aplica): `openspec/changes/{slug}/`
- PRs relacionados (si aplica)

## Plan de pruebas
- [ ] ...

## Límites de alcance (fuera de scope)
- Listar explícitamente qué NO cambia este PR

## Riesgo / rollout
- Migraciones, feature flags, API breaking, config solo-prod — o N/A

## Screenshots / evidencia
- UI: antes/después; Ops: kubectl/terraform/CI — o N/A
```

**Título:** `<type>(<scope>): <resultado> (TICKET-N)` — no `Fix bug`, no `WIP`.
**Rama:** `*/{ticket-lower}-{slug}`. **Tamaño:** ~≤400 líneas cambiadas (soft cap);
partir antes de abrir. **Una intención por PR** — sin refactors de paso, sin fixes no
relacionados, sin "ya que estaba aquí".

**Flujo con PR draft:** worktree por issue → `gh pr create --draft` en cuanto exista un
primer corte → commits progresivos → assignee/reviewer según equipo → undraft solo tras
OK humano → ping en el canal `#dev-*`.

**Checklist del agente:** rama/título/cuerpo con `TICKET-N`, template de todas las
secciones, plan de pruebas con pasos concretos, límites de alcance listados, diff
revisable, commits desde el worktree, assignee correcto, DSMS/IFS/CPS satisfechos.

---

## Referencia rápida

| Pregunta | Práctica |
| --- | --- |
| ¿Va en `{feature}/` o `core/`? | DSMS |
| ¿Orden imports → types → main → helpers? | IFS |
| ¿Banner `// ---`? | IFS (archivo) / CPS (barrel) |
| ¿Sale en el barrel del paquete? | CPS |
| ¿Cómo escribo la descripción del PR? | PRDS |
| ¿De dónde sale cada rama y qué protejo? | BrS (`branching-strategy.md`) |
| ¿Cómo trazo requisito → test → QA → HITL? | QT4L (`qa-traceability-four-layers.md`) |

## Fuente y acreditación

Adaptado de los estándares de HabitaNexus monorepo y Seacrets.Online:

- `docs/process/code-organization-standards.md` — DSMS / IFS / CPS
- `docs/process/pull-request-description-and-scope.md` — PRDS
- `reference/process/branching-strategy.md` — BrS
- `reference/process/qa-traceability-four-layers.md` — QT4L
- `.github/PULL_REQUEST_TEMPLATE.md` — template de PR
- `AGENTS.md` — punteros obligatorios antes de abrir PR