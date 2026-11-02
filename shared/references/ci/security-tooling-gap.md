# Security tooling — decision record & gap analysis (SSOT)

Status: **approved** (Nov-2026). Sources: official vendor docs fetched at decision
time (see `ci-checks.yml` → `check_references.scan-security.sources`).

## Decision: vendorize OSS first, keep commercial candidates mapped

The `scan-security` family of checks uses a **two-layer model**:

1. **Skills-specific gate (unique)** — SkillSpector (`scan-security`/`scan-static`),
   no equivalent among mainstream scanners; keep as the ownership layer.
2. **Runtime/cloud/container/SCA layer** — delegated to mature tools, mapped
   below. **OSS first; commercial recommended where the OSS ceiling is real.**

## Tool matrix (verified)

| Tool | License/model | Best fit (phase 2) | Status |
| --- | --- | --- | --- |
| Trivy (Aqua) | Apache-2.0 | SBOM/SCA, container, fs, K8s — one binary | **Vendorize (core)** |
| Grype + Syft (Anchore) | Apache-2.0 | SBOM/SCA alt; EPSS/KEV scoring | vendorize (alt) |
| Checkov (Prisma) | Apache-2.0 | IaC + secrets (TF/CFN/K8s/Helm/Bicep/ARM) | **Vendorize (core)** |
| Semgrep CE | LGPL-2.1 | SAST guardrails, 30+ langs, custom rules | **Vendorize (core)** |
| SonarQube (Developer/Enterprise) | Commercial | Taint SAST + governance/compliance | evaluate if taint/quality-gate needed |
| Snyk | Commercial (credits) | Unified platform + DAST + AI pentesting (Evo COS) | evaluate |
| Wiz | Commercial (CNAPP) | Cloud+AI runtime, attack path, graph | evaluate at cloud/AI production |
| Clair | Apache-2.0 | legacy container-only scanner | not preferred (Trivy supersedes) |

## Gaps mapped to checks

| Check | Tool | Note |
| --- | --- | --- |
| `audit-supply-dependencies` | Trivy / Grype | SBOM+KEV/EPSS; OSS |
| `verify-sbom-manifest` | Trivy / Grype+Syft | CycloneDX/SPDX emit |
| `scan-container-images` (opt-in) | Trivy | single binary, k8s-aware |
| `scan-iac-config` (opt-in) | Checkov | 1,000+ policies |
| `scan-static` | Semgrep CE (base), + Semgrep AppSec/SonarQube Dev+ | taint real only in commercial tier |
| `guard-secrets-repo` | Gitleaks / Trivy secrets / Checkov secrets | covered |

## Gap no tool covers

Day-zero **runtime RCE exposure validation** (FireCompass pattern class, 2021-2026:
Log4Shell→php2Shell). No mainstream scanner validates behavioral exposure on
runtime/component level → kept as **our own** `scan-security` capability (see
`assurance-toolkit/references/security/protocol.md` → "Runtime/component day-zero
RCE — pattern class").

## Non-goals

- Not re-implementing scanners (no reinventing the wheel).
- Only vendorize tooling that exists and has CI-friendly (CLI/SARIF) interface.
