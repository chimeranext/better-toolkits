# Tasks — add-conventions-exemplars

## 1. Ejemplar Rust (2.º)

- [x] 1.1 Escribir `language/rust/README.md` (SOURCES rustc index + clippy + miri + Ferrocene/TTL, GATES fmt+clippy+test con `rust-toolchain.toml`) y verificar que `fmt` está declarado pese al flavor MegaLinter
- [x] 1.2 Escribir `language/rust/frameworks/embedded-hal.md` (SOURCES Context7 pineadas por mecanismo, book degradado a context para bus-sharing) y verificar herencia de gates sin duplicación
- [x] 1.3 Dogfood: sample Rust que pasa fmt+clippy+test y emite receipt, y verificar tree-check-at-commit

## 2. Ejemplar Flutter (3.º)

- [x] 2.1 Escribir `language/dart/README.md` (SOURCES dart-lang/skills pineados por commit, GATES analyze+fix+test) y verificar trazabilidad skill→RULE
- [x] 2.2 Escribir `language/dart/frameworks/flutter.md` (SOURCES agent-plugins + docs testing/perf, GATES +flutter test/integration) y verificar herencia sin duplicación
- [x] 2.3 Dogfood: sample que pasa los gates y emite receipt, y verificar tree-check-at-commit

## 3. Ejemplar TypeScript (4.º)

- [x] 3.1 Escribir `language/typescript/README.md` (SOURCES handbook + typecheck-files + MegaLinter, GATES tsc/checkJs+eslint+prettier, LESSON 1 = backtick Heimdall) y verificar que el gate detecta la clase backtick en un fixture
- [x] 3.2 Dogfood: sample que pasa los gates y emite receipt, y verificar tree-check-at-commit

## 4. Cierre

- [x] 4.1 Correr `openspec validate --change add-conventions-exemplars` y verificar que pasa sin errores
- [ ] 4.2 Verificar que `add-conventions-layer` está aplicada antes de implementar esta (el molde manda) — PENDIENTE: layer 8/10, bloqueada en dogfood Elixir (sin toolchain)
