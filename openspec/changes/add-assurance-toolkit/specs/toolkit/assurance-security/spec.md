# Spec Delta — toolkit/assurance-security

## Purpose

Transversal security con runner propio del assurance-toolkit: pentesting y triage de hallazgos con cadencia y veredictos separados del testing funcional.

## ADDED Requirements

### Requirement: Pentest con cadencia propia y reporte separado

El sistema SHALL proveer `pentest-runner` y `pentest-playbook-setup` desde `assurance-toolkit` (shims en el toolkit viejo), con cadencia por release (no por PR) y reporte de seguridad separado del de tests.

#### Scenario: Release exige veredicto de seguridad separado

- **WHEN** se evalúa un release
- **THEN** se requieren dos veredictos independientes (tests + seguridad); ninguno sustituye al otro

### Requirement: Triage de hallazgos de seguridad con SLA

El sistema SHALL proveer `triage-security-findings` con flujo cola → dueño → SLA → receipt operado por el dueño de seguridad.

#### Scenario: Hallazgo con SLA vencido escala

- **WHEN** un hallazgo supera su SLA sin remediación
- **THEN** el sistema lo marca escalado y lo vincula a su issue Linear sin duplicarlo

### Requirement: Trazabilidad MASVS → MASWE → MASTG en pentest móvil

El sistema SHALL mapear cada hallazgo móvil a control MASVS vía debilidad MASWE y test atómico MASTG (IDs estables, 285 tests / 152 demos en MASTG v2), con perfil según threat model (MAS-L1 baseline, MAS-L2 datos sensibles, MAS-R resiliencia anti-tamper, MAS-P privacidad) y guía de fix vía MASTG-BEST. Este es el modelo de trazabilidad para los receipts.

#### Scenario: Hallazgo trazable de punta a punta

- **WHEN** el pentest reporta un hallazgo
- **THEN** incluye IDs MASVS/MASWE/MASTG y perfil aplicable, o queda marcado como no-mapeado

### Requirement: Capa automatizada SAST/DAST/SCA

El sistema SHALL correr escaneo automatizado antes del pentest manual: SAST (Semgrep), DAST (OWASP ZAP), SCA sobre el SBOM (Trivy/Grype, Dependency-Track) más dependency-review en PR. Críticas bloquean; el resto va a triage con SLA.

#### Scenario: CVE alta en dependencia transitiva

- **WHEN** el escaneo del SBOM encuentra CVE high/critical
- **THEN** el gate falla hasta remediación o excepción aprobada con expiración

### Requirement: Supply-chain baseline firmada y verificada en admission

El sistema SHALL exigir por artefacto desplegable: SBOM canónico (CycloneDX o SPDX), firma keyless Sigstore/cosign, proveniencia SLSA (L2 en Actions, L3 vía slsa-github-generator) y verificación fail-closed en admission (Kyverno/policy-controller). Generar sin gates es dashboard, no control.

#### Scenario: Artefacto sin firma no corre

- **WHEN** un deploy presenta imagen sin firma o proveniencia válida
- **THEN** admission lo rechaza y el evento queda auditado
