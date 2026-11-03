# convention: haskell
id: haskell · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-11-03 · ttl_expires: 2027-02-03
parent: none

## GOAL

Haskell que compila con `-Wall -Werror`, pasa hlint y fija deps vía cabal/stack
con lockfile.

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | repo | `ndmitchell/hlint` | load-bearing | lint |
| S2 | docs | cabal freeze (`cabal.project.freeze`) | load-bearing | lockfile |
| S3 | docs | stack.yaml.lock | load-bearing | lockfile (stack) |
| S4 | docs | `cabal build --offline` | load-bearing | reproducible |

## RULES

- R1 [warn] `cabal build` con `-Wall -Werror` → toolchain.
- R2 [lint] `hlint .` sin sugerencias → S1.
- R3 [lock] `cabal.project.freeze` o `stack.yaml.lock` commiteado → S2/S3.
- R4 [offline] `cabal build --offline` en CI → S4.
- R5 [test] `cabal test` → S4.

## COUNTEREXAMPLES

```haskell
-- ❌ wrong: partial function (R1)
head xs

-- ✅ right: pattern match / listToMaybe
```

## GATES

- local: `cabal build -Wall -Werror && hlint .`
- CI: mismos + `cabal build --offline && cabal test`.
