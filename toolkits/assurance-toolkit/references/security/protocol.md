# Transversal security — protocol SSOT

Harness-agnostic body. Thin entries: `commands/pentest-runner.md`,
`commands/pentest-playbook-setup.md`, `commands/triage-security-findings.md`.
Full behavior contract: `openspec/changes/add-assurance-toolkit/specs/toolkit/assurance-security/spec.md`.

## Principio

¿Es seguro? Cadencia propia (pentest por release, triage por SLA), runner propio,
reportes nunca mezclados con tests. Cada release exige veredictos separados.

## Componentes

- **pentest-runner**: ejecución autorizada (Kill Chain + OWASP). Patrón triage compartido
  con testing (cola → dueño → SLA → receipt), owners distintos.
- **pentest-playbook-setup**: audit/sync de playbook ↔ CI ↔ tenant config (solo JSON en sync).
- **triage-security-findings**: hallazgos → backlog owned, sin duplicar issues (dedupe por firma).
- **Trazabilidad MASVS → MASWE → MASTG v2**: cada hallazgo móvil con IDs estables y perfil
  (MAS-L1/L2/R/P) según threat model; fix vía MASTG-BEST. Modelo para los receipts.
- **Capa automatizada previa**: Semgrep (SAST), ZAP (DAST), Trivy/Grype + Dependency-Track
  (SCA sobre SBOM), dependency-review en PR. Críticas bloquean.
- **Supply-chain**: SBOM canónico (CycloneDX/SPDX) por build + escaneo continuo, firma keyless
  Sigstore/cosign, proveniencia SLSA (L2/L3), admission fail-closed (Kyverno).
  Generar sin gates es dashboard, no control.

## Migrated skills (flutter-boilerplate-monorepo-template, reinterpretados)

- **flutter-security**: certificate pinning, secure storage, obfuscation, biometría, root/jailbreak detection → mapea a MASVS móvil.
- **sre-security-compliance-automation**: OPA policy-as-code, CIS benchmarks, vulnerability scanning continuo.
- **sre-container-security**: image scanning + signing (notary/cosign), Falco runtime, CVE → supply-chain.
- **sre-network-policies-security**: Calico/Cilium, egress/ingress como controles verificables en gates.
- **static-analysis**: lint multi-lenguaje como gate SAST (dart-analyze, ruff, golangci-lint, eslint, shellcheck, clippy, super-linter).

## Red-team agentic (OWASP ASI01–ASI10 + LLM02)

Método en 4 fases (Build → Audit con scenario maps → Define controls → Monitor & iterate);
prioridades Foundation (ASI01/02/PII) → Coverage → Depth → Extension.
Defensas en capas, SoD, gateway + code layer. Training-data alignment con suites
OWASP-aligned. PII tolerancia cero (detectores contextuales, tenant-scoped SQL).

## Supply-chain móvil sin fuente (modelo REA)

Flutter por snapshot hash + engine provenance (parseo estático del APK); APKs por
manifest/clases decompiladas (JADX). Todo hallazgo con evidencia + limitaciones
explícitas, mismo formato que los receipts.

## Runtime K8s: detectar vs prevenir + policy engines

- **Falco** (detect/alert, graduado) cluster-wide → triage/SIEM; **KubeArmor** (LSM)
  o **Tetragon** (eBPF, sinergia Cilium) en workloads de alto valor. Audit-first.
- **Kyverno** default K8s (YAML, mutate/generate, image verification) vs **Gatekeeper**
  (Rego, reuso cross-platform). Admission = backstop, pair con CI-stage scanning.
