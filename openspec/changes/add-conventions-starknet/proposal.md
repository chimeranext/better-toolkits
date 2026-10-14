# Proposal — add-conventions-starknet

Change ID: `add-conventions-starknet`

## Why

El stack Starknet cruza tres mundos (lenguaje Cairo, cliente Rust, chain ops)
y la fuente "oficial cómoda" murió: **el hosted de Cairo Coder se apagó el
31-jul-2026** — self-hosted (MIT, docker compose) es obligatorio, no opción.
Madara (cliente Rust, Apache-2.0) trae gate stack propio (`clippy.toml`,
`rustfmt.toml`, `rust-toolchain.toml` con rustc 1.89) que lo vuelve el mejor
vecino del record `rust`. Sin record, los aprendices mezclan Cairo con Rust y
apuntan al API muerta.

## What Changes

- Rama `platform/starknet/` (NO hijo de `language/rust`: el stack abarca
  lenguaje Cairo + cliente Rust + chain — `frameworks/` es para app-frameworks
  sobre un lenguaje): `README.md` (record plataforma) con SOURCES Cairo Coder
  repo MIT (load-bearing, self-host compose), Madara repo Apache-2.0
  (load-bearing: rustc 1.89, lints propios, JSON-RPC v0.10.2 + admin 9943),
  docs.rs `starknet` + starknet.io developers + starknet-docs (context),
  ask-starknet MCP oficial + cairo-coder MCP (tooling, listed).
- RULES por mecanismo: Cairo vía coder self-hosteado (nunca `api.cairo-coder.com`),
  Rust del cliente bajo gates del padre `rust@*` + `clippy.toml` de Madara,
  RPC contra versiones soportadas explícitas, admin 9943 solo localhost.
- GATES: hereda `rust`; propios: `scarb build/test` donde aplique Cairo
  (scarb presente en este entorno vía asdf).

## Capabilities

### New Capabilities

- `shared/conventions-starknet`: record `platform/starknet` con self-host
  obligatorio, gates heredados de Rust y reglas Cairo/RPC.

### Modified Capabilities

- (vacío)

## Impact

- Afecta: `shared/references/conventions/platform/starknet/` (nuevo).
- Sistemas: Cairo Coder self-hosted (docker), Madara, scarb/starknet-foundry.
- Non-goals: operar un nodo (solo convenciones); auditar contratos Cairo;
  dashboard cairo-coder.com (muerto con el hosted — no citarlo como fuente viva).
- Éxito verificable: `openspec validate --change add-conventions-starknet` pasa;
  ninguna RULE cita el hosted; cada RULE traza a fuente pineada.
