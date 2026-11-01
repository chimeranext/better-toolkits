# Spec Delta — shared/conventions-rust

## Purpose

Segundo ejemplar: `language/rust` + hijo `frameworks/embedded-hal`. Cubre compilador+lint+UB+linker embedded y toolchain calificada, con el incidente book-vs-bus-sharing como regla de peso de fuentes.

## ADDED Requirements

### Requirement: Record language/rust con gates cargo pineados

El sistema SHALL proveer `language/rust/README.md` con SOURCES: rustc error index, `rust-lang/rust-clippy`, `rust-lang/miri` (load-bearing) y Ferrocene + release notes (context calificado, ancla de TTL); GATES `cargo fmt --check` + `cargo clippy` + `cargo test` (+ miri en CI) con `rust-toolchain.toml` pineado.

#### Scenario: Clippy y fmt cubren lo que MegaLinter no

- **WHEN** se auditan los gates
- **THEN** `fmt` está declarado (el flavor rust de MegaLinter trae solo clippy)

### Requirement: Hijo frameworks/embedded-hal con pin por mecanismo

El sistema SHALL proveer `frameworks/embedded-hal.md` con SOURCES Context7 `/websites/rs_embedded-hal-bus`, `/rust-embedded/embedded-hal`, `/rust-embedded/linux-embedded-hal` (load-bearing) y `/rust-embedded/book` como `context` para bus-sharing; hereda gates del padre.

#### Scenario: Fuente prestigiosa pero inexacta degradada

- **WHEN** una regla es de bus-sharing I2C
- **THEN** traza a `embedded-hal-bus`, nunca solo al book
