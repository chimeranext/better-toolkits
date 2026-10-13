# Proposal — add-conventions-exemplars

Change ID: `add-conventions-exemplars`

## Why

El molde (`add-conventions-layer`: schema + caso Elixir) necesita sus ejemplares 2-4 para probar el árbol en lenguajes con perfiles distintos: Rust (seguridad/embedded + toolchain calificada), Dart/Flutter (skills oficiales + perf móvil) y TypeScript (el lenguaje del propio engine, con lección seed real: el backtick que rompió la suite). Requiere `add-conventions-layer` aplicada primero (plantilla + método).

## What Changes

- `language/rust/README.md` + hijo `language/rust/frameworks/embedded-hal.md`: SOURCES rustc error index, `rust-lang/rust-clippy`, `rust-lang/miri` (gate de test/UB), `knurling-rs/flip-link` (linker embedded), Ferrocene qualified toolchain + release notes como ancla de TTL, Context7 `/websites/rs_embedded-hal-bus` + `/rust-embedded/embedded-hal` + `/rust-embedded/linux-embedded-hal` (load-bearing por mecanismo) y `/rust-embedded/book` solo `context` para bus-sharing (load-bearing para concurrencia bare-metal); GATES `cargo fmt --check` (MegaLinter rust trae solo clippy: se suplementa) + `cargo clippy` + `cargo test` (+ miri en CI), toolchain en `rust-toolchain.toml`.
- `language/dart/README.md` + hijo `language/dart/frameworks/flutter.md`: SOURCES `dart-lang/skills` BSD-3 (`dart-run-static-analysis`: `dart analyze` + `dart fix --apply`) + `flutter/agent-plugins` BSD-3 (skills+MCP+rules, sin PRs: solo consumo) + docs.flutter.dev testing/* (errors, integration-tests, debugging, devtools) y perf/* (best-practices, tree-shaking, placeholders, performant-widgets).
- `language/typescript/README.md`: SOURCES handbook `type-checking-javascript-files` + `Mearman/typecheck-files` (typecheck sin build, calza con bun direct-run) + MegaLinter typescript (eslint/prettier); LESSON seed: backtick sin escapar en template literal que tumbó la suite Heimdall (gates `tsc --noEmit`/checkJs lo detectan).
- Orden fundado: Rust 2.º (urgencia edge + fuentes más ricas), Flutter 3.º (móvil HabitaNexus), TypeScript 4.º (dogfood interno del engine).

## Capabilities

### New Capabilities

- `shared/conventions-rust`: record `language/rust` + hijo `frameworks/embedded-hal`, gates cargo/miri pineados, toolchain calificada como referencia.
- `shared/conventions-dart`: record `language/dart` + hijo `frameworks/flutter`, skills oficiales como fuente ejecutable.
- `shared/conventions-typescript`: record `language/typescript`, typecheck sin build como primer gate.

### Modified Capabilities

- (vacío — el molde no cambia; si el árbol pide ajuste, se enmienda `add-conventions-layer` antes de aplicar esta)

## Impact

- Afecta: `shared/references/conventions/` (3 ramas nuevas); ningún toolkit cambia comportamiento.
- Sistemas: Context7 (extracción embedded-hal), crates.io/hexdocs/docs oficiales, Ferrocene (referencia comercial, nunca vendorado).
- Non-goals: rama `platform/openplc`, framework Ash, instancias `dataset/`, gates en CI (solo protocolo + pines); cambiar el molde (va a su change).
- Éxito verificable: `openspec validate --change add-conventions-exemplars` pasa; existen 3 ramas con padre+hijo donde aplica; cada RULE traza a fuente pineada de esta sesión; cada ejemplar trae sample que pasa sus gates.
