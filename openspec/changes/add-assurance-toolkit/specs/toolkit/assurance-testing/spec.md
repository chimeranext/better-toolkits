# Spec Delta — toolkit/assurance-testing

## Purpose

Pilar testing del assurance-toolkit: construir, ejecutar y previsualizar evidencia (E2E incl. Maestro/Flutter; suites Laravel/Pest, Elixir/ExUnit, TypeScript 7) y colectarla en providers trazables a Linear.

## ADDED Requirements

### Requirement: E2E builder, runner y preview con protocolo propio

El sistema SHALL proveer `e2e-test-builder`, `e2e-test-runner` y `e2e-test-preview` solo desde `assurance-toolkit`. Cada comando SHALL seguir su protocolo (`references/e2e-test-builder/protocol.md`, `references/e2e-test-runner/protocol.md`, `references/e2e-test-preview/protocol.md`). Esos tres protocolos SHALL permanecer distintos del pilar `references/testing/protocol.md`. `make-no-mistakes-toolkit` SHALL NOT conservar shims de estos comandos.

#### Scenario: Cada comando resuelve su protocolo

- **WHEN** un agente invoca `/assurance:e2e-test-builder`, `/assurance:e2e-test-runner` o `/assurance:e2e-test-preview`
- **THEN** sigue el protocolo de ese comando (generar suite, ejecutar suite, o abrir el preview Qt) y no el pilar testing ni un shim en make-no-mistakes

#### Scenario: Maestro flow mínimo

- **WHEN** existe `.maestro/negotiation_happy_path.yaml` y backend de prueba levantado
- **THEN** el runner ejecuta el flow y produce un reporte colectable (`qf collect` o equivalente)

### Requirement: Providers de evidencia con trazabilidad a Linear

El sistema SHALL soportar Kiwi TCMS (piloto self-hosted opcional), Qase y Qualflare como destinos de resultados, con link del test al issue Linear (`qualflare.link` o campo equivalente).

#### Scenario: Collect de flutter test a Qualflare

- **WHEN** `flutter test` produce JSON y hay proyecto Qualflare configurado
- **THEN** `qf collect` sube los resultados y cada test enlaza a su issue Linear

#### Scenario: Sin mezcla de reportes de seguridad

- **WHEN** se colectan resultados de testing
- **THEN** ningún hallazgo de pentest aparece en el reporte de tests (veredictos separados)

### Requirement: Clustering de fallos del lado testing

El sistema SHALL agrupar fallos de runs (patrón triage: cola → dueño → SLA → receipt) operado por el dueño de testing, separado del triage de seguridad.

#### Scenario: Fallos duplicados se clusterizan

- **WHEN** un webhook `defect.created` llega con la misma firma de fallo
- **THEN** se vincula al cluster existente en vez de abrir un issue Linear duplicado

### Requirement: Runner Laravel/Pest bajo el mismo protocolo de evidencia

El sistema SHALL soportar suites Laravel vía `php artisan test` (Pest/PHPUnit): ejecución en paralelo con `brianium/paratest` y DBs por proceso (sufijo por token, hooks `ParallelTesting`), cobertura con `--coverage --min`, profiling con `--profile`, entorno `.env.testing`, y suite `tests/Architecture` con arch-testing de Pest; la skill `pest-testing-laraveldaily` es la referencia de autoría de tests.

#### Scenario: Suite Laravel colectable

- **WHEN** un repo Laravel tiene suites Feature/Unit/Architecture y `phpunit.xml` válido
- **THEN** el runner ejecuta `php artisan test` (o `--parallel`), colecta resultados al provider configurado y falla el gate si la cobertura bajo `--min` no se cumple

#### Scenario: Arch-testing bloquea violaciones estructurales

- **WHEN** una clase viola una regla de `tests/Architecture` (p. ej. un modelo que no extiende `Model`, un `dd()` en `app/`)
- **THEN** la suite Architecture falla con el archivo y la expectativa violada, sin mezclar ese fallo con reportes de seguridad

### Requirement: Runner Elixir/ExUnit bajo el mismo protocolo de evidencia

