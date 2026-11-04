# convention: swift
id: swift · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-11-03 · ttl_expires: 2027-02-03
parent: none

## GOAL

Swift/Objective-C que pasa swiftformat + SwiftLint y usa SwiftPM con
`Package.resolved` pineado.

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | docs | SwiftPM `Package.resolved` | load-bearing | lockfile |
| S2 | repo | `realm/SwiftLint` | load-bearing | lint |
| S3 | repo | `nicklockwood/SwiftFormat` | load-bearing | formato |
| S4 | docs | `swift build --locked` | load-bearing | reproducible |

## RULES

- R1 [lock] `Package.resolved` commiteado → S1.
- R2 [build] `swift build --locked` en CI → S4.
- R3 [lint] `swiftlint` sin hallazgos → S2.
- R4 [fmt] `swiftformat --lint` → S3.
- R5 [test] `swift test --locked` → S4.

## COUNTEREXAMPLES

```swift
// ❌ wrong: force-unwrap (R3)
let x = dict["key"]!

// ✅ right: guard let / ?? con default
```

## GATES

- local: `swift format --lint && swiftlint`
- CI: mismos + `swift build --locked && swift test --locked`.
