# convention: crystal
id: crystal · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-11-03 · ttl_expires: 2027-02-03
parent: none

## GOAL

Crystal que compila con `crystal build` sin warnings, pasa `crystal tool format`
y fija deps con `shard.lock` + `shards install --production`.

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | docs | shards `shard.lock` | load-bearing | lockfile |
| S2 | docs | `crystal tool format` | load-bearing | formato |
| S3 | docs | `shards install --production` | load-bearing | install reproducible |
| S4 | docs | `crystal spec` | load-bearing | test |

## RULES

- R1 [fmt] `crystal tool format --check` → S2.
- R2 [lock] `shard.lock` commiteado → S1.
- R3 [install] `shards install --production` (o `--frozen`) en CI → S3.
- R4 [build] `crystal build` sin warnings → S3.
- R5 [test] `crystal spec` → S4.

## COUNTEREXAMPLES

```crystal
# ❌ wrong: do nil-check genérico (R4)
if x.nil? ... end

# ✅ right: usar tipos no-nil / pattern matching
```

## GATES

- local: `crystal tool format --check && crystal build`
- CI: mismos + `shards install --production && crystal spec`.
