# convention: dart
id: dart · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-10-13 · ttl_expires: 2026-11-12
parent: none

## GOAL

Dart que `dart analyze` acepta sin issues, testeado con `package:test`,
documentado con `///` según Effective Dart.

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | repo | `dart-lang/skills` BSD-3 @ `0b8dc54` (2026-10-13) | load-bearing | skills como reglas |
| S2 | docs | Effective Dart (vía `dart-write-documentation`) | context | estilo doc |
| S3 | repo | `dartastic_opentelemetry` + `dartastic_opentelemetry_api` 0.12.0, Apache-2.0 (2026-10-14) | load-bearing | instrumentación OTel (ver `platform/observability`) |

TTL corto (30 días): los skills cambian sin versionar → pin por commit en apply.

## RULES

- D1 [analyze] `dart analyze` cero issues; `dart fix --apply` solo para
  mecánicos (`dart-run-static-analysis`) → S1.
- D2 [tests] Lógica nueva con `package:test` (`dart-add-unit-test`) → S1.
- D3 [mocks] Dependencias externas con `package:mockito` + build_runner
  (`dart-generate-test-mocks`) → S1.
- D4 [coverage] Cobertura LCOV vía coverage package
  (`dart-collect-coverage`) → S1.
- D5 [docs] `///` en declaraciones públicas (Effective Dart) → S1/S2.
- D6 [patterns] switch expressions + pattern matching donde apliquen
  (`dart-use-pattern-matching`) → S1.
- D7 [otel] Instrumentación con el par SDK+API pineado (`dartastic_opentelemetry`
  que emite + `dartastic_opentelemetry_api` no-op); export OTLP, claves con enums
  tipados. Detalle en `platform/observability` → S3.

## COUNTEREXAMPLES

```dart
// ❌ wrong: sin tipos, sin test, sin docs (D1, D2, D5)
parse(raw) {
  if (raw == 65535) return null;
  return raw / 1.2;
}

/// Parsea una lectura cruda a lux. Retorna null si el sensor saturó.
// ✅ right: tipado, documentado, testeado
double? parseLux(int raw) {
  if (raw == 0xFFFF) return null;
  return raw / 1.2;
}
```

## GATES

- local: `dart analyze` + `dart test` (SDK 3.13.4 medido en dogfood).
- CI: lo local + cobertura LCOV con umbral.
- D8 (prescriptivo): **warn no-block** — `conventions-warn-recorder.sh dart/D8 <file> @<author>`; no bloquea, registra en `internal-audits`.

## LESSONS

- (vacía)

## RECEIPT

`candidate_sha` + verdict + tree-check (ver `_exemplars/dart/`).