El sistema SHALL soportar suites Elixir vía `mix test` (ExUnit, incl. Phoenix/Ecto), property-based testing (PropEr/StreamData) y mocks con Mox/Hammox bajo contratos explícitos.

#### Scenario: Suite Elixir colectable

- **WHEN** un proyecto Elixir/Phoenix tiene suite ExUnit
- **THEN** el runner ejecuta `mix test`, colecta resultados al provider configurado y los vincula a sus issues Linear

### Requirement: Validación de compatibilidad TypeScript 7

El sistema SHALL validar la migración a TypeScript 7 (`tsgo`, port nativo en Go) como checklist: versión única del compilador en el repo, `tsconfig` sin `baseUrl` (paths relativos, `vite-tsconfig-paths` compatible), plan para código que importa `typescript` como librería (clásico en paralelo hasta API 7.1 u `oxc-parser`), CI dual TS6+TS7 durante la transición, y revisión de sharp edges (genéricos de typed-arrays, `Buffer` vs `Uint8Array`, mapped types recursivos, flags de memoria eliminados).

#### Scenario: Migración TS7 verificada

- **WHEN** un paquete declara TypeScript 7
- **THEN** el gate verifica `tsgo --noEmit` en verde, ausencia de `baseUrl`, y que ningún script dependa de la compiler API sin plan de respaldo

#### Scenario: Regresión entre compiladores detectada

- **WHEN** CI dual reporta verde en clásico y rojo en `tsgo` (o viceversa)
- **THEN** el resultado se reporta como issue de compatibilidad de compilador, no como fallo funcional del código

### Requirement: Runner Flutter/Dart por niveles (unit/widget/integration)

El sistema SHALL soportar la pirámide Flutter/Dart: unit con `package:test`/`flutter_test` (`flutter test`, mocks con mockito, tags y `dart_test.yaml`), widget con `WidgetTester` + finders, e integración con `integration_test` en device real/simulado más Maestro YAML (capa de accesibilidad, `Semantics.identifier` desde Flutter 3.19, release builds, diálogos nativos, auto-waits, un flow Android+iOS, `runFlow` modular, Studio). `flutter_driver` queda como legacy (solo debug/profile, sin diálogos nativos). Referencias de suites: `flutter/gallery` y `flutter/dev/manual_tests`.

#### Scenario: Pirámide completa colectable

- **WHEN** un paquete tiene tests unit/widget/integration y flows Maestro
- **THEN** el runner ejecuta `flutter test` + integración en device + flows, y colecta todo al provider configurado con links a Linear

#### Scenario: Maestro exige identifiers

- **WHEN** un flow Maestro referencia un widget sin `Semantics.identifier`
- **THEN** el protocolo lo marca no testeable y exige el identifier por lint antes del gate

#### Scenario: flutter_driver marcado legacy

- **WHEN** un proyecto aún usa `flutter_driver`
- **THEN** el protocolo lo marca deprecated y propone migración a `integration_test` + Maestro

### Requirement: Adapters agnósticos al framework, no lista cerrada

El sistema SHALL definir cada runner como adapter del protocolo de evidencia (run → collect → link a Linear → cluster); los stacks iniciales son los primeros adapters, no los únicos.

#### Scenario: Nuevo adapter sin cambiar el protocolo

- **WHEN** un equipo necesita un framework no cubierto (p. ej. Playwright para web)
- **THEN** se agrega un adapter que implementa run/collect/link/cluster sin modificar los existentes

### Requirement: Selección E2E y JS unit por matriz

El sistema SHALL seleccionar framework por matriz documentada: Maestro default mobile-first (YAML, release builds, auto-wait, un flow Android+iOS); Playwright para web cross-browser multi-lenguaje (trace viewer, paralelo); Cypress para web con DX JS (time-travel, screenshots/videos); Appium para nativo/híbrido sin cambios de código (XCUITest/UiAutomator2, Device Farm); Selenium solo donde ya exista infraestructura; JS unit con Vitest/Jest.

