# Pilar testing — protocol SSOT

Harness-agnostic body. Thin entries: `commands/e2e-test-builder.md`, `commands/e2e-test-runner.md`, `commands/e2e-test-preview.md`.
Full behavior contract: `openspec/changes/add-assurance-toolkit/specs/toolkit/assurance-testing/spec.md`.

## Principio

Un protocolo de evidencia (run → collect → link a Linear → cluster), runners por stack.
Los stacks iniciales son los primeros adapters, no una lista cerrada (ver matriz + PoC en spec).

## Runners

- **Flutter/Dart por niveles**: unit `flutter test` + mockito, widget `WidgetTester`,
  integración `integration_test` en device + Maestro YAML (`Semantics.identifier`, Flutter 3.19+).
  `flutter_driver` = legacy. Patrol gris (regresión dev-owned) + Maestro humo (QA-owned).
- **Component testing**: stories CSF / scenarios Widgetbook como unidades portables
  (render + play + a11y + visual + coverage + unit + E2E vía iframe). Vitest addon en Vite;
  test-runner sin Vite. Tags gobiernan la suite.
- **Laravel/Pest**: `php artisan test`, `--parallel` (paratest + DBs por token),
  `--coverage --min`, `--profile`, suite `tests/Architecture` (arch-testing).
- **Elixir/ExUnit**: `mix test`, Phoenix/Ecto, PropEr/StreamData, Mox con contratos explícitos.
- **TypeScript 7**: checklist `tsgo` (versión única, sin `baseUrl`, plan compiler API, CI dual, sharp edges).
- **Playwright web**: golden rules (getByRole, sin `waitForTimeout`, web-first assertions,
  aislamiento, baseURL, retries 2/0, traces `on-first-retry`), cuarentena con salida
  (`fail` > `skip`, `@critical` exento), trust boundary. UI mode + `trace.zip` como evidencia.
- **MobileWright** (PoC): API Playwright-style móvil, fixtures `screen`/`device`,
  metadata `testResult` → evidencia. Maestro sigue default mobile-first hasta la PoC.
- **Mutación**: Infection / Stryker / muex; MSI como gate, scope incremental.
- **Contratos**: Schemathesis primero (sin infra), Pact + `can-i-deploy` después; Microcks/Prism mocks.
- **Perf**: k6 / Locust / Gatling / JMeter por lenguaje; thresholds → exit code; p95/p99 a SLOs.
- **A11y**: axe-core (web), Axe DevTools Mobile + Maestro, guidelines Flutter por celda +
  semantics diff; critical/serious bloquean, moderate/minor advierten.
- **Visual/PBT**: `toHaveScreenshot` con umbral; fast-check / Hypothesis / PropEr.

## Reglas de gate

- Golden rules exigibles antes del merge; taxonomía de flakes dirige el fix (nunca subir timeouts).
- Reportes de tests nunca mezclados con reportes de seguridad (veredictos separados).
