# convention: zig
id: zig · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-11-03 · ttl_expires: 2027-02-03
parent: none

## GOAL

Zig que compila con `zig build` sin warnings, pasa `zig fmt --check` y fija
deps en `build.zig.zon`.

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | docs | `build.zig.zon` schema | load-bearing | deps |
| S2 | docs | `zig build` cache semantics | load-bearing | build |
| S3 | docs | `zig fmt` | load-bearing | formato |
| S4 | docs | `zig build test` | load-bearing | test |

## RULES

- R1 [fmt] `zig fmt --check .` → S3.
- R2 [build] `zig build` sin warnings → S2.
- R3 [deps] `build.zig.zon` con hashes (fijos) → S1.
- R4 [test] `zig build test` → S4.
- R5 [errors] error handling explícito (`error.`), sin panic → S2.

## COUNTEREXAMPLES

```zig
// ❌ wrong: panic en librería (R5)
if (condition) unreachable;

// ✅ right: error explícito
return error.InvalidState;
```

## GATES

- local: `zig fmt --check . && zig build`
- CI: mismos + `zig build test`.
