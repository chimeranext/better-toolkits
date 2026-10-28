# Spec Delta — shared/conventions-audit

## Purpose

Protocolo de auditoría unificada de convenciones: checks warn (no-block), registro versionado
de violaciones en `internal-audits`, y reporte de cumplimiento histórico. Unifica repo-health
(6 familias), clean-code standards y records de lenguaje bajo un solo `code-conventions-audit`.

## ADDED Requirements

### Requirement: Checks warn no-block

El sistema SHALL emitir `warn` (no bloquear el merge) ante una violación de convención, en
lugar de block, para permitir registrar la deuda sin frenar el trabajo.

#### Scenario: Violación registrada sin bloquear

- **WHEN** un check de convención detecta una violación
- **THEN** emite `warn`, registra la violación y no bloquea el merge

### Requirement: Registro versionado — default por entidad, centralización opt-in

El sistema SHALL registrar cada violación como una entrada en el repo de auditoría de la
entidad bajo `conventions/code-conventions-audit-YYYY-MM-DD.md` (append-only, filename ISO).
Por defecto, cada venture/startup/serial entrepreneur independiente usa `<org>/internal-audits`;
la centralización en un repo compartido (p.ej. `chimeranext/internal-audits`) solo ocurre si
la entidad la adopta explícitamente vía `auditsRepo` (decisión opinionated de shared services,
no un requisito universal).

#### Scenario: Registro por día

- **WHEN** un registrador warn procesa violaciones
- **THEN** agrega las entradas al archivo del día actual en el repo de la entidad, sin
  editar días anteriores

#### Scenario: Default por entidad

- **WHEN** una entidad no configura `auditsRepo`
- **THEN** el registro escribe a `<org>/internal-audits` (el org del repo auditado)

#### Scenario: Centralización opt-in

- **WHEN** una entidad configura `auditsRepo` hacia un repo compartido (p.ej.
  `chimeranext/internal-audits`)
- **THEN** el registro escribe al repo compartido, porque la entidad adoptó explícitamente
  el modelo de shared services

#### Scenario: Append-only preserva historial

- **WHEN** un agente intenta editar/borrar una entrada de un día anterior
- **THEN** el sistema lo rechaza (append-only)

### Requirement: Comando code-conventions-audit

El sistema SHALL proveer `/code-conventions-audit` (en assurance-toolkit) que lee el log
histórico de `internal-audits`, agrega repo-health + clean-code + records de lenguaje, y
produce un reporte de cumplimiento.

#### Scenario: Reporte de cumplimiento

- **WHEN** se ejecuta `/code-conventions-audit`
- **THEN** produce un reporte por convención y por autor a partir del log fechado

#### Scenario: El log es el SSOT

- **WHEN** el comando genera el reporte
- **THEN** deriva el ranking en su salida sin persistir un archivo de ranking

### Requirement: Registrador warn en make-no-mistakes

El sistema SHALL proveer un registrador warn (en make-no-mistakes) que acumula violaciones y
las pushea en batch a `internal-audits`.

#### Scenario: Batch push

- **WHEN** un hook warn detecta violaciones
- **THEN** el registrador las acumula y las pushea a `internal-audits` en un batch por run

### Requirement: GATES de records de lenguaje → warn + registro

El sistema SHALL actualizar los GATES de `shared/references/conventions/language/*` para
usar warn-no-block + registro en vez de block.

#### Scenario: GATE actualizado

- **WHEN** un record de lenguaje define su gate
- **THEN** usa warn + registro a `internal-audits`, no block

### Requirement: assurance-governance extiende a code-conventions-audit

El sistema SHALL incluir `code-conventions-audit` como audit de QA/gobernanza dentro de
assurance-toolkit, junto a `assurance-testing-audit` y `observability-audit`.

#### Scenario: Audit de gobernanza

- **WHEN** un revisor ejecuta el audit de gobernanza
- **THEN** `/code-conventions-audit` está disponible y reporta cumplimiento de convenciones
