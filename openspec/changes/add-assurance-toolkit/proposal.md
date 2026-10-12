# Proposal — add-assurance-toolkit

Change ID: `add-assurance-toolkit`

## Why

Los comandos de evidencia de calidad (e2e, pentest, observabilidad, triage) viven hoy dentro de `make-no-mistakes-toolkit`, cuyo dueño es la corrección del *proceso* dev (sync/merge/implement/handover). Mezclar proceso con evidencia confunde gates, owners y cadencias — un pentest trimestral no corre a ritmo de PR y un E2E por PR no decide liveness. HabitaNexus (Qualflare + Maestro, Linear como SSOT) necesita un hogar propio para "evidencia de que se puede shipear". Por eso se crea `assurance-toolkit`: 2 pilares (testing, liveness) + security transversal con runner propio, decisión consolidada en sesión `ses_ef835f485ffemfd104kHL4w0b0` (HabitaNexus QA, oct-2026).

## What Changes

- Nuevo toolkit `toolkits/assurance-toolkit/` con protocolo SSOT en `references/` + entradas thin en `commands/` + Cursor skills (patrón multi-harness existente).
- Migración con shims (no romper nada) desde `make-no-mistakes-toolkit`:
  - Mudar: `e2e-test-builder`, `e2e-test-runner`, `e2e-test-preview`, `pentest-runner`, `pentest-playbook-setup`, `observability-audit`, `triage-security-findings`.
  - No mudar: `ready-to-review-mergeable`, `premortem`, audits (`audit*`, `audit-engine`), coordinación (`merge-advisor`, `rebase`, `sync-advisor`, `takeover-pr`, `handover*`), ejecución/rituales (`implement`, `bug-squash-locally`, `secret-*`, `standup*`, `postmortem`).
- `gemini-code-review` se fusiona en `local-pr-review` como `--provider gemini` (shim con warning de deprecación, mismo precedente que `disk-cleanup`).
- Providers de evidencia: Kiwi TCMS (piloto self-hosted opcional), Qase, Qualflare (+ `qualflare-maestro`, `qualflare-flutter`, `qf collect`), Maestro flows (`.maestro/*.yaml`, disciplina `Semantics(identifier:)`), broker webhook → Linear con dedupe por cluster.
- Pilar testing polyglot (mismo protocolo de evidencia, runners por stack): Flutter/Dart por niveles (unit `flutter test` + mockito, widget `WidgetTester`, integración `integration_test` en device + Maestro YAML con `Semantics.identifier`), Laravel/Pest (`php artisan test`, `--parallel` con `brianium/paratest` + DBs por proceso, `--coverage --min`, `--profile`, suite `tests/Architecture` con arch-testing, skill `pest-testing-laraveldaily`), Elixir/ExUnit (`mix test`, Phoenix/Ecto, property-based con PropEr/StreamData, mocks con Mox y contratos explícitos), TypeScript 7 (`tsgo`, migración sin `baseUrl`, sin compiler API hasta 7.1 — clásico en paralelo u `oxc-parser` —, CI dual TS6+TS7, checklist de sharp edges).
- El toolkit NO se cierra a esos stacks: define un protocolo de adapters agnóstico (run → collect → link → cluster) y una matriz de selección E2E (Maestro default mobile-first; Playwright web cross-browser multi-lenguaje; Cypress web con DX JS; Appium nativo sin cambios de código; Selenium solo legacy) más JS unit (Vitest/Jest). Los 4 stacks son los adapters iniciales; el resto va a backlog con PoC previa obligatoria.
- Skills externos reinterpretados (no vendorados): `testdino-hq/playwright-skill` (MIT — golden rules, taxonomía/quarantine de flakes, trust boundary, guías QA de diseño de casos y bug reports) y `mobile-next/mobilewright` (Apache-2.0 — API Playwright-style móvil, fixtures `screen`/`device`, metadata `testResult`); descargados y leídos en `/tmp/opencode`, su contenido vive acá como protocolo propio con disclosure progresivo.
- Testing P0 desde deep research: mutación con MSI (Infection/Stryker/muex), contratos en dos capas (Schemathesis primero, Pact + `can-i-deploy` después), perf con thresholds (k6/Locust/Gatling/JMeter por lenguaje), Patrol gris + Maestro humo, a11y escalonada (axe-core, Axe DevTools Mobile), visual + PBT.
- Component testing web vía Storybook: stories CSF como unidades portables (render + play + a11y + visual + coverage + unit + E2E vía iframe), Vitest addon default en Vite (browser mode real), test-runner donde no hay Vite, tags que gobiernan la suite.
- Component testing Flutter vía Widgetbook (espejo): scenarios congelados (args fijos + modes + `run`), matriz global theme × locale × text-scale × device, goldens con entorno fijo, 4 guidelines a11y por celda + semantics diff, tokens como cheapest fix. Contexto legal: EAA aplicable desde jun-2025 (EN 301 549 / WCAG AA) para e-commerce, banca, e-books, transporte, telecom en UE.
- Security desde research: trazabilidad MASVS → MASWE → MASTG v2 con perfiles L1/L2/R/P, capa SAST/DAST/SCA, supply-chain firmada (SBOM, Sigstore, SLSA, admission fail-closed).
- Liveness + gobierno: chaos con hipótesis SLO y abort (Litmus vs Chaos Mesh por decidir; Antithesis en evaluación), baselines de perf → SLOs, y capability nueva `toolkit/assurance-governance` (DORA/DER/MTTD, gates por etapa, receipts fase 7); pre-flight K8s (cada fallo del troubleshooting guide es un gate), playbook de diagnóstico + runbooks con pattern-IDs (MDAA/Sysinternals, taxonomía fractional-cto 08/09), supply-chain móvil sin fuente (modelo REA: snapshot hash, engine provenance, evidencia + limitaciones).
- Migración de 21 skills desde `flutter-boilerplate-monorepo-template/skills` (6 flutter + 11 SRE + argocd + github-actions + static-analysis + versioning universal) reinterpretados al protocolo + thin skills, con shims en el template (BSL-1.1, mismo org).
- Matrices K8s (kubernetes.qa, 11 comparativas + gates/chaos/health): stack pre-flight en capas (kubeconform → kube-score → Trivy → Checkov/kubeaudit; Kubescape posture+RBAC; kube-bench CIS; kubeval/kube-hunter excluidos), policy engines (Kyverno vs Gatekeeper), runtime detect-vs-prevent (Falco + KubeArmor/Tetragon), gates con exit codes y thresholds por env, health score 8D, chaos con resilience score.
- Frontera entre toolkits: OpenSpec + Linear como SSOT compartido — assurance escribe evidencia (runs, clusters, links), dev-workflow la consume en gates. Slot `transversals/receipts/` reservado pero vacío (fase 7 del plan 08-02).
- **BREAKING**: ninguna en esta change (solo shims + docs; borrado de shims en una minor posterior).

