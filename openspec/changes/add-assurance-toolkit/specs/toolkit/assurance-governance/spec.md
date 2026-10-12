# Spec Delta — toolkit/assurance-governance

## Purpose

Gobierno de evidencia del assurance-toolkit: métricas outcome-based, gates por etapa y receipts trazables que convierten corridas de tests en decisiones de release defendibles.

## ADDED Requirements

### Requirement: Métricas outcome-based (DORA / DER / MTTD)

El sistema SHALL medir outcomes, no actividad: DORA (deployment frequency, lead time, change fail rate, failed deployment recovery time, rework rate) más DER/DRE, MTTD/MTTR y flaky rate. El join test-results ↔ tracker usa `found_env` y `commit_sha` (Sentry/PagerDuty/rollbacks entran con `found_env=production` automático); ventana de atribución de 14 días y defectos `unattributed` como señal propia. Anti-gaming: ratios y tendencias, nada de targets individuales, cobertura como diagnóstico (Goodhart).

#### Scenario: Escape computable sin trabajo manual

- **WHEN** un defecto de producción entra por cualquier canal
- **THEN** queda etiquetado y el DER/DRE del release se recalcula solo

#### Scenario: Flaky backlog sube, escape bajo sospecha

- **WHEN** crece la cuarentena de flakies
- **THEN** el dashboard marca riesgo de escape (cobertura en deuda), no solo molestia

### Requirement: Gates por etapa, rápidos primero

El sistema SHALL definir gates por etapa: commit (lint, unit, coverage del cambio), PR (tests 100%, security críticas 0, `coverage_delta` ≥ 0), release (e2e pass, p95, DER bajo umbral, `can-i-deploy` donde aplique). Lo barato y rápido primero; cada gate previene una clase de fallo vista o temida; flaky = defecto (cuarentena, fix o remove).

#### Scenario: Gate rojo frena con causa linkeada

- **WHEN** un gate falla
- **THEN** la promoción se bloquea con link directo a la evidencia que lo tumbó

### Requirement: Receipts trazables (fase 7, slot ocupado)

El sistema SHALL emitir un receipt por veredicto (tests, liveness, security): qué corrió, dónde, contra qué baseline, con qué IDs (Linear, MASWE/MASTG, contrato) y bajo qué versión (SemVer + conventional commits, exigible en todo repo vía commitlint y releases automatizados). El slot `transversals/receipts/` deja de estar vacío y es el formato auditable del release.

#### Scenario: Release reconstruible

- **WHEN** se pide la evidencia de un release
- **THEN** los receipts reconstruyen qué se verificó, con qué resultado y quién lo firmó

### Requirement: Pipeline de gates con patrones GitOps (ArgoCD)

El sistema SHALL ordenar gates como sync waves (infra/CRDs primero, app después), con hooks PreSync (verificación previa), Sync y PostSync (validación posterior + deletion policies); `ignoreDifferences` como baseline conocida (lo conocido no bloquea, lo nuevo sí — mismo patrón que el baseline de Schemathesis); health assessment como veredicto de liveness; App of Apps para gobernar fleets. Gap registrado: el cap. CI del libro venía ausente en early release — no inventar su contenido.

#### Scenario: Infra verifica primero

- **WHEN** un deploy incluye infra + app
- **THEN** la wave de infra pasa su gate antes de que la app se toque

#### Scenario: Baseline conocida no bloquea

- **WHEN** el diff coincide con `ignoreDifferences`/baseline registrada
- **THEN** no bloquea; si es nuevo, bloquea o entra al baseline como cambio conocido

### Requirement: Pre-flight K8s — cada fallo del troubleshooting guide es un gate

El sistema SHALL convertir el catálogo de fallos (Ultimate K8s Troubleshooting Guide) en gates pre-deploy: requests/limits presentes y cuerdos (Polaris/kube-linter, el "error más común"), probes definidas, imagen/secrets existentes, métrica del HPA existente, RBAC least-privilege + security contexts revisados en PR, quotas contra namespace, smoke de service discovery post-deploy (hook PostSync).

#### Scenario: Manifiesto sin probes no avanza

- **WHEN** un Deployment no declara liveness/readiness
- **THEN** el gate lo frena con el capítulo del guide que ese fallo produce

### Requirement: Pre-flight en capas con un owner por hallazgo (matrices kubernetes.qa)

El sistema SHALL ordenar el pre-flight en capas: kubeconform primero (schema + CRDs; kubeval deprecated, prohibido en pipelines nuevos) → kube-score (PR gate best-practice: probes, limits, securityContext) → Trivy (imágenes + misconfig + secrets + SBOM) → Checkov (policy cross-IaC) + kubeaudit (auditoría security-only estrecha); Kubescape para posture multi-framework (NSA/CISA, MITRE, CIS, SOC2) + RBAC; kube-bench para CIS authoritative en nodos (Job); kube-hunter excluido del pipeline (unmaintained 2022, solo labs). Regla anti-duplicados: un owner por tipo de hallazgo + un solo esquema de severidad. Trivy default OSS; Snyk (Code SAST + fix PRs) solo si se usa su workflow dev.

#### Scenario: Capas sin doble-reporte

- **WHEN** kube-score y Trivy flaggean el mismo securityContext
- **THEN** solo el owner configurado reporta; el otro silencia la regla duplicada

### Requirement: Gates con contrato de salida y thresholds por env (patrón kubeqa gates)

El sistema SHALL implementar gates con exit codes (0 pass / 1 fail / 2 warnings-only), thresholds de severidad por ambiente (dev: critical, prod: warning), rollout audit-first (baseline, luego tighten progresivo), 5 capas (manifest, image, policy YAML sin Rego, compliance pre-check CIS, diff contra lo corriendo) y pares admission (Kyverno/Gatekeeper) como backstop, no como único gate.

#### Scenario: Prod más estricto que dev sin duplicar config

- **WHEN** el mismo gate corre en dev y prod
- **THEN** prod falla en warning y dev solo en critical, con overrides por namespace versionados
