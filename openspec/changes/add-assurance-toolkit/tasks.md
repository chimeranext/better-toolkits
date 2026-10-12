# Tasks — add-assurance-toolkit

## 1. Scaffold del toolkit

- [x] 1.1 Crear `toolkits/assurance-toolkit/` (plugin manifest, README con 2 pilares + transversal, `references/`, `commands/` thin, skills) y verificar que el layout espeja `make-no-mistakes-toolkit`
- [x] 1.2 Registrar el toolkit en `.claude-plugin/marketplace.json` (+ versión) y verificar que el marketplace lista `assurance-toolkit`

## 2. Migración de protocolos con shims

- [x] 2.1 Mudar protocolos de `e2e-test-builder/runner/preview` al nuevo toolkit y dejar shims delegantes con warning; verificar que el comando viejo delega y avisa
- [x] 2.2 Mudar `pentest-runner` + `pentest-playbook-setup` con shims; verificar delegación con warning y reporte separado de tests
- [x] 2.3 Mudar `observability-audit` (escalera probe/heartbeat/absence/synthetic) con shim; verificar que distingue "pasa" de "dejó de pasar"
- [x] 2.4 Mudar `triage-security-findings` (patrón cola → dueño → SLA → receipt) con shim; verificar SLA/escalado sin duplicar issues Linear
- [x] 2.5 Fusionar `gemini-code-review` en `local-pr-review --provider gemini` + shim con warning; verificar que el shim viejo delega

## 3. Protocolo providers + Maestro (solo docs)

- [x] 3.1 Documentar providers Kiwi/Qase/Qualflare (`qf collect`, `qualflare.link`, webhook con dedupe por cluster) en `references/` y verificar que los comandos documentados existen como protocolo (sin implementar broker)
- [x] 3.2 Documentar convención Maestro (`.maestro/*.yaml`, `Semantics(identifier:)`, `qualflare-maestro` pineado, Studio) y verificar el flow de ejemplo `negotiation_happy_path.yaml` como referencia

## 4. Protocolo runners polyglot (solo docs)

- [x] 4.1 Documentar runner Laravel/Pest (`php artisan test`, `--parallel` + DBs por token, `--coverage --min`, `--profile`, suite `tests/Architecture`, skill `pest-testing-laraveldaily`) y verificar el protocolo contra una app Laravel de ejemplo
- [x] 4.2 Documentar runner Elixir/ExUnit (`mix test`, Phoenix/Ecto, PropEr/StreamData, Mox con contratos explícitos) y verificar el protocolo contra un proyecto de ejemplo
- [x] 4.3 Documentar checklist TS7 (`tsgo`, sin `baseUrl`, plan compiler API, CI dual, sharp edges) y verificarlo contra un paquete TypeScript de ejemplo
- [x] 4.4 Documentar pirámide Flutter/Dart (unit `flutter test` + mockito, widget `WidgetTester`, `integration_test` + Maestro con `Semantics.identifier`, `flutter_driver` legacy, refs `gallery`/`manual_tests`) y verificarla contra un paquete Flutter de ejemplo
- [x] 4.5 Documentar anexo de panorama (matriz Maestro/Playwright/Cypress/Appium/Selenium + Vitest/Jest, criterios plataforma/lenguaje/skill/costo) y backlog de adapters con PoC obligatoria; verificar que agregar un adapter no toca el protocolo
- [x] 4.6 Documentar adapter Playwright (golden rules, taxonomía de flakes + flowchart, cuarentena con salida y exención `@critical`, trust boundary, UI mode `npx playwright test --ui`, trace.zip como evidencia) reinterpretado del skill TestDino; verificar golden rules contra una suite web de ejemplo
- [x] 4.7 Ejecutar PoC MobileWright (un spec iOS+Android, metadata `testResult` → evidencia) y decidir si comparte default mobile-first con Maestro; verificar que el a11y tree basta sin modelo de visión

## 5. Testing P0 desde research (solo docs + gates)

