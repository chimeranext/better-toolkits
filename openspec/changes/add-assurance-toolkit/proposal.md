# Proposal — add-assurance-toolkit

Change ID: `add-assurance-toolkit`

## Why

Quality-evidence commands (e2e, pentest, observability, triage) currently live inside `make-no-mistakes-toolkit`, whose owner is the dev *process* correction (sync/merge/implement/handover). Mixing process with evidence confuses gates, owners, and cadences — a quarterly pentest does not run at PR pace, and a per-PR E2E does not decide liveness. HabitaNexus (Qualflare + Maestro, Linear as SSOT) needs its own home for "evidence that it can ship". That is why `assurance-toolkit` exists: 2 pillars (testing, liveness) plus security as a transversal with its own runner, decision locked in session `ses_ef835f485ffemfd104kHL4w0b0` (HabitaNexus QA, Oct 2026).

## What Changes

- New toolkit `toolkits/assurance-toolkit/` with the SSOT protocol under `references/` plus thin entries under `commands/` plus Cursor skills (existing multi-harness pattern).
- Migration from `make-no-mistakes-toolkit`:
  - `e2e-test-builder`, `e2e-test-runner`, and `e2e-test-preview` live only in assurance. Each keeps the protocol it had before the shim (`references/e2e-test-builder|runner|preview/protocol.md`). No shim in make-no-mistakes. The pillar `references/testing/e2e-protocol.md` does not replace them.
  - Shims for the rest that moved: `/assurance:pentest-runner`, `/assurance:pentest-playbook-setup`, `/assurance:observability-audit`. Security findings are mode `/assurance:triage security`, with no separate command and no shim.
  - Do not move: `/make-no-mistakes:ready-to-review-mergeable`, `premortem`, audits (`audit*`, `audit-engine`), coordination (`merge-advisor`, `rebase`, `sync-advisor`, `takeover-pr`, `handover*`), execution/rituals (`implement`, `bug-squash-locally`, `secret-*`, `standup*`, `postmortem`).
- `gemini-code-review` merges into `local-pr-review` as `--provider gemini` (shim with a deprecation warning, same precedent as `disk-cleanup`).
- Evidence providers: Kiwi TCMS (optional self-hosted pilot), Qase, Qualflare (plus `qualflare-maestro`, `qualflare-flutter`, `qf collect`), Maestro flows (`.maestro/*.yaml`, `Semantics(identifier:)` discipline), webhook broker → Linear with cluster dedupe.
- Polyglot testing pillar (same evidence protocol, runners per stack): Flutter/Dart by level (unit `flutter test` + mockito, widget `WidgetTester`, integration `integration_test` on device + Maestro YAML with `Semantics.identifier`), Laravel/Pest (`php artisan test`, `--parallel` with `brianium/paratest` + per-process DBs, `--coverage --min`, `--profile`, `tests/Architecture` suite with arch-testing, skill `pest-testing-laraveldaily`), Elixir/ExUnit (`mix test`, Phoenix/Ecto, property-based with PropEr/StreamData, mocks with Mox and explicit contracts), TypeScript 7 (`tsgo`, migration without `baseUrl`, no compiler API until 7.1 — classic in parallel or `oxc-parser` —, dual CI TS6+TS7, sharp-edge checklist).
- The toolkit is not closed to those stacks: it defines an agnostic adapter protocol (run → collect → link → cluster) and an E2E selection matrix (Maestro default mobile-first; Playwright web cross-browser multi-language; Cypress web with JS DX; Appium native with no code changes; Selenium only for legacy) plus JS unit (Vitest/Jest). The 4 stacks are the initial adapters; the rest goes to backlog with a mandatory prior PoC.
- External skills reinterpreted (not vendored): `testdino-hq/playwright-skill` (MIT — golden rules, flake taxonomy/quarantine, trust boundary, QA guides for case design and bug reports) and `mobile-next/mobilewright` (Apache-2.0 — Playwright-style mobile API, `screen`/`device` fixtures, `testResult` metadata); downloaded and read under `/tmp/opencode`, their content lives here as our own protocol with progressive disclosure.
- Testing P0 from deep research: mutation with MSI (Infection/Stryker/muex), contracts in two layers (Schemathesis first, Pact + `can-i-deploy` later), perf with thresholds (k6/Locust/Gatling/JMeter by language), Patrol grey + Maestro smoke, staged a11y (axe-core, Axe DevTools Mobile), visual + PBT.
- Web component testing via Storybook: CSF stories as portable units (render + play + a11y + visual + coverage + unit + E2E via iframe), Vitest addon default on Vite (real browser mode), test-runner where there is no Vite, tags that govern the suite.
- Flutter component testing via Widgetbook (mirror): frozen scenarios (fixed args + modes + `run`), global matrix theme × locale × text-scale × device, goldens with a fixed environment, 4 a11y guidelines per cell + semantics diff, tokens as the cheapest fix. Legal context: EAA applies from Jun 2025 (EN 301 549 / WCAG AA) for e-commerce, banking, e-books, transport, and telecom in the EU.
- Security from research: MASVS → MASWE → MASTG v2 traceability with L1/L2/R/P profiles, SAST/DAST/SCA layer, signed supply chain (SBOM, Sigstore, SLSA, fail-closed admission).
- Liveness + governance: chaos with an SLO hypothesis and abort (Litmus vs Chaos Mesh still to decide; Antithesis under evaluation), perf baselines → SLOs, and a new capability `toolkit/assurance-governance` (DORA/DER/MTTD, per-stage gates, phase-7 receipts); K8s pre-flight (every troubleshooting-guide failure is a gate), diagnostic playbook + runbooks with pattern-IDs (MDAA/Sysinternals, fractional-cto taxonomy 08/09), mobile supply chain without source (REA model: snapshot hash, engine provenance, evidence + limitations).
- Migration of 21 skills from `flutter-boilerplate-monorepo-template/skills` (6 flutter + 11 SRE + argocd + github-actions + static-analysis + universal versioning) reinterpreted into the protocol + thin skills, with shims in the template (BSL-1.1, same org).
- K8s matrices (kubernetes.qa, 11 comparisons + gates/chaos/health): layered pre-flight stack (kubeconform → kube-score → Trivy → Checkov/kubeaudit; Kubescape posture+RBAC; kube-bench CIS; kubeval/kube-hunter excluded), policy engines (Kyverno vs Gatekeeper), runtime detect-vs-prevent (Falco + KubeArmor/Tetragon), gates with exit codes and per-env thresholds, 8D health score, chaos with a resilience score.
- Toolkit boundary: OpenSpec + Linear as the shared SSOT — assurance writes evidence (runs, clusters, links), the dev workflow consumes it in gates. Slot `transversals/receipts/` is reserved but empty (phase 7 of plan 08-02).
- **BREAKING**: none in this change (shims + docs only; shim deletion in a later minor).