## Capabilities

### New Capabilities

- `toolkit/assurance-testing`: pilar testing — construir/ejecutar/preview E2E (incl. Maestro), colectar resultados (flutter test JSON → `qf collect`), providers Kiwi/Qase/Qualflare con `qualflare.link` a issues, clustering de fallos con dueño/SLA en el lado testing; runners por stack bajo el mismo protocolo de evidencia: Laravel/Pest, Elixir/ExUnit, TypeScript 7 (`tsgo`); eval-driven development para features con LLM (criterios, judges calibrados); suites risk-driven con self-testing (Fowler).
- `toolkit/assurance-liveness`: pilar liveness — `observability-audit` + escalera (probe/heartbeat/absence/synthetic), señales de readiness, corre siempre (no por PR).
- `toolkit/assurance-security`: transversal security con runner propio — `pentest-runner` (cadencia por release), `pentest-playbook-setup`, `triage-security-findings` (SLA de hallazgo); reportes de seguridad nunca mezclados con reportes de tests; cada release exige veredictos separados; trazabilidad MASVS → MASWE → MASTG, capa SAST/DAST/SCA, supply-chain firmada con admission fail-closed; red-team agentic OWASP ASI01–ASI10 + LLM02 en 4 fases con SoD.
- `toolkit/assurance-governance`: gobierno de evidencia — métricas outcome-based (DORA, DER/DRE, MTTD/MTTR, flaky rate, anti-gaming), gates por etapa (commit/PR/release) y receipts trazables fase 7; pipeline de gates con patrones GitOps (waves, hooks Pre/PostSync, baselines, health).

### Modified Capabilities

- (vacío — no hay specs previas que cambiar; `make-no-mistakes-toolkit` conserva sus comandos vía shims en esta change)

## Impact

- Afecta: `toolkits/assurance-toolkit/` (nuevo), `toolkits/make-no-mistakes-toolkit/commands/` + `references/` (shims de los 7 comandos mudados + `gemini-code-review`), `.claude-plugin/marketplace.json` + plugin manifests (versiones), docs del marketplace.
- Sistemas: Qualflare / Qase / Kiwi TCMS, Maestro, Linear (issues + webhook broker), OpenSpec store repo-local; stacks cubiertos: Flutter/Dart, Laravel/PHP (Pest/PHPUnit), Elixir (ExUnit/Phoenix/Ecto), TypeScript 7 (`tsgo`).
- Non-goals: no implementar providers ni webhook broker aquí (solo protocolo + shims); no borrar shims; no tocar `ready-to-review-mergeable`/`premortem`; no crear repo nuevo para Kiwi (PRs a `mcp-kiwi-tcms`); no fijar versiones de `qualflare-maestro`/`tsgo` (se pinean en apply).
- Éxito verificable: `openspec validate --change add-assurance-toolkit` pasa; los 7 comandos resuelven desde el nuevo toolkit y los shims viejos delegan con warning; `assurance-toolkit` lista 2 pilares + transversal en su README/protocolo.
