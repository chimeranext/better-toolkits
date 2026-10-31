# shared/conventions-record Specification

## Purpose

Schema y método genérico para convenciones de cualquier lenguaje: fuentes pineadas con peso, reglas por mecanismo, contraejemplos, gates dual-lane pineados, lecciones numeradas, TTL con re-extracción y receipts con huella de candidato.

## Requirements

### Requirement: Árbol parametrizado, no plano

El sistema SHALL alojar convenciones en el árbol `shared/references/conventions/<level>/<id>/`: `language/<id>/README.md` (record de lenguaje: compilador/linter) y `language/<id>/frameworks/<fw>.md` (record de framework). Las ramas `platform/<id>/` y `dataset/<id>/` quedan reservadas con el mismo molde y `level` declarado en cada record.

#### Scenario: Ruta predecible por nivel

- **WHEN** un agente necesita convenciones de un framework
- **THEN** las encuentra en `language/<lang>/frameworks/<fw>.md` sin adivinar rutas

#### Scenario: Rama reservada no se usa sin spec

- **WHEN** alguien quiere `platform/<id>/` o `dataset/<id>/`
- **THEN** debe abrir change propia; esta change solo reserva los nombres

### Requirement: Record versionado en shared/

El sistema SHALL versionar cada record con id kebab-case, versión SemVer, status (`draft | active | deprecated`) y fechas `extracted_at`/`ttl_expires`. Lo transversal vive en `shared/`; ningún toolkit ownéa convenciones.

#### Scenario: Record localizable y vigente

- **WHEN** un agente necesita la convención de un lenguaje
- **THEN** la encuentra por id, con versión y TTL legibles en la cabecera

#### Scenario: TTL vencido dispara re-extracción

- **WHEN** `ttl_expires` pasa sin re-extracción
- **THEN** el record se marca `deprecated` hasta revalidar fuentes, nunca se borra

### Requirement: Hijo framework hereda y especializa

El sistema SHALL hacer que `frameworks/<fw>.md` herede los GATES del lenguaje padre y agregue solo sus RULES/SOURCES propias (ej. Phoenix suma guías de contextos y LiveView sobre la base Elixir).

#### Scenario: Sin duplicación de gates

- **WHEN** se audita un record de framework
- **THEN** no repite los gates del padre; referencia su versión exacta

### Requirement: Fuentes pineadas con peso

El sistema SHALL declarar cada fuente con kind (`context7 | repo | docs | video-transcript`), ref exacta (ID + versión/fecha/commit) y peso (`load-bearing | context`). Cada RULE traza a ≥1 fuente load-bearing.

#### Scenario: Regla sin fuente se rechaza

- **WHEN** una RULE no traza a fuente load-bearing
- **THEN** la revisión del record la devuelve como inventada

#### Scenario: Fuente equivocada por mecanismo se corrige

- **WHEN** una fuente no cubre el mecanismo (ej. libro general para bus-sharing)
- **THEN** su peso baja a `context` y se pinea la fuente exacta del mecanismo

### Requirement: Reglas por mecanismo con contraejemplos

El sistema SHALL redactar RULES por mecanismo (`pipe-discipline`, `tagged-tuples`), no por lenguaje en general, y cada record SHALL incluir ≥1 COUNTEREXAMPLE (par wrong/right).

#### Scenario: Aprendiz genera contra el record

- **WHEN** se pide código bajo una convención
- **THEN** el agente carga RULES + COUNTEREXAMPLES del mecanismo antes de generar

### Requirement: Gates dual-lane pineados

El sistema SHALL declarar GATE local (subset rápido, estilo pre-push) y GATE CI (completo, flavor pineado), ambos con versión exacta; el local SHALL ser subset del CI, nunca al revés.

#### Scenario: Skew local-vs-CI se detecta

- **WHEN** el gate local pasa y el CI falla por versión distinta
- **THEN** se registra como defecto del pin, no del código

### Requirement: Lecciones numeradas desde PRs cerrados

