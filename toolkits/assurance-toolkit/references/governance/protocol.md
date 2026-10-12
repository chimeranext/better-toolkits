# Gobierno — protocol SSOT

No tiene comandos de ejecución: define cómo se mide, qué bloquea y qué queda como evidencia.
Full behavior contract: `openspec/changes/add-assurance-toolkit/specs/toolkit/assurance-governance/spec.md`.

## Métricas (outcomes, no actividad)

DORA (frequency, lead time, change fail rate, failed deployment recovery time, rework rate)
+ DER/DRE, MTTD/MTTR, flaky rate. Join vía `found_env` + `commit_sha`; atribución 14 días;
`unattributed` como señal. Anti-gaming: ratios, tendencias, sin targets individuales (Goodhart);
cobertura como diagnóstico.

## Gates por etapa

- **commit**: lint, unit, coverage del cambio.
- **PR**: tests 100%, security críticas 0, `coverage_delta` ≥ 0.
- **release**: e2e pass, p95, DER bajo umbral, `can-i-deploy` donde aplique.
Barato y rápido primero. Flaky = defecto (cuarentena, fix o remove).

## Receipts (fase 7)

Un receipt por veredicto: qué corrió, dónde, contra qué baseline, con qué IDs
(Linear, MASWE/MASTG, contrato). Formato auditable del release.

## Migrated skills (flutter-boilerplate-monorepo-template, reinterpretados)

- **sre-slo-sli-sla**: SLOs, error budgets, MTTD/MTTR (SRE workbook); alimenta métricas outcome-based.
- **cicd-argocd**: GitOps sync como gate (waves/hooks/health) — ver requirement GitOps.
- **cicd-github-actions**: wiring de gates en CI (workflows de testing → deploy).
- **sre-logging-log-aggregation**: Loki/ES/Fluentd, structured logs como evidencia adjunta a receipts.
- **versioning-management**: SemVer + conventional commits UNIVERSALES (todo repo, no solo Flutter): commitlint en pre-push/CI, releases con release-please/semantic-release, changelog generado del historial; linkage versión↔evidencia en cada receipt. Misma disciplina que el versionado del marketplace (root `marketplace.json` + `plugin.json` juntos).
- **sre-alerting-incident-management (gobierno)**: SLA timers y breach alerts como métricas del dashboard.

## Pipeline GitOps + pre-flight K8s

Waves (infra primero), hooks Pre/PostSync, `ignoreDifferences` como baseline, health
assessment, App of Apps. Pre-flight: cada fallo del troubleshooting guide es un gate
(probes, requests/limits, RBAC, quotas, HPA con métrica, smoke post-deploy).