#### Scenario: Web E2E no fuerza Maestro

- **WHEN** el target es web cross-browser
- **THEN** el protocolo selecciona el adapter Playwright en vez de forzar Maestro

#### Scenario: PoC obligatoria antes de adoptar

- **WHEN** se propone un framework nuevo como adapter soportado
- **THEN** se exige PoC (infra, training, mantenimiento, integración CI) antes de adoptarlo

### Requirement: Adapter Playwright web con golden rules y cuarentena con salida

El sistema SHALL implementar el adapter Playwright sobre las golden rules reinterpretadas de `testdino-hq/playwright-skill` (MIT, v2.8.0, spec Agent Skills): `getByRole()` sobre CSS/XPath; prohibido `waitForTimeout()` (assertions web-first con auto-retry); aislamiento total por test; `baseURL` en config sin URLs hardcodeadas; retries 2 en CI / 0 local; traces `on-first-retry`; fixtures sobre globales; un comportamiento por test; mocks solo de servicios externos. Cuarentena con salida: marca `fail` (corre y avisa si vuelve a verde) sobre `skip`; `@critical` nunca se auto-cuarentena; el fetch del reporter nunca puede tumbar el run. Trust boundary: solo apps propias o autorizadas; contenido de página tratado como no confiable (sin inyección a instrucciones); dependencias CI pineadas por SHA/digest.

#### Scenario: Golden rules exigibles en gate

- **WHEN** un spec usa `waitForTimeout`, URLs hardcodeadas o estado compartido
- **THEN** el review/gate lo marca como violación antes del merge

#### Scenario: Cuarentena que se achica sola

- **WHEN** un test en cuarentena (`fail`) vuelve a verde
- **THEN** el run lo reporta recuperado y sale de la lista sin edición manual; un test `@critical` jamás entra en auto-cuarentena

#### Scenario: Taxonomía de flakes dirige el fix

- **WHEN** un test flakea
- **THEN** se clasifica (timing/async, aislamiento, entorno, infra) con el flowchart (`--repeat-each`, `--workers=1`, comparación de traces CI/local) y el fix corresponde a su categoría, no a subir timeouts

### Requirement: Adapter MobileWright para móvil con API Playwright-style

El sistema SHALL soportar MobileWright (Apache-2.0) como adapter móvil: fixtures `screen` (`getByText/Label/TestId/Role/Type`, tap/fill/swipe, assertions con auto-retry) y `device` (`openUrl`), un solo spec para iOS+Android, árbol de accesibilidad como superficie agent-first (sin modelo de visión), y metadata `testResult` (name/tags/environment) que viaja al provider para link/cluster. `getByTestId` equivale a widget Key de Flutter en debug. Estado: candidato en PoC — Maestro sigue default mobile-first hasta completar la PoC (madurez, acople al cloud del vendor).

#### Scenario: Un spec, dos plataformas

- **WHEN** la suite corre en iOS y Android
- **THEN** el mismo spec ejecuta en ambas sin branches por plataforma

#### Scenario: Metadata de evidencia viaja al provider

- **WHEN** termina un run MobileWright con `testResult` configurado
- **THEN** name/tags/environment se colectan como evidencia trazable a Linear

### Requirement: Mutation testing con gates MSI por stack

El sistema SHALL soportar mutación por stack: Infection (PHP/PHPUnit, `minMsi`/`minCoveredMsi`, integración PHPStan/Mago), Stryker (TS/JS, incremental), muex (Elixir). El MSI es gate (el coverage solo no aprueba); en CI se muta incremental (líneas tocadas).

#### Scenario: MSI bajo bloquea aunque el coverage sea alto

- **WHEN** la suite tiene 90% coverage pero MSI bajo el umbral
- **THEN** el gate falla (los tests ejecutan código sin verificarlo)

#### Scenario: Survivors triageados con ubicación exacta

- **WHEN** un mutante sobrevive
- **THEN** se reporta con archivo, línea y mutador para crear el test faltante

### Requirement: Contract testing en dos capas

