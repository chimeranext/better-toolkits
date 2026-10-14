# Spec Delta — shared/conventions-typescript

## Purpose

Cuarto ejemplar: `language/typescript` (sin hijo framework en esta change). Typecheck sin build como primer gate — calza con bun direct-run del engine — y la lección seed real del backtick que rompió la suite Heimdall.

## ADDED Requirements

### Requirement: Record language/typescript con typecheck sin build

El sistema SHALL proveer `language/typescript/README.md` con SOURCES: handbook `type-checking-javascript-files` + `Mearman/typecheck-files` (load-bearing) + MegaLinter typescript (eslint/prettier, context); GATES `tsc --noEmit`/checkJs + eslint + prettier pineados.

#### Scenario: Clase backtick detectada por gate

- **WHEN** un template literal trae backticks sin escapar
- **THEN** el gate de typecheck lo frena antes que el runtime

### Requirement: Lección seed del incidente Heimdall

El sistema SHALL registrar LESSON 1 del record con el backtick en HELP que dejó la suite en 0 tests, trazando a la RULE de typecheck obligatorio pre-push.

#### Scenario: Lección numerada desde incidente propio

- **WHEN** se audita la serie de lecciones
- **THEN** la #1 es el incidente Heimdall con su fix como evidencia