- [x] 5.1 Documentar mutación (Infection/Stryker/muex, MSI como gate, scope incremental) y verificar MSI contra una suite de ejemplo
- [x] 5.2 Documentar contratos en dos capas (Schemathesis + baseline, Pact + `can-i-deploy`, Microcks/Prism) y verificar spec-drift contra una API de ejemplo
- [x] 5.3 Documentar perf (matriz k6/Locust/Gatling/JMeter, thresholds → exit code, percentiles a SLOs) y verificar un gate de p99 de ejemplo
- [x] 5.4 Documentar Patrol gris + Maestro humo (caveat CI, pin de versiones, device OS fijo) y a11y escalonada (axe-core, Axe DevTools Mobile, fail critical/serious) y verificar contra una app Flutter de ejemplo
- [x] 5.5 Documentar component testing con stories portables (play + queries por rol, Vitest addon vs test-runner, a11y error/todo/off, tags) y verificar una story corriendo en Vitest + a11y + E2E iframe
- [x] 5.6 Documentar scenarios Widgetbook (args fijos + modes + `run`, matriz global, goldens con entorno fijo, 4 guidelines + semantics diff, tokens como cheapest fix) y verificar un scenario en matriz theme × locale × text-scale
- [x] 5.7 Documentar eval-driven development (criterios, judges calibrados, benchmark hygiene, feedback conversacional) y suites risk-driven + characterization tests (Fowler) y verificar criterios medibles en una feature con LLM de ejemplo

## 6. Security desde research (solo docs + gates)

- [x] 6.1 Documentar trazabilidad MASVS → MASWE → MASTG v2 con perfiles L1/L2/R/P y guía de fix MASTG-BEST; verificar un hallazgo de ejemplo mapeado de punta a punta
- [x] 6.2 Documentar capa SAST/DAST/SCA (Semgrep, ZAP, Trivy/Grype, dependency-review) y supply-chain firmada (SBOM canónico, Sigstore, SLSA L2/L3, admission fail-closed); verificar un deploy sin firma rechazado en un cluster de prueba
- [x] 6.3 Documentar red-team agentic (ASI01–ASI10 + LLM02, 4 fases, SoD, tool scoping, agent graph, PII tolerancia cero) y verificar scenario maps versionados para un agente de ejemplo
- [x] 6.4 Documentar runtime K8s (Falco detect + KubeArmor/Tetragon prevent, matriz de decisión) y policy engines (Kyverno vs Gatekeeper, audit-first) y verificar audit-mode antes de enforce

## 7. Liveness y gobierno (solo docs + gates)

- [x] 7.1 Decidir Litmus vs Chaos Mesh con PoC (hipótesis SLO, probes, abort criteria) y evaluar Antithesis para sistemas con estado; verificar un experimento con veredicto objetivo
- [x] 7.2 Documentar métricas (DORA, DER/DRE, MTTD/MTTR, `found_env`, ventana 14d, anti-gaming), gates por etapa y formato de receipts fase 7; verificar un release reconstruible desde receipts
- [x] 7.3 Documentar pipeline de gates GitOps (waves, hooks Pre/PostSync, `ignoreDifferences` como baseline, health assessment, App of Apps) y verificar orden infra-primero en un deploy de ejemplo
- [x] 7.4 Documentar pre-flight en capas (kubeconform → kube-score → Trivy → Checkov/kubeaudit; Kubescape/RBAC; kube-bench CIS), gates con exit codes y thresholds por env, y health score 8D; verificar stack sin doble-reporte

## 9. Migración 21 skills del template (ejecutada con shims)

- [x] 9.1 Migrar 6 skills flutter (testing-strategy, mobile-testing, accessibility, performance → testing; error-tracking → liveness; security → security) con thin skills + protocolo + shim
- [x] 9.2 Migrar 7 skills SRE testing/liveness (load, observability, alerting, logging, chaos, db-part, DR-part) con thin skills + protocolo + shim
- [x] 9.3 Migrar 4 skills SRE security+gobierno (sec-compliance, container, network, slo) con thin skills + protocolo + shim
- [x] 9.4 Migrar 4 restantes (argocd, github-actions, static-analysis, versioning universal SemVer+commits) con thin skills + protocolo + shim
- [x] 9.5 Verificar 21 shims en el template y licencia compatible (BSL-1.1, mismo org)
- [x] 9.6 Validar change + PR en ambos repos (better-toolkits y monorepo-template) con HITL y mergear
- [x] 9.7 Documentar en protocolo: eval-driven + Fowler (testing), red-team agentic + REA móvil (security), GitOps + K8s pre-flight (governance), playbook/runbook taxonomy (liveness) — implementado y verificado en archivos

## 8. Validación e integración

- [x] 8.1 Pasar `openspec validate --change add-assurance-toolkit` y verificar cero errores
- [x] 8.2 Verificar que `ready-to-review-mergeable`, `premortem`, audits y comandos de coordinación siguen en `make-no-mistakes-toolkit` sin shims
- [x] 8.3 Abrir PR con HITL (sin push directo a shared state) y verificar CI verde antes de pedir review