El sistema SHALL cubrir contratos en dos capas: schema-driven primero con Schemathesis (CLI contra OpenAPI, sin infra nueva, baseline de fallos conocidos, nightly o PR del provider — también fuerza higiene del spec), y consumer-driven con Pact + Broker + `can-i-deploy` como gate de deploy para pares con historial de rupturas; Microcks/Prism para mocks consistentes; BDCT (PactFlow) donde el provider no instala verificación.

#### Scenario: Spec drift detectado en el provider

- **WHEN** Schemathesis corre contra staging y la respuesta viola el OpenAPI
- **THEN** la violación bloquea o entra al baseline como fallo conocido, nunca se ignora en silencio

#### Scenario: Deploy bloqueado por incompatibilidad

- **WHEN** `can-i-deploy` da rojo para la versión candidata
- **THEN** el pipeline frena el deploy con el par consumer/provider responsable

### Requirement: Performance testing con thresholds como gates

El sistema SHALL soportar perf por lenguaje del equipo: k6 default JS/TS (thresholds → exit code, executors de arrival-rate), Locust Python (distribuido gratis), Gatling JVM (reportes HTML), JMeter protocolos legacy o testers no-code. Se reportan percentiles (p95/p99, no promedios) y alimentan los SLOs de liveness. Nota licencia: k6 es AGPL-3.0 (decisión legal si se embebe; usarlo como herramienta CLI contra sistemas propios no dispara copyleft).

#### Scenario: Threshold roto frena la promoción

- **WHEN** el p99 supera el umbral declarado
- **THEN** el run sale non-zero y bloquea el gate correspondiente

### Requirement: Patrol gris para regresión, Maestro para humo (Flutter)

El sistema SHALL usar Patrol como default de regresión dev-owned (Dart, Keys, `$.native` para permisos/WebViews/notificaciones, corre en farms que soportan tests nativos) y Maestro para smoke QA-owned y restart; `integration_test` para checks dev rápidos. Caveat registrado: inestabilidad CI de Patrol → pinear versiones y fijar imágenes de device OS.

#### Scenario: Flujo con permiso nativo

- **WHEN** el flujo exige diálogo de permiso del SO
- **THEN** se usa Patrol o Maestro, nunca solo `integration_test`

### Requirement: Accesibilidad por niveles con gate escalonado

El sistema SHALL auditar a11y por niveles: axe-core en web/WebView (WCAG 2.0–2.2 A/AA), Axe DevTools Mobile + comandos Maestro (`axeStartScanSession`/`axeScan`) en nativo, XCTest/Espresso donde aplique, MCP scanner para auditorías agent-first. Gate: critical/serious bloquean, moderate/minor solo advierten.

#### Scenario: Violación crítica bloquea

- **WHEN** el scan reporta una violación critical o serious
- **THEN** el gate falla con criterio WCAG y elemento afectado

### Requirement: Regresión visual y PBT general

El sistema SHALL soportar regresión visual web con `toHaveScreenshot` (baselines WebP, umbral `maxDiffPixelRatio`) y property-based testing por stack: fast-check (TS), Hypothesis/Schemathesis (API/Python), PropEr/StreamData (Elixir) — invariantes sobre rangos y bordes, no solo ejemplos.

#### Scenario: Diff visual decide con umbral

- **WHEN** la UI cambia y el diff supera el umbral configurado
- **THEN** el caso falla con screenshots de baseline/actual/diff adjuntos

### Requirement: Stories como unidades portables de test (component testing)

El sistema SHALL tratar las stories (CSF) como fixture única que alimenta todos los niveles sin reescribir: render test (smoke), interacción con play function (queries Testing Library con prioridad rol → testid como último recurso, `userEvent`/`expect` siempre awaited, spies `fn()`, agrupación `step()`, aislamiento `beforeEach/afterEach`), a11y vía addon (axe-core, `parameters.a11y.test` en `error`/`todo`/`off`), visual (Chromatic), coverage desde stories, unit (portable stories) y E2E (iframe `?id=` con Cypress/Playwright). Runner default: Vitest addon (browser mode Chromium real, tags `include/exclude/skip`, UI/CLI/CI/editor); test-runner (Jest) solo donde el framework no usa Vite. La migración a11y `error` → `todo` → fix mapea al gate escalonado.

