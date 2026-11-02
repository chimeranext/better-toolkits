# Transversal security — protocol SSOT

Harness-agnostic body. Thin entries: `commands/triage.md` (mode `security`
runs [`findings-protocol.md`](findings-protocol.md)),
`commands/pentest-runner.md`, `commands/pentest-playbook-setup.md`.
PR-stage hub:
[`references/triage/protocol.md`](../triage/protocol.md); security PR gate:
[`triage.md`](triage.md).
Full behavior contract: `openspec/changes/add-assurance-toolkit/specs/toolkit/assurance-security/spec.md`.

## Principle

Is it secure? Own cadence (pentest per release, triage per SLA), own runner,
reports never mixed with tests. Each release requires separate verdicts.

## Components

- **pentest-runner**: authorized execution (Kill Chain + OWASP). Triage pattern shared
  with testing (queue → owner → SLA → receipt), different owners.
- **pentest-playbook-setup**: audit/sync of playbook ↔ CI ↔ tenant config (only JSON in sync).
- **`/assurance:triage security`**: findings → owned backlog, no duplicate issues (dedupe by signature). See [`findings-protocol.md`](findings-protocol.md).
- **MASVS → MASWE → MASTG v2 traceability**: each mobile finding with stable IDs and profile
  (MAS-L1/L2/R/P) per threat model; fix via MASTG-BEST. Model for receipts.
- **Automated pre-layer**: Semgrep (SAST), ZAP (DAST), Trivy/Grype + Dependency-Track
  (SCA over SBOM), dependency-review on PR. Criticals block.
- **Supply-chain**: canonical SBOM (CycloneDX/SPDX) per build + continuous scanning, keyless signing
  Sigstore/cosign, SLSA provenance (L2/L3), fail-closed admission (Kyverno).
  Generating without gates is dashboard, not control.

## Migrated skills (flutter-boilerplate-monorepo-template, reinterpreted)

- **flutter-security**: certificate pinning, secure storage, obfuscation, biometrics, root/jailbreak detection → maps to mobile MASVS.
- **sre-security-compliance-automation**: OPA policy-as-code, CIS benchmarks, continuous vulnerability scanning.
- **sre-container-security**: image scanning + signing (notary/cosign), Falco runtime, CVE → supply-chain.
- **sre-network-policies-security**: Calico/Cilium, egress/ingress as verifiable controls in gates.
- **static-analysis**: multi-language lint as an SAST gate (dart-analyze, ruff, golangci-lint, eslint, shellcheck, clippy, super-linter).

## Red-team agentic (OWASP ASI01–ASI10 + LLM02)

Method in 4 phases (Build → Audit with scenario maps → Define controls → Monitor & iterate);
priorities Foundation (ASI01/02/PII) → Coverage → Depth → Extension.
Layered defenses, SoD, gateway + code layer. Training-data alignment with
OWASP-aligned suites. Zero-tolerance PII (contextual detectors, tenant-scoped SQL).

## Source-less mobile supply-chain (REA model)

Flutter via snapshot hash + engine provenance (static APK parsing); APKs via
decompiled manifest/classes (JADX). Every finding with evidence + explicit limitations,
same format as receipts.

## Runtime K8s: detect vs prevent + policy engines

- **Falco** (detect/alert, graduated) cluster-wide → triage/SIEM; **KubeArmor** (LSM)
  or **Tetragon** (eBPF, Cilium synergy) on high-value workloads. Audit-first.
- **Kyverno** default K8s (YAML, mutate/generate, image verification) vs **Gatekeeper**
  (Rego, cross-platform reuse). Admission = backstop, pair with CI-stage scanning.

## Traceability + layered defense

```mermaid
flowchart LR
    C[MASVS control] --> W[MASWE weakness]
    W --> T[atomic MASTG-TEST]
    T --> V[release verdict: tests + security separately]
    subgraph defense [4 capas agentic]
    G[heuristic gateway] --> S[inline SLM guardrails]
    S --> O[controles de salida]
    O --> M[monitor + audit trail]
    end
```

## Runtime/component day-zero RCE — pattern class (enriches `scan-security`)

The `scan-security` check is not scoped to any single language. It encodes the
recurring **class** of event in which an unauthenticated RCE lands in a runtime,
library, or appliance — and the exposure is in *which binary serves this*, not in
the application inventory. The sequence is stable since 2021 (names change, the
pattern does not):

| Event | Component | Lesson |
| --- | --- | --- |
| Log4Shell (2021) | Java logging lib | the vulnerable component is inside other things, not in the inventory |
| Spring4Shell (2022) | Spring Framework | the disclosure calendar is not yours to control |
| MOVEit Transfer (2023) | managed file transfer | one exposed internet-facing system is enough; the attacker had the list |
| Citrix Bleed (2023) | NetScaler ADC/Gateway | patching is not eviction; stolen sessions survive the patch |
| Ivanti Connect Secure (2024) | VPN appliance | interim mitigations and verification matter as much as the fix |
| regreSSHion (2024) | OpenSSH/glibc | version fingerprinting is the first filter, never the verdict |
| PHP2Shell (2026) | PHP runtime | all of the above at once (leak → tooling → fix → KEV in 6 days; 65% exposed a week later) |

Four constants across every row:

- The bug lives in the runtime/library, not the application; asset discovery must
  be **outside-in** (internet-reachable), not CMDB-first.
- Exploitation starts before the fix ships; the fix is only the beginning.
- What a system says about itself is unreliable: version headers lie, backports
  keep old version strings, catch-all routes answer every probe — so
  fingerprinting is a filter, never a verdict; validate behaviorally.
- The long tail is where the breach happens: staging hosts, forgotten admin
  panels, acquired applications.

Sources (examples of the class, not an exhaustive stack list):
- Pattern/evidence: https://firecompass.com/php2shell-not-first-next-one-already-someones-queue/ (series table + day-zero programme)
- Rust secure-coding (ANSSI): https://github.com/anssi-fr/rust-guide/ · https://messervices.cyber.gouv.fr/documents-guides/anssi-guide-programming_rules_to_develop_secure_applications_with_rust-v1.0.pdf
- PHP2Shell (most recent instance): https://www.php.net/archive/2026.php#2026-10-23-1 · https://www.php2shell.com/#upgrade-php · https://www.wiz.io/blog/php2shell-php-rce · https://www.akamai.com/blog/security-research/understanding-php2shell-everything-you-need-to-know · https://medium.com/@seiferboado101/hunting-php2shell-a-practical-guide-for-soc-and-dfir-teams-e092c540afa1 · https://docs.rapid7.com/nexpose/php2shell/ · https://www.focusedhunts.com/blog/hunting/php2shell-Critical-PHP-RCE-Hunting-Guide · https://www.legacyleap.ai/blog/php2shell-php-8-1-end-of-life/

## References

- MASVS/MASTG/MASWE: https://mas.owasp.org/MASVS/ · https://mas.owasp.org/MASTG/ (v2: 285 tests, 152 demos)
- OWASP Agentic AI: Galileo `Operationalizing the OWASP Top 10 for Agentic AI` (local PDF, Apr-2026) — ASI01–ASI10, control plane, SoD, 4 phases
- Supply chain: https://slsa.dev/ · Sigstore/cosign · SBOM CycloneDX/SPDX
- Scanners: Trivy/Grype, Semgrep, OWASP ZAP, Kubescape, Checkov
- Runtime: Falco (graduated) + KubeArmor (LSM) / Tetragon (eBPF) — see kubernetes.qa matrices
- Mobile REA: https://github.com/morluto/rea (MIT) — source-less APK/Flutter, evidence + limitations
