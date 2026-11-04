# convention: julia
id: julia · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-11-03 · ttl_expires: 2027-02-03
parent: none

## GOAL

Julia que pasa Aqua + JET (estático), usa Pkg con `Manifest.toml` pineado y
`Pkg.instantiate()` reproducible.

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | docs | Pkg `Manifest.toml` | load-bearing | lockfile |
| S2 | repo | `JuliaTesting/Aqua.jl` | load-bearing | calidad de paquete |
| S3 | repo | `aviatesk/JET.jl` | load-bearing | análisis estático |
| S4 | docs | `Pkg.instantiate()` | load-bearing | reproducible |

## RULES

- R1 [lock] `Manifest.toml` commiteado → S1.
- R2 [instantiate] `Pkg.instantiate()` en CI → S4.
- R3 [aqua] `Aqua.test_all(pkg)` sin fallos → S2.
- R4 [jet] `JET.test_package(pkg)` sin errores → S3.
- R5 [test] `Pkg.test()` → S4.

## COUNTEREXAMPLES

```julia
# ❌ wrong: export no calificado (R3)
export foo

# ✅ right: export de API intencional
```

## GATES

- local: `julia -e "using Pkg; Pkg.instantiate()"`
- CI: mismos + `Aqua.test_all` + `JET.test_package` + `Pkg.test()`.
