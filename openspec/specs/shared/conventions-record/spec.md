# Spec Delta — shared/conventions-record

## Purpose

Extiende el record de convenciones (`shared/conventions-record`, ya en main specs)
con el **protocolo de auditoría unificada**: checks warn-no-block, registro
versionado en `internal-audits` y el comando `/code-conventions-audit`.

## ADDED Requirements

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
