# Tasks — add-assurance-toolkit

## 1. Toolkit scaffold

- [x] 1.1 Create `toolkits/assurance-toolkit/` (plugin manifest, README with 2 pillars plus transversal, `references/`, thin `commands/`, skills) and verify the layout mirrors `make-no-mistakes-toolkit`
- [x] 1.2 Register the toolkit in `.claude-plugin/marketplace.json` (plus version) and verify the marketplace lists `assurance-toolkit`

## 2. Protocol migration with shims

- [x] 2.1 Move `/assurance:e2e-test-builder`, `/assurance:e2e-test-runner`, and `/assurance:e2e-test-preview` to assurance, each with its own protocol (`references/e2e-test-*/protocol.md`). Shims in make-no-mistakes removed; the pillar `references/testing/e2e-protocol.md` does not replace those three protocols.
- [x] 2.2 Move `/assurance:pentest-runner` plus `/assurance:pentest-playbook-setup` with shims; verify delegation with a warning and a report separate from tests
- [x] 2.3 Move `/assurance:observability-audit` (probe/heartbeat/absence/synthetic ladder) with a shim; verify it distinguishes "passes" from "stopped passing"
- [x] 2.4 Security findings (queue → owner → SLA → receipt) live in mode `/assurance:triage security` (`references/security/findings-protocol.md`). No separate command and no shim.
- [x] 2.5 Merge `gemini-code-review` into `local-pr-review --provider gemini` plus a shim with a warning; verify the old shim delegates

## 3. Provider protocol plus Maestro (docs only)

- [x] 3.1 Document Kiwi/Qase/Qualflare providers (`qf collect`, `qualflare.link`, webhook with cluster dedupe) under `references/` and verify the documented commands exist as protocol (do not implement the broker)
- [x] 3.2 Document the Maestro convention (`.maestro/*.yaml`, `Semantics(identifier:)`, pinned `qualflare-maestro`, Studio) and verify the example flow `negotiation_happy_path.yaml` as the reference

## 4. Polyglot runner protocol (docs only)

- [x] 4.1 Document the Laravel/Pest runner (`php artisan test`, `--parallel` plus per-token DBs, `--coverage --min`, `--profile`, `tests/Architecture` suite, skill `pest-testing-laraveldaily`) and verify the protocol against a sample Laravel app
- [x] 4.2 Document the Elixir/ExUnit runner (`mix test`, Phoenix/Ecto, PropEr/StreamData, Mox with explicit contracts) and verify the protocol against a sample project
- [x] 4.3 Document the TS7 checklist (`tsgo`, no `baseUrl`, compiler API plan, dual CI, sharp edges) and verify it against a sample TypeScript package
- [x] 4.4 Document the Flutter/Dart pyramid (unit `flutter test` plus mockito, widget `WidgetTester`, `integration_test` plus Maestro with `Semantics.identifier`, legacy `flutter_driver`, refs `gallery`/`manual_tests`) and verify it against a sample Flutter package
- [x] 4.5 Document the landscape annex (Maestro/Playwright/Cypress/Appium/Selenium plus Vitest/Jest matrix, platform/language/skill/cost criteria) and the adapter backlog with a mandatory PoC; verify that adding an adapter does not touch the protocol
- [x] 4.6 Document the Playwright adapter (golden rules, flake taxonomy plus flowchart, quarantine with an exit and `@critical` exemption, trust boundary, UI mode `npx playwright test --ui`, trace.zip as evidence) reinterpreted from the TestDino skill; verify golden rules against a sample web suite
- [x] 4.7 Run the MobileWright PoC (one iOS+Android spec, `testResult` metadata → evidence) and decide whether it shares the mobile-first default with Maestro; verify the a11y tree is enough without a vision model

## 5. Testing P0 from research (docs plus gates only)

