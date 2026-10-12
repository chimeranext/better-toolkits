# assurance-toolkit v0.1.0

Release-assurance evidence: 2 pillars + 1 transversal with its own runner + governance.

- **Pilar testing** (`references/testing/protocol.md`): e2e builder/runner/preview, polyglot runners
  (Flutter/Dart, Laravel/Pest, Elixir/ExUnit, TypeScript 7, Playwright web, MobileWright PoC),
  component testing (Storybook stories / Widgetbook scenarios), mutation (MSI), contracts
  (Schemathesis → Pact + `can-i-deploy`), perf thresholds, a11y, visual, PBT.
- **Pilar liveness** (`references/liveness/protocol.md`): `observability-audit` + escalera
  (probe/heartbeat/absence/synthetic), chaos con hipótesis SLO (Litmus vs Chaos Mesh a PoC),
  baselines de perf → SLOs. Corre siempre, no por PR.
- **Transversal security** (`references/security/protocol.md`): `pentest-runner` (cadencia por
  release), `pentest-playbook-setup`, `triage-security-findings` (SLA); trazabilidad
  MASVS → MASWE → MASTG v2; capa SAST/DAST/SCA; supply-chain firmada (SBOM, Sigstore, SLSA,
  admission fail-closed). Reportes nunca mezclados con tests.
- **Gobierno** (`references/governance/protocol.md`): DORA/DER/MTTD, gates por etapa
  (commit/PR/release), receipts trazables (fase 7).

Migrado desde `make-no-mistakes-toolkit` con shims (no rompe nada):
`e2e-test-builder`, `e2e-test-runner`, `e2e-test-preview`, `pentest-runner`,
`pentest-playbook-setup`, `observability-audit`, `triage-security-findings`.
No se mudan: `ready-to-review-mergeable`, `premortem`, audits, coordinación, rituales.
`gemini-code-review` → `local-pr-review --provider gemini` (shim; flag en mnm como follow-up).

SSOT de diseño: `openspec/changes/add-assurance-toolkit/` (specs por capability).
Frontera: assurance escribe evidencia (runs, clusters, links, receipts); el dev-workflow la consume en gates.
