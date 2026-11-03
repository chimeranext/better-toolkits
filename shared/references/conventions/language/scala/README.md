# convention: scala
id: scala · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-11-03 · ttl_expires: 2027-02-03
parent: none

## GOAL

Scala que compila con `-Werror`, pasa scalafmt + wartremover y resuelve
deps reproducibles (sbt).

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | docs | sbt `update` + lock semantics | load-bearing | deps |
| S2 | repo | `scalameta/scalafmt` | load-bearing | formato |
| S3 | repo | `scalatest/scalatest` | load-bearing | test |
| S4 | repo | `wartremover/wartremover` | load-bearing | lint |

## RULES

- R1 [build] `sbt compile` con `-Werror` → toolchain.
- R2 [fmt] `scalafmt --check` → S2.
- R3 [lint] `wartremover` (warts) → S4.
- R4 [test] `sbt test` → S3.
- R5 [deps] versiones fijas en `build.sbt`/lock → S1.

## COUNTEREXAMPLES

```scala
// ❌ wrong: null (R3)
val x: String = null

// ✅ right: Option[String]
```

## GATES

- local: `sbt compile -Werror && sbt scalafmtCheck`
- CI: mismos + `sbt test`.