#### Scenario: Una story, muchos runners

- **WHEN** existe una story con play function
- **THEN** corre como component test (Vitest), a11y, visual y E2E vía iframe sin duplicar autoría

#### Scenario: A11y error/todo/off mapea al gate

- **WHEN** `a11y.test` es `error` y hay violación
- **THEN** bloquea; si es `todo` advierte; `off` solo en antipatterns documentados

#### Scenario: Tags gobiernan la suite

- **WHEN** una story lleva tag `experimental`
- **THEN** queda excluida del gate pero visible en resultados

### Requirement: Scenarios Widgetbook como unidades portables Flutter

El sistema SHALL tratar los scenarios Widgetbook como espejo Flutter de las stories web: Story (un estado, `$`-var en `.stories.dart`) + Args type-safe (`Arg.fixed` pineado) + Modes (theme/locale/viewport/text-scale vía addons) + Scenario congelado (args fijos, determinista, corre en `flutter_test` con callback `run` para taps/pumps/asserts, screenshot a `build/.widgetbook`). Definitions globales con estrategias `perScenario`/`perStory`/`both` multiplican la matriz (theme × locale × text-scale × device) en un solo `flutter test`. Goldens: entorno fijo + review colaborativo (cero goldens escritos a mano en Cloud); guidelines a11y de `flutter_test` (androidTapTarget 48, iOSTapTarget 44, labeledTapTarget → WCAG 4.1.2, textContrast → WCAG 1.4.3) en cada celda; semantics-tree diff para regresiones invisibles al diff visual. Cheapest fix: tokens del design system (contraste, target size) antes que tests.

#### Scenario: Un scenario, matriz completa

- **WHEN** un scenario cruza definitions globales
- **THEN** corre en theme × locale × viewport × text-scale con las 4 guidelines en cada celda

#### Scenario: Golden sin falsos positivos de plataforma

- **WHEN** los goldens corren en entorno controlado con review colaborativo
- **THEN** no fallan por rendering de plataforma y solo cambios intencionales actualizan la referencia

#### Scenario: Semantics diff detecta lo invisible

- **WHEN** un refactor quita un label sin cambiar un píxel
- **THEN** el diff de semántica lo detecta aunque el diff visual pase

### Requirement: Eval-driven development para features con LLM

El sistema SHALL aplicar evaluation-driven development (Huyen Ch4): criterios medibles primero (factual consistency local/global, safety, capabilities de dominio), benchmarks con desconfianza (mayoría close-ended tipo MMLU: verificar qué miden antes de confiar), judges especializados y calibrados sobre LLM-judges genéricos, pipeline de eval que guía el desarrollo y feedback conversacional como dato (Ch10). Defensa de prompt attacks en capas con system prompt priorizado (Ch5).

#### Scenario: Criterios antes que código

- **WHEN** arranca una feature con LLM
- **THEN** existen criterios medibles + baseline antes del primer deploy (una app desplegada sin evaluación es peor que no desplegarla)

#### Scenario: Judge calibrado, no opinión genérica

- **WHEN** se usa AI-judge
- **THEN** es especializado, calibrado contra anotadores y versionado con el pipeline

### Requirement: Suites risk-driven con self-testing (Fowler)

El sistema SHALL diseñar suites risk-driven: testear lo que más preocupa que falle (no "todo método público"); tests incompletos que corren valen más que tests completos inexistentes; auto-verificantes, frecuentes y aislados (cualquier orden); characterization tests antes de refactorizar legacy sin red.

#### Scenario: Suite económica priorizada por riesgo

- **WHEN** el tiempo es limitado
- **THEN** la cobertura prioriza riesgo documentado, y el resto queda como deuda explícita, no como hueco silencioso

#### Scenario: Refactor con red

- **WHEN** se refactoriza código sin tests
- **THEN** hay characterization tests en verde antes y después de cada paso pequeño
