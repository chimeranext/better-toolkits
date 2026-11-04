# convention: nim
id: nim · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-11-03 · ttl_expires: 2027-02-03
parent: none

## GOAL

Nim que compila sin warnings, pasa `nim check` y fija deps con nimble
(`*.nimble.lock`).

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | docs | nimble lockfile | load-bearing | deps |
| S2 | docs | `nim check` | load-bearing | análisis estático |
| S3 | docs | `nim format` (nph) | load-bearing | formato |
| S4 | docs | `nimble test` | load-bearing | test |

## RULES

- R1 [check] `nim check` sin errores → S2.
- R2 [fmt] `nim format --check` → S3.
- R3 [lock] `*.nimble.lock` commiteado → S1.
- R4 [install] `nimble install -y` con lock → S1.
- R5 [test] `nimble test` → S4.
- R6 [no-unsafe] evitar `{.experimental: "codegen".}` salvo justificación → S2.

## COUNTEREXAMPLES

```nim
# ❌ wrong: unchecked cast (R6)
let x = cast[int](ptr)

# ✅ right: usar conversión segura
```

## GATES

- local: `nim check` + `nim format --check`
- CI: mismos + `nimble install -y` + `nimble test`.
