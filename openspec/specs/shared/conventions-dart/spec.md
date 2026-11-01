# Spec Delta — shared/conventions-dart

## Purpose

Tercer ejemplar: `language/dart` + hijo `frameworks/flutter`. Usa los skills oficiales como fuente ejecutable (BSD-3, reinterpretables con atribución) más docs de testing/perf.

## ADDED Requirements

### Requirement: Record language/dart desde skills oficiales

El sistema SHALL proveer `language/dart/README.md` con SOURCES: `dart-lang/skills` BSD-3 (load-bearing, incl. `dart-run-static-analysis`); GATES `dart analyze` + `dart fix --apply` + `dart test`.

#### Scenario: Skill como regla trazable

- **WHEN** una RULE viene de un skill oficial
- **THEN** cita skill + commit pineado, no solo "docs de Dart"

### Requirement: Hijo frameworks/flutter con skills+MCP+rules

El sistema SHALL proveer `frameworks/flutter.md` con SOURCES: `flutter/agent-plugins` BSD-3 (load-bearing, consumo sin PRs) + docs.flutter.dev testing/* y perf/* (context que sostiene reglas); hereda gates del padre y suma `flutter test` + integration_test.

#### Scenario: Regla de perf traza a doc oficial

- **WHEN** una RULE pide placeholders/precaching o tree-shaking
- **THEN** traza al blog/doc Flutter correspondiente
