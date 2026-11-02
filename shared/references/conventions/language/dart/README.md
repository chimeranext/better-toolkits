# convention: dart

id: dart · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-10-13 · ttl_expires: 2026-11-12
parent: none

## GOAL

Dart that `dart analyze` accepts without issues, tested with `package:test`,
documented with `///` per Effective Dart.

## SOURCES

| # | kind | ref | weight | purpose |
|---|------|-----|--------|----------|
| S1 | repo | `dart-lang/skills` BSD-3 @ `0b8dc54` (2026-10-13) | load-bearing | skills as rules |
| S2 | docs | Effective Dart (via `dart-write-documentation`) | context | doc style |
| S3 | repo | `dartastic_opentelemetry` + `dartastic_opentelemetry_api` 0.12.0, Apache-2.0 (2026-10-14) | load-bearing | OTel instrumentation (see `platform/observability`) |

Short TTL (30 days): skills change unversioned → pin by commit in apply.

## RULES

- D1 [analyze] `dart analyze` must report zero issues. Use `dart fix --apply` only for
  mechanical fixes (`dart-run-static-analysis`) → S1.
- D2 [tests] New logic with `package:test` (`dart-add-unit-test`) → S1.
- D3 [mocks] External dependencies with `package:mockito` + build_runner
  (`dart-generate-test-mocks`) → S1.
- D4 [coverage] LCOV coverage via the coverage package
  (`dart-collect-coverage`) → S1.
- D5 [docs] `///` on public declarations (Effective Dart) → S1/S2.
- D6 [patterns] switch expressions + pattern matching where they apply
  (`dart-use-pattern-matching`) → S1.
- D7 [otel] Instrumentation with the pinned SDK+API pair (`dartastic_opentelemetry`
  emitting + `dartastic_opentelemetry_api` no-op). Export OTLP with keys as typed
  enums. Detail in `platform/observability` → S3.
- D8 [errors] Error messages **prescriptive** (suggest an alternative), except `[SECRECY]`
  in the `///` doc comment (security by secrecy). Do not use exceptions for expected flow →
  `conventions/prescriptive-error-messages.md`.
- D9 [BDD] Check observable behavior, not implementation. The BDD assertion is
  declared in the mini-language of `conventions/matcher-contract.md` and translates to the native
  matcher (`package:test` `expect(expr, equals/contains/matches/hasLength)`). Jidoka
  - No-Workarounds gates per `assurance-toolkit/references/testing/e2e-protocol.md`.

The native matcher follows **TAS** (`../../../../references/engineering-standards/test-assertion-standards.md`): assert contracts, not snapshots.

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

```dart
// ❌ wrong: mensaje de error prohibitivo sin alternativa (D8)
throw StateError("Configuración inválida");

// ✅ right: prescriptivo — dice qué hacer
throw StateError("Configuración inválida; revisa config.yaml");

// ❌ wrong: mensaje genérico SIN marca de secrecía (D8)
throw StateError("Token no válido");

// ✅ right: genérico PERO marcado [SECRECY] en el doc comment
/// Valida el token.
/// [SECRECY] no exponer la causa interna (seguridad por secrecía).
void checkToken(String t) {
  throw StateError("Token no válido");
}
```

## GATES

- local: `dart analyze` + `dart test` (SDK 3.13.4 measured in dogfood).
- CI: the local + LCOV coverage with threshold.
- D8 (prescriptive): **warn no-block** — `conventions-warn-recorder.sh dart/D8 <file> @<author>`. It does not block. It logs in `internal-audits`.

## LESSONS

- L1 (current session) A prohibitive message without an alternative confuses the agent. The cure
  is prescriptive or `[SECRECY]` in the `///` doc comment → D8 (ref: `conventions/prescriptive-error-messages.md`).

## RECEIPT

`candidate_sha` + verdict + tree-check (see `_exemplars/dart/`).
