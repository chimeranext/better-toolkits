# Spec Delta — shared/conventions-starknet

## Purpose

Ejemplar de rama `platform/`: convenciones Starknet/Madara con self-host
obligatorio de Cairo Coder y gates Rust heredados + propios de Madara.

## ADDED Requirements

### Requirement: Record platform/starknet con self-host obligatorio

El sistema SHALL proveer `platform/starknet/README.md` v0.1.0 `draft` con
SOURCES: `KasarLabs/cairo-coder` MIT (load-bearing, compose self-host) y
`madara-alliance/madara` Apache-2.0 (load-bearing); ninguna RULE SHALL citar
`api.cairo-coder.com` ni el dashboard como vivos.

#### Scenario: Fuente muerta rechazada

- **WHEN** una RULE apunta al hosted o su dashboard
- **THEN** la revisión la devuelve (sunset 31-jul-2026 verificado)

### Requirement: Gates Rust heredados más propios de Madara

El sistema SHALL heredar `rust@*` y sumar `clippy.toml`/`rustfmt.toml` de
Madara + `scarb build/test` para Cairo; toolchain rustc 1.89 pineada.

#### Scenario: Lint del cliente sin inventar

- **WHEN** se auditan los gates del record
- **THEN** los de Madara copian su repo exacto, no genéricos

### Requirement: Reglas RPC versionadas

El sistema SHALL fijar versiones JSON-RPC soportadas explícitas (default
v0.10.2; admin en 9943 solo localhost, nunca expuesto sin proxy propio).

#### Scenario: Admin expuesto se flaggea

- **WHEN** una config expone el admin fuera de localhost
- **THEN** el gate la marca (Madara no autentica: sin proxy no sale)
