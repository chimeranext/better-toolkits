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

### Requirement: Red-team agentic con OWASP ASI01–ASI10 + LLM02

El sistema SHALL evaluar apps agénticas contra OWASP Top 10 Agentic 2026 (ASI01 Goal Hijack, ASI02 Tool Misuse, ASI03 Identity Abuse, ASI04 Supply Chain incl. MCPs comprometidos, ASI05 Code Exec, ASI06 Memory Poison, ASI07 Inter-Agent Comms, ASI08 Cascading Failures, ASI09 Human-Agent Trust, ASI10 Rogue Agents) más LLM02 PII cross-cutting. Método en 4 fases: Build → Audit (scenario maps por ASI) → Define controls → Monitor & iterate; prioridades Foundation (ASI01/02/PII) → Coverage (métricas + audit trail) → Depth (custom) → Extension (GDPR/EU AI Act como policies). Defensas en capas (gateway heurístico, guardrails SLM context-aware en línea, controles de salida); SoD (quien codea el agente no define sus policies); gateway + code layer. Training-data alignment: cada escenario OWASP mapea a datos de detección; validar con suites OWASP-aligned, no benchmarks genéricos.

#### Scenario: Cobertura completa, no solo prompt injection

- **WHEN** un agente entra en scope
- **THEN** el audit cubre ASI01–ASI10 con scenario maps (2–3/10 es el gap documentado, no el objetivo)

#### Scenario: Tool scoping frena exfiltración legítima

- **WHEN** un tool acepta parámetros de alcance (segmentos, tenants, regiones)
- **THEN** la policy de mínimo alcance bloquea bulk queries aunque el permiso exista

#### Scenario: Agent graph auditable

- **WHEN** ocurre un tool call, planning step o mensaje inter-agente
- **THEN** queda en el agent graph con detección de patrones anómalos (volúmenes, secuencias de escalación)

#### Scenario: PII tolerancia cero

- **WHEN** un output contiene PII contextual (nombre + actividad + ubicación sin campo sensible aislado)
- **THEN** el gate lo detecta (regex no basta) antes de que salga del agente

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

### Requirement: Supply-chain móvil sin fuente (modelo REA)

El sistema SHALL verificar artefactos móviles sin código fuente: apps Flutter por snapshot hash de Dart, digests por ABI y proveniencia del engine (parseo estático del APK); APKs por manifest, clases y métodos decompilados (JADX); firmware/EVM/WASM según aplique. Todo hallazgo se reporta con evidencia + limitaciones explícitas (qué se inspeccionó, qué no), mismo formato que los receipts.

#### Scenario: APK verificado sin fuente

- **WHEN** llega un APK release sin acceso al repo
- **THEN** se verifica snapshot hash, engine build y superficie (permisos, clases) contra el baseline firmado, con limitaciones declaradas

### Requirement: Runtime K8s — detectar vs prevenir (Falco / KubeArmor / Tetragon)

El sistema SHALL separar runtime en dos capas: detección cluster-wide con Falco (eBPF, ruleset comunitario, graduado CNCF → alimenta triage/SIEM) y prevención inline en workloads de alto valor con KubeArmor (LSM least-permissive, sandbox CNCF) o Tetragon (eBPF nativo con sinergia Cilium, syscall kill/block). Regla: Falco detecta y alerta, KubeArmor/Tetragon bloquean; no dos motores de enforcement sin scopear (audit mode antes de block; un owner por workload).

#### Scenario: Detección alimenta prevención

- **WHEN** Falco alerta un comportamiento anómalo recurrente
- **THEN** la alerta genera propuesta de policy KubeArmor/Tetragon en audit mode antes de enforce

### Requirement: Policy engines con matriz de decisión (Kyverno / OPA Gatekeeper)

El sistema SHALL elegir motor de admission por matriz: Kyverno (YAML declarativo, mutate/generate nativo, verificación de imágenes, solo K8s — default para equipos K8s-native) vs OPA Gatekeeper (Rego, reuso cross-platform en APIs/Terraform/CI, lógica programática compleja). Split válido: Kyverno in-cluster + OPA standalone fuera. Rollout siempre audit-first; admission es backstop, no el único gate (pair con CI-stage scanning).

#### Scenario: Policy bloquea en admission con causa

- **WHEN** un manifest viola policy en enforce
- **THEN** admission lo rechaza con la policy y severidad responsables, y el evento entra al audit trail