El sistema SHALL numerar lecciones en serie continua desde PRs cerrados (`LESSON: origin_pr + number + text`) y cada lección SHALL originar o refinar una RULE.

#### Scenario: PR con lección alimenta el record

- **WHEN** un PR cerrado documenta una lección (ej. filtro de tópico propio)
- **THEN** entra numerada y traza a la RULE que crea o cambia

### Requirement: Receipt con huella de candidato

El sistema SHALL emitir receipt por veredicto con `candidate_sha` (hash del diff exacto), risk tier (`0 | 1 | high`), lenses corridos y verdict (`APPROVE | REQUEST_CHANGES | INCONCLUSIVE`); commit/push/PR solo si el árbol coincide con el sha. Este requirement rige el receipt del dogfood de convenciones; el formato canónico general se define en la change posterior de assurance-governance y este lo referenciará.

#### Scenario: Byte distinto invalida

- **WHEN** el árbol cambia un byte tras el receipt
- **THEN** el recibo deja de autorizar commit hasta re-verificar

### Requirement: Checks warn no-block

El sistema SHALL emitir `warn` (no bloquear el merge) ante una violación de convención, permitiendo registrar la deuda sin frenar el trabajo.

#### Scenario: Violación registrada sin bloquear

- **WHEN** un check de convención detecta una violación
- **THEN** emite `warn`, registra la violación y no bloquea el merge

### Requirement: Registro versionado — default por entidad, centralización opt-in

El sistema SHALL registrar cada violación bajo `conventions/code-conventions-audit-YYYY-MM-DD.md` (append-only). Por defecto `<org>/internal-audits`; centralización solo si la entidad configura `auditsRepo`.

#### Scenario: Registro por día

- **WHEN** un registrador warn procesa violaciones
- **THEN** agrega entradas al archivo del día actual, sin editar días anteriores

#### Scenario: Default por entidad

- **WHEN** una entidad no configura `auditsRepo`
- **THEN** el registro escribe a `<org>/internal-audits`

#### Scenario: Centralización opt-in

- **WHEN** una entidad configura `auditsRepo` a un repo compartido
- **THEN** el registro escribe al repo compartido

#### Scenario: Append-only preserva historial

- **WHEN** un agente intenta editar/borrar una entrada de un día anterior
- **THEN** el sistema lo rechaza (append-only)

### Requirement: Comando code-conventions-audit

El sistema SHALL proveer `/code-conventions-audit` (en assurance-toolkit) que lee el log histórico, agrega repo-health + clean-code + records de lenguaje, y produce un reporte de cumplimiento.

#### Scenario: Reporte de cumplimiento

- **WHEN** se ejecuta `/code-conventions-audit`
- **THEN** produce un reporte por convención y por autor a partir del log fechado

#### Scenario: El log es el SSOT

- **WHEN** el comando genera el reporte
- **THEN** deriva el ranking sin persistir un archivo de ranking

### Requirement: Registrador warn en make-no-mistakes

El sistema SHALL proveer un registrador warn que acumula violaciones y las pushea en batch a `internal-audits`.

#### Scenario: Batch push

- **WHEN** un hook warn detecta violaciones
- **THEN** el registrador las acumula y las pushea en un batch por run

### Requirement: GATES de records de lenguaje → warn + registro

El sistema SHALL actualizar los GATES de `shared/references/conventions/language/*` para usar warn-no-block + registro en vez de block.

#### Scenario: GATE actualizado

- **WHEN** un record de lenguaje define su gate
- **THEN** usa warn + registro a `internal-audits`, no block

### Requirement: assurance-governance extiende a code-conventions-audit

El sistema SHALL incluir `code-conventions-audit` como audit de QA/gobernanza dentro de assurance-toolkit.

#### Scenario: Audit de gobernanza

- **WHEN** un revisor ejecuta el audit de gobernanza
- **THEN** `/code-conventions-audit` está disponible y reporta cumplimiento
