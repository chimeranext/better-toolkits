# convention: observability
id: observability · version: 0.1.0 · status: draft · level: platform
extracted_at: 2026-10-14 · ttl_expires: 2027-01-12
parent: none

## GOAL

Telemetría Dart/Flutter exportada por OTLP a un backend LGTM auto-hosteable,
sin nube obligatoria: traces, logs y métricas con el par API+SDK pineado.

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | repo | `dartastic_opentelemetry_api` 0.12.0, Apache-2.0, pub 160 pts (2026-10-14) | load-bearing | API no-op spec-compliant |
| S2 | repo | `dartastic_opentelemetry` 0.12.0, Apache-2.0 (2026-10-14) | load-bearing | SDK que emite (`OTel`) |
| S3 | docs | OpenTelemetry specification (opentelemetry.io/docs/specs/otel) | load-bearing | MUST/SHOULD API-vs-SDK |
| S4 | docs | Grafana datasources: Tempo, Loki, Mimir, Prometheus, Jaeger, Graphite, Alertmanager (grafana.com/docs, 2026-10-14) | load-bearing | backend LGTM |
| S5 | docs | PostHog self-host docs (2026-10-14): mismo producto, MIT compose, *unsupported*, escala hobby | context | replay vive en UX, no acá; este backend es para método session-replay |

## RULES

- O1 [pair] Pineat SIEMPRE el par: `dartastic_opentelemetry_api: ^0.12.0` es no-op
  sin `dartastic_opentelemetry: ^0.12.0`. La API sola no emite nada → S1/S2.
- O2 [export] Export OTLP a backend compatible (Tempo/Loki/Mimir o cualquier
  backend OTel). Nada de exportadores vendor-locked como único destino → S3/S4.
- O3 [signals] Cubrir las 3 señales (traces, metrics, logs); el SDK las soporta
  todas — instrumentar solo traces es deuda → S2.
- O4 [keys] Claves de atributos con enums tipados (semconv `Http`, `Db`, `User`;
  enums propios con `OTelSemantic` para dominio). Nunca raw strings → S1.
- O5 [errors] `recordException` primero, luego `setStatus(Error)`; `Ok` es default
  y no se setea. Spans siempre en try/finally con `end()` → S1.
- O6 [storage] Mimir default para largo plazo de Prometheus; Thanos solo como
  alternativa documentada, nunca dos caminos paralelos → S4.
- O7 [isolates] Contexto no cruza isolates solo: usar `Context.runIsolate`
  (llega `isRemote: true`) — `Isolate.spawn`/`compute` directos arrancan
  sin configurar → S1.

## COUNTEREXAMPLES

```dart
// ❌ wrong: solo la API (no-op), sin SDK (O1) + raw strings (O4)
import 'package:dartastic_opentelemetry_api/dartastic_opentelemetry_api.dart';
final tracer = OTelAPI.tracerProvider().getTracer('svc'); // nunca emite
rootSpan.setBoolAttribute('ok', true); // raw string

// ✅ right: SDK + enums tipados
import 'package:dartastic_opentelemetry/dartastic_opentelemetry.dart';
final tracer = OTel.tracerProvider().getTracer('svc');
rootSpan.setBoolAttribute(ExampleAttribute.operationSuccess.key, true);
```

```yaml
# ❌ wrong: solo API en pubspec (O1)
dependencies:
  dartastic_opentelemetry_api: ^0.12.0

# ✅ right: el par
dependencies:
  dartastic_opentelemetry: ^0.12.0 # trae la API como transitiva
```

## GATES

- local: `dart analyze` + `dart test` sobre el módulo instrumentado.
- CI: lo local + smoke de export OTLP contra collector de prueba (span recibido, no solo emitido — doctrina observability-audit).

## LESSONS

- L1 (2026-10-14) El README del paquete sugiere `dartastic_opentelemetry: ^1.0.0`
  pero el último real es 0.12.0 — pineat SIEMPRE contra pub.dev API, no contra READMEs.

## RECEIPT

`candidate_sha` + verdict + tree-check (dogfood pendiente: sample con OTLP a collector local).
