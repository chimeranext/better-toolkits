# shared/conventions-elixir Specification

## Purpose

Primera instancia ejemplar para dogfooding del método y prueba del árbol: record `language/elixir` + hijo `frameworks/phoenix`. Cubre "¿está bien escrito?" (lenguaje) y "¿bien organizado según el framework?" (Phoenix). Excluye arquitectura MQTT/mMTC (va a OpenSpec en el monorepo vertivo) y Ash (siguiente framework).

## Requirements

### Requirement: Records language/elixir + frameworks/phoenix

El sistema SHALL proveer `language/elixir/README.md` v0.1.0 `draft` y `language/elixir/frameworks/phoenix.md` v0.1.0 `draft`, el segundo referenciando los gates del primero sin duplicarlos.

#### Scenario: Navegación por niveles

- **WHEN** un humano migra un endpoint a Phoenix
- **THEN** carga el hijo `phoenix` y obtiene por herencia los gates Elixir

### Requirement: Record elixir-lang draft con fuentes pineadas

El sistema SHALL dotar a `language/elixir` con SOURCES: Credo `~> 1.7` (MIT, load-bearing), hexdocs de Credo con lista exacta de checks (load-bearing), mix-otp getting-started e `introduction`/`learning` de elixir-lang.org (context).

#### Scenario: Trazabilidad total

- **WHEN** se audita una RULE del record
- **THEN** cada una llega a Credo/hexdocs sin eslabones inventados

### Requirement: Fuentes del hijo phoenix

El sistema SHALL dotar a `frameworks/phoenix.md` con SOURCES propias: `phoenix.hexdocs.pm/overview` (load-bearing) y la guía `contexts` de Phoenix (load-bearing); sus RULES cubren organización por contextos, no estilo de lenguaje.

#### Scenario: Regla de framework mal ubicada se mueve

- **WHEN** una RULE de Phoenix describe estilo Elixir genérico
- **THEN** se mueve al padre; el hijo solo guarda lo específico del framework

### Requirement: Compilador como primer linter

El sistema SHALL exigir `mix compile --warnings-as-errors`: cero warnings para avanzar, como el índice de errores de `rustc` para Rust.

#### Scenario: Warning frena

- **WHEN** la compilación emite un warning
- **THEN** el gate local falla con el warning como evidencia

### Requirement: Credo strict por familias

El sistema SHALL correr `mix credo --strict` cubriendo las familias Consistency/Design/Readability/Refactor/Warning, más `mix format --check` y Dialyzer vía `dialyxir` (`mix dialyzer`) en el lane CI. Estos gates viven en el padre `language/elixir`, nunca en el hijo.

#### Scenario: Estilo inconsistente se flaggea

- **WHEN** el código viola una familia (ej. `IO.inspect` entregado)
- **THEN** Credo lo reporta con la regla y el fix sugerido

### Requirement: Toolchain Elixir/OTP pineada

El sistema SHALL fijar Elixir y OTP exactos (`.tool-versions`/asdf) en el record padre, al mismo nivel que el pin de Credo: sin toolchain pineada el dogfood no es reproducible.

#### Scenario: Versión distinta invalida el dogfood

- **WHEN** el sandbox usa Elixir/OTP distintos del pin
- **THEN** el dogfood se declara no-corrible hasta igualar versiones

### Requirement: Dogfood con módulo sample

El sistema SHALL incluir un módulo Elixir sample que pasa los 4 gates pineados en sandbox, demostrando el ciclo tarea → record → código → gates → receipt sin codebase Elixir propio.

#### Scenario: Ciclo completo verificable

- **WHEN** se corre el dogfood
- **THEN** el sample pasa compile/format/credo/dialyzer y emite receipt con `candidate_sha`
