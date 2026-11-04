# convention: r
id: r · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-11-03 · ttl_expires: 2027-02-03
parent: none

## GOAL

R que pasa lintr, usa renv con `renv.lock` pineado y no deja sesión con estado.

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | repo | `r-lib/lintr` | load-bearing | lint |
| S2 | docs | renv lockfile | load-bearing | deps reproducibles |
| S3 | docs | R CMD check | load-bearing | validación |
| S4 | docs | `renv.lock` schema | load-bearing | lockfile |

## RULES

- R1 [lint] `lintr::lint_package()` sin hallazgos → S1.
- R2 [lock] `renv.lock` commiteado → S2/S4.
- R3 [restore] `renv::restore()` con `--locked`-semantics → S2.
- R4 [check] `R CMD check` sin ERROR/NOTE no justificado → S3.
- R5 [state] no `setwd()`/estado global en código de paquete → S1.

## COUNTEREXAMPLES

```r
# ❌ wrong: estado global mutado (R5)
options(stringsAsFactors = FALSE)

# ✅ right: limitado a scope local
```

## GATES

- local: `Rscript -e "lintr::lint_package()"`
- CI: mismos + `renv::restore()` + `R CMD check`.
