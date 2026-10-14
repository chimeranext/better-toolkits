# convention: flutter
id: flutter · version: 0.1.0 · status: draft · level: framework
extracted_at: 2026-10-13 · ttl_expires: 2026-11-12
parent: dart@0.1.0

## GOAL

Flutter por capas (UI/Logic/Data), cada widget con su test y cada flujo con
su integración. Hereda todos los GATES de `dart@0.1.0` sin duplicarlos.

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | repo | `flutter/agent-plugins` BSD-3 @ `0ef3972` (2026-10-13; sin PRs: consumo) | load-bearing | skills+MCP+rules |
| S2 | docs | docs.flutter.dev testing/* (errors, integration-tests, debugging, devtools) | context | reglas de test |
| S3 | docs | docs.flutter.dev perf/* + blogs (tree-shaking, placeholders, performant-widgets) | context | reglas de perf |

## RULES

- F1 [layers] Arquitectura por capas UI/Logic/Data
  (`flutter-apply-architecture-best-practices`) → S1.
- F2 [widget-test] Componente nuevo con `WidgetTester`
  (`flutter-add-widget-test`) → S1.
- F3 [integration] Flujos con `integration_test`
  (`flutter-add-integration-test`) → S1/S2.
- F4 [layout] Overflows y constraints sin cota se arreglan en constraints,
  no con parches (`flutter-fix-layout-issues`) → S1.
- F5 [perf] Placeholders + precaching de imágenes; tree-shaking/deferred en
  web (`flutter perf/*`) → S3.

## COUNTEREXAMPLES

```dart
// ❌ wrong: lógica en el build + red sin test (F1, F2)
// ✅ right: widget con WidgetTester (ver skill flutter-add-widget-test)
```

## GATES

Hereda `dart@0.1.0` exacto. Propios: `flutter analyze` + `flutter test`
(+ `integration_test` en device para flujos).

## LESSONS

- (vacía)

## RECEIPT

Mismo formato del padre.
