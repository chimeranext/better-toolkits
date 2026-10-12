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
