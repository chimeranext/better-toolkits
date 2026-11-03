# convention: java
id: java · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-11-03 · ttl_expires: 2027-02-03
parent: none

## GOAL

Java/Kotlin (JVM) que compila sin warnings, pasa SpotBugs/Detekt y resuelve
dependencias de forma reproducible (lockfile, `--locked`).

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | docs | Gradle dependency locking | load-bearing | lockfile |
| S2 | repo | `spotbugs/spotbugs` | load-bearing | análisis estático |
| S3 | repo | `detekt/detekt` (Kotlin) | load-bearing | lint Kotlin |
| S4 | docs | Maven `-o`/`-U` semantics | load-bearing | reproducible build |
| S5 | repo | Google Java Format | load-bearing | formato |

## RULES

- R1 [lock] Gradle `dependencyLocking` o Maven lockfile commiteado → S1.
- R2 [build] `./gradlew build --offline` (o `mvn -o`) en CI → S1/S4.
- R3 [lint] `spotbugs` (Java) / `detekt` (Kotlin) sin hallazgos → S2/S3.
- R4 [fmt] `google-java-format --dry-run` o `ktlint` → S5.
- R5 [deps] versiones fijas en lockfile; nada flotante → S1.

## COUNTEREXAMPLES

```java
// ❌ wrong: versión flotante sin lock (R5)
implementation "com.example:lib:+"

// ✅ right: versiones pineadas en gradle.lockfile
```

## GATES

- local: `./gradlew build --offline && ./gradlew spotbugsMain`
- CI: mismos + `./gradlew dependencyLocking` check.
