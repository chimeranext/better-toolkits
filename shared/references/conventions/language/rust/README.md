# convention: rust
id: rust · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-10-13 · ttl_expires: 2027-01-11
parent: none

## GOAL

Rust que compila sin warnings, pasa fmt+clippy y demuestra ausencia de UB en
lo `unsafe` vía miri; en edge, linker y HAL correctos para el target.

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | docs | `doc.rust-lang.org/error_codes/error-index` + rustc diagnostics guide | load-bearing | compilador como spec (E-codes) |
| S2 | repo | `rust-lang/rust-clippy` | load-bearing | lint (MegaLinter rust trae SOLO clippy: fmt se suplementa) |
| S3 | repo | `rust-lang/miri` | load-bearing | UB en CI |
| S4 | repo | `knurling-rs/flip-link` | load-bearing (edge) | linker embedded anti-stack-overflow |
| S5 | docs | Ferrocene qualified toolchain + release notes (comercial) | context | referencia + ancla de TTL safety-critical |
| S6 | context7 | `/websites/rs_embedded-hal-bus`, `/rust-embedded/embedded-hal`, `/rust-embedded/linux-embedded-hal` | load-bearing (mecanismo bus-sharing/Linux) | hijo embedded-hal |
| S7 | context7 | `/rust-embedded/book` | context p/ bus-sharing; load-bearing p/ concurrencia bare-metal | no citar para I2C |
| S8 | repo | `RefactoringGuru/design-patterns-rust` | load-bearing | error handling idiomático (Result/Either) y smells |

## RULES

- R1 [compiler] `cargo build` limpio + warnings como errores; E-codes como spec → S1.
- R2 [fmt] `cargo fmt --check` (no lo trae MegaLinter: declararlo acá) → toolchain.
- R3 [clippy] `cargo clippy -- -D warnings` → S2.
- R4 [unsafe] Todo `unsafe` con test bajo miri en CI (nightly programado, no por PR) → S3.
- R5 [embedded-link] Targets embedded con flip-link → S4.
- R6 [bus-sharing] I2C compartido con `embedded-hal-bus`
  (`RefCellDevice`/`MutexDevice`), nunca Mutex\<RefCell\> bare-metal → S6.
- R7 [linux-hal] En Raspberry (Linux) sobre `linux-embedded-hal`, no patrones bare-metal → S6.
- R8 [qualified] Si safety-critical: toolchain calificada + release notes mandan el TTL → S5.
- R9 [errors] Mensajes de error **prescriptivos** (sugieren alternativa), salvo `[SECRECY]`
  en el doc comment (seguridad por secrecía). `Result`/`Either` para fallos esperados →
  S8 + `conventions/prescriptive-error-messages.md`.
- R10 [BDD] Verificación de comportamiento en lenguaje natural **sin archivos `.feature`**:
  el escenario es el OpenSpec del proyecto (proposal/design/spec), no Gherkin por archivo.
  Usar **`behave`** (matchers `expect!` + DSL `behave!` → `#[test]` estándar) o
  `rstest-bdd` en modo procedural. Assert comportamiento observable, no implementación.
  Los matchers se declaran en el mini-lenguaje del
  `conventions/matcher-contract.md` y se traducen a `behave!`/`expect!`.
  Gates Jidoka (stop on anomaly) + No-Workarounds (no silenciar señales) según
  `assurance-toolkit/references/testing/e2e-protocol.md`.

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

```
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
  con `rust-toolchain.toml` pineado (medido en dogfood: 1.99.0).
- CI: lo local + miri programado + (edge) build del target + flip-link.
- R9 (prescriptivo): **warn no-block** — `conventions-warn-recorder.sh rust/R9 <file> @<author>`; no bloquea, registra en `internal-audits`.

## LESSONS

- L1 (sesión actual) El book no cubre bus-sharing I2C → R6/R7 con S6.
- L2 (sesión actual) Mensaje prohibitivo sin alternativa confunde al agente; la cura es
  prescriptivo o `[SECRECY]` en doc comment → R9 (ref: `conventions/prescriptive-error-messages.md`).

## RECEIPT

`candidate_sha` + risk tier + verdict + tree-check-at-commit (ver `_exemplars/rust/`).
