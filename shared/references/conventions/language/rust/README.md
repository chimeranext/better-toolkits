# convention: rust

id: rust · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-10-13 · ttl_expires: 2027-01-11
parent: none

## GOAL

Rust that compiles without warnings, passes fmt+clippy and demonstrates absence
of UB in `unsafe` via miri. On edge, use the correct linker and HAL for the target.

## SOURCES

| # | kind | ref | weight | purpose |
|---|------|-----|--------|----------|
| S1 | docs | `doc.rust-lang.org/error_codes/error-index` + rustc diagnostics guide | load-bearing | compiler as spec (E-codes) |
| S2 | repo | `rust-lang/rust-clippy` | load-bearing | lint (MegaLinter rust brings only clippy and you add fmt separately) |
| S3 | repo | `rust-lang/miri` | load-bearing | UB in CI |
| S4 | repo | `knurling-rs/flip-link` | load-bearing (edge) | embedded linker anti-stack-overflow |
| S5 | docs | Ferrocene qualified toolchain + release notes (commercial) | context | reference + anchor of safety-critical TTL |
| S6 | context7 | `/websites/rs_embedded-hal-bus`, `/rust-embedded/embedded-hal`, `/rust-embedded/linux-embedded-hal` | load-bearing (bus-sharing/Linux mechanism) | embedded-hal child |
| S7 | context7 | `/rust-embedded/book` | context for bus-sharing and load-bearing for bare-metal concurrency | do not cite for I2C |
| S8 | repo | `RefactoringGuru/design-patterns-rust` | load-bearing | idiomatic error handling (Result/Either) and smells |

## RULES

- R1 [compiler] `cargo build` clean + warnings as errors. E-codes are the spec → S1.
- R2 [fmt] `cargo fmt --check` (MegaLinter doesn't bring it: declare it here) → toolchain.
- R3 [clippy] `cargo clippy -- -D warnings` → S2.
- R4 [unsafe] Every `unsafe` with a test under miri in CI (scheduled nightly, not per PR) → S3.
- R5 [embedded-link] Embedded targets with flip-link → S4.
- R6 [bus-sharing] Shared I2C with `embedded-hal-bus`
  (`RefCellDevice`/`MutexDevice`), never bare-metal Mutex\<RefCell\> → S6.
- R7 [linux-hal] On Raspberry (Linux) over `linux-embedded-hal`, no bare-metal patterns → S6.
- R8 [qualified] If safety-critical: qualified toolchain + release notes set the TTL → S5.
- R9 [errors] Error messages **prescriptive** (suggest an alternative), except `[SECRECY]`
  in the doc comment (security by secrecy). `Result`/`Either` for expected failures →
  S8 + `conventions/prescriptive-error-messages.md`.
- R10 [BDD] Behavior verification in natural language **without `.feature` files**:
  the scenario is the project's OpenSpec (proposal/design/spec), not Gherkin per file.
  Use **`behave`** (matchers `expect!` + DSL `behave!` → standard `#[test]`) or
  `rstest-bdd` in procedural mode. Assert observable behavior, not implementation.
  You declare matchers in the mini-language of
  `conventions/matcher-contract.md` and translate them to `behave!`/`expect!`.
  Jidoka gates (stop on anomaly) + No-Workarounds (do not silence signals) per
  `assurance-toolkit/references/testing/e2e-protocol.md`.

The native matcher follows **TAS** (`../../../../references/engineering-standards/test-assertion-standards.md`): contract, not snapshot.

## COUNTEREXAMPLES

```rust
// ❌ wrong: patrón bare-metal del book aplicado a un bus I2C (R6)
static BUS: Mutex<RefCell<Option<I2c>>> = Mutex::new(RefCell::new(None));

// ✅ right: bus-sharing del crate (ver firmas exactas en sus docs)
let i2c = RefCell::new(periferico_i2c);
let dev = RefCellDevice::new(&i2c); // un device por sensor, mismo bus
```

```rust
// ❌ wrong: mensaje de error prohibitivo sin alternativa (R9)
Err(Error::Config("configuración inválida"))

// ✅ right: prescriptivo — dice qué hacer
Err(Error::Config("configuración inválida; revisa `~/.config/app.toml`"))

// ❌ wrong: mensaje genérico SIN marca de secrecía (R9)
Err(Error::Auth("error de autenticación"))

// ✅ right: genérico PERO marcado [SECRECY] en el doc comment
/// [SECRECY] no revelar el motivo exacto (seguridad por secrecía).
pub fn login(u: &str, p: &str) -> Result<(), Error> {
    Err(Error::Auth("error de autenticación"))
}
```

```rust
// ❌ wrong: BDD con archivo .feature + aserción interna (R10) — el escenario
// ya vive en el OpenSpec; no duplicarlo en Gherkin, y no assertear implementación.

// ✅ right: behave! + expect! sobre el OpenSpec, comportamiento observable (R10)
use behave::{behave, expect};

#[behave]
fn registro_de_feature() {
    // El escenario viene del OpenSpec del proyecto, no de un .feature.
    let def = feature::generate("sprocket", "feature sprocket ...");
    expect!(def.name).to_equal("sprocket");
    // Gates: sobre anomalía, stop (Jidoka); ninguna señal silenciada (No-Workarounds).
}
```

## GATES

- local: `cargo fmt --check` + `cargo clippy -- -D warnings` + `cargo test`,
  with `rust-toolchain.toml` pinned (measured in dogfood: 1.99.0).
- CI: the local + scheduled miri + (edge) target build + flip-link.
- R9 (prescriptive): **warn no-block** — `conventions-warn-recorder.sh rust/R9 <file> @<author>`. It does not block and records in `internal-audits`.

## LESSONS

- L1 (current session) The book doesn't cover I2C bus-sharing → R6/R7 with S6.
- L2 (current session) A prohibitive message without an alternative confuses the agent. The cure is
  prescriptive or `[SECRECY]` in doc comment → R9 (ref: `conventions/prescriptive-error-messages.md`).

## RECEIPT

`candidate_sha` + risk tier + verdict + tree-check-at-commit (see `_exemplars/rust/`).