- [x] 5.1 Document mutation (Infection/Stryker/muex, MSI as a gate, incremental scope) and verify MSI against a sample suite
- [x] 5.2 Document contracts in two layers (Schemathesis plus baseline, Pact plus `can-i-deploy`, Microcks/Prism) and verify spec drift against a sample API
- [x] 5.3 Document perf (k6/Locust/Gatling/JMeter matrix, thresholds → exit code, percentiles into SLOs) and verify a sample p99 gate
- [x] 5.4 Document Patrol grey plus Maestro smoke (CI caveat, version pin, fixed device OS) and staged a11y (axe-core, Axe DevTools Mobile, fail critical/serious) and verify against a sample Flutter app
- [x] 5.5 Document component testing with portable stories (play plus role-first queries, Vitest addon vs test-runner, a11y error/todo/off, tags) and verify one story running in Vitest plus a11y plus E2E iframe
- [x] 5.6 Document Widgetbook scenarios (fixed args plus modes plus `run`, global matrix, goldens with a fixed environment, 4 guidelines plus semantics diff, tokens as the cheapest fix) and verify one scenario on the theme × locale × text-scale matrix
- [x] 5.7 Document eval-driven development (criteria, calibrated judges, benchmark hygiene, conversational feedback) and risk-driven suites plus characterization tests (Fowler) and verify measurable criteria on a sample LLM feature

## 6. Security from research (docs plus gates only)

- [x] 6.1 Document MASVS → MASWE → MASTG v2 traceability with L1/L2/R/P profiles and the MASTG-BEST fix guide; verify a sample finding mapped end to end
- [x] 6.2 Document the SAST/DAST/SCA layer (Semgrep, ZAP, Trivy/Grype, dependency-review) and the signed supply chain (canonical SBOM, Sigstore, SLSA L2/L3, fail-closed admission); verify an unsigned deploy is rejected on a test cluster
- [x] 6.3 Document the agentic red team (ASI01–ASI10 plus LLM02, 4 phases, SoD, tool scoping, agent graph, zero PII tolerance) and verify versioned scenario maps for a sample agent
- [x] 6.4 Document K8s runtime (Falco detect plus KubeArmor/Tetragon prevent, decision matrix) and policy engines (Kyverno vs Gatekeeper, audit-first) and verify audit mode before enforce

## 7. Liveness and governance (docs plus gates only)

- [x] 7.1 Decide Litmus vs Chaos Mesh with a PoC (SLO hypothesis, probes, abort criteria) and evaluate Antithesis for stateful systems; verify an experiment with an objective verdict
- [x] 7.2 Document metrics (DORA, DER/DRE, MTTD/MTTR, `found_env`, 14-day window, anti-gaming), per-stage gates, and the phase-7 receipt format; verify a release is reconstructable from receipts
- [x] 7.3 Document the GitOps gate pipeline (waves, Pre/PostSync hooks, `ignoreDifferences` as baseline, health assessment, App of Apps) and verify infra-first order on a sample deploy
- [x] 7.4 Document layered pre-flight (kubeconform → kube-score → Trivy → Checkov/kubeaudit; Kubescape/RBAC; kube-bench CIS), gates with exit codes and per-env thresholds, and the 8D health score; verify the stack does not double-report

## 9. Migration of 21 template skills (executed with shims)

- [x] 9.1 Migrate 6 flutter skills (testing-strategy, mobile-testing, accessibility, performance → testing; error-tracking → liveness; security → security) with thin skills plus protocol plus shim
- [x] 9.2 Migrate 7 SRE testing/liveness skills (load, observability, alerting, logging, chaos, db-part, DR-part) with thin skills plus protocol plus shim
- [x] 9.3 Migrate 4 SRE security+governance skills (sec-compliance, container, network, slo) with thin skills plus protocol plus shim
- [x] 9.4 Migrate the remaining 4 (argocd, github-actions, static-analysis, universal versioning SemVer+commits) with thin skills plus protocol plus shim
- [x] 9.5 Verify 21 shims in the template and a compatible license (BSL-1.1, same org)
- [x] 9.6 Validate the change plus PR in both repos (better-toolkits and monorepo-template) with HITL and merge
- [x] 9.7 Document in the protocol: eval-driven plus Fowler (testing), agentic red team plus mobile REA (security), GitOps plus K8s pre-flight (governance), playbook/runbook taxonomy (liveness) — implemented and verified in files

## 8. Validation and integration

- [x] 8.1 Pass `openspec validate --change add-assurance-toolkit` and verify zero errors
- [x] 8.2 Verify that `/make-no-mistakes:ready-to-review-mergeable`, `premortem`, audits, and coordination commands stay in `make-no-mistakes-toolkit` without shims
- [x] 8.3 Open a PR with HITL (no direct push to shared state) and verify CI is green before asking for review
