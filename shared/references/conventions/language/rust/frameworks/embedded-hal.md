# convention: embedded-hal
id: embedded-hal · version: 0.1.0 · status: draft · level: framework
extracted_at: 2026-10-13 · ttl_expires: 2027-01-11
parent: rust@0.1.0

## GOAL

Periféricos compartidos por traits HAL, con el crate exacto por mecanismo.
Hereda todos los GATES de `rust@0.1.0` sin duplicarlos.

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | context7 | `/websites/rs_embedded-hal-bus` (565 snips) | load-bearing | `RefCellDevice`/`MutexDevice` |
| S2 | context7 | `/rust-embedded/embedded-hal` | load-bearing | traits `I2c` et al. |
| S3 | context7 | `/rust-embedded/linux-embedded-hal` (364 snips) | load-bearing | impl para Raspberry/Linux |

## RULES

- E1 [share] Un bus, N devices vía `embedded-hal-bus`; cada sensor su device → S1.
- E2 [traits] Drivers contra traits `embedded_hal`, nunca contra el periférico concreto → S2.
- E3 [linux] En Pi, `linux-embedded-hal` como impl; nada de `cortex-m`/singletons bare-metal → S3.

## COUNTEREXAMPLES

Ver R6/R7 del padre (mismo par wrong/right).

## GATES

Hereda `rust@0.1.0` exacto. Propios: `cargo build --target <edge>` en CI.

## LESSONS

- (vacía)

## RECEIPT

Mismo formato del padre.