## Capabilities

### New Capabilities

- `toolkit/assurance-testing`: testing pillar — build/run/preview E2E (including Maestro), collect results (flutter test JSON → `qf collect`), Kiwi/Qase/Qualflare providers with `qualflare.link` to issues, failure clustering with owner/SLA on the testing side; per-stack runners under the same evidence protocol: Laravel/Pest, Elixir/ExUnit, TypeScript 7 (`tsgo`); eval-driven development for LLM features (criteria, calibrated judges); risk-driven suites with self-testing (Fowler).
- `toolkit/assurance-liveness`: liveness pillar — `/assurance:observability-audit` plus the ladder (probe/heartbeat/absence/synthetic), readiness signals, always running (not per PR).
- `toolkit/assurance-security`: security transversal with its own runner — `/assurance:pentest-runner` (per-release cadence), `/assurance:pentest-playbook-setup`, mode `/assurance:triage security` (finding SLA); security reports never mixed with test reports; each release requires separate verdicts; MASVS → MASWE → MASTG traceability, SAST/DAST/SCA layer, signed supply chain with fail-closed admission; agentic red team OWASP ASI01–ASI10 + LLM02 in 4 phases with SoD.
- `toolkit/assurance-governance`: evidence governance — outcome-based metrics (DORA, DER/DRE, MTTD/MTTR, flaky rate, anti-gaming), per-stage gates (commit/PR/release) and traceable phase-7 receipts; gate pipeline with GitOps patterns (waves, Pre/PostSync hooks, baselines, health).

### Modified Capabilities

- (empty — no prior specs to change; `make-no-mistakes-toolkit` keeps its commands via shims in this change)

## Impact

- Affects: `toolkits/assurance-toolkit/` (new), `toolkits/make-no-mistakes-toolkit/commands/` + `references/` (shims for pentest and observability plus `gemini-code-review`; the three `e2e-test-*` commands and findings triage have no separate command), `.claude-plugin/marketplace.json` plus plugin manifests (versions), marketplace docs.
- Systems: Qualflare / Qase / Kiwi TCMS, Maestro, Linear (issues + webhook broker), repo-local OpenSpec store; stacks covered: Flutter/Dart, Laravel/PHP (Pest/PHPUnit), Elixir (ExUnit/Phoenix/Ecto), TypeScript 7 (`tsgo`).
- Non-goals: do not implement providers or the webhook broker here (protocol only); do not delete the pentest or observability shims; do not touch `premortem`; do not create a new repo for Kiwi (PRs to `mcp-kiwi-tcms`); do not pin `qualflare-maestro` / `tsgo` versions (pinned at apply).
- Verifiable success: `openspec validate --change add-assurance-toolkit` passes; builder, runner, and preview each resolve their own protocol in assurance; the other moved commands that still have shims keep them; `assurance-toolkit` lists 2 pillars plus the transversal in its README/protocol.
