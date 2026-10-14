# Spec Delta — toolkit/assurance-testing

## Purpose

Testing pillar of assurance-toolkit: build, run, and preview evidence (E2E including Maestro/Flutter; Laravel/Pest, Elixir/ExUnit, and TypeScript 7 suites) and collect it in providers traceable to Linear.

## ADDED Requirements

### Requirement: E2E builder, runner, and preview each with its own protocol

The system SHALL provide `/assurance:e2e-test-builder`, `/assurance:e2e-test-runner`, and `/assurance:e2e-test-preview` only from `assurance-toolkit`. Each command SHALL follow its own protocol (`references/e2e-test-builder/protocol.md`, `references/e2e-test-runner/protocol.md`, `references/e2e-test-preview/protocol.md`). Those three protocols SHALL stay distinct from the pillar `references/testing/protocol.md`. `make-no-mistakes-toolkit` SHALL NOT keep shims for these commands.

#### Scenario: Each command resolves its own protocol

- **WHEN** an agent invokes `/assurance:e2e-test-builder`, `/assurance:e2e-test-runner`, or `/assurance:e2e-test-preview`
- **THEN** it follows that command's protocol (generate the suite, execute the suite, or open the Qt preview) and not the testing pillar or a shim in make-no-mistakes

#### Scenario: Minimum Maestro flow

- **WHEN** `.maestro/negotiation_happy_path.yaml` exists and a test backend is up
- **THEN** the runner executes the flow and produces a collectable report (`qf collect` or equivalent)

### Requirement: Evidence providers with traceability to Linear

The system SHALL support Kiwi TCMS (optional self-hosted pilot), Qase, and Qualflare as result destinations, with a link from the test to the Linear issue (`qualflare.link` or an equivalent field).

#### Scenario: Collect flutter test into Qualflare

- **WHEN** `flutter test` produces JSON and a Qualflare project is configured
- **THEN** `qf collect` uploads the results and each test links to its Linear issue

#### Scenario: No mixing of security reports

- **WHEN** testing results are collected
- **THEN** no pentest finding appears in the test report (separate verdicts)

### Requirement: Failure clustering on the testing side

The system SHALL group run failures (triage pattern: queue → owner → SLA → receipt) operated by the testing owner, separate from security triage.

#### Scenario: Duplicate failures are clustered

- **WHEN** a `defect.created` webhook arrives with the same failure signature
- **THEN** it links to the existing cluster instead of opening a duplicate Linear issue

### Requirement: Laravel/Pest runner under the same evidence protocol

The system SHALL support Laravel suites via `php artisan test` (Pest/PHPUnit): parallel execution with `brianium/paratest` and per-process DBs (suffix per token, `ParallelTesting` hooks), coverage with `--coverage --min`, profiling with `--profile`, `.env.testing` environment, and a `tests/Architecture` suite with Pest arch-testing; the skill `pest-testing-laraveldaily` is the test-authoring reference.

#### Scenario: A Laravel suite is collectable

- **WHEN** a Laravel repo has Feature/Unit/Architecture suites and a valid `phpunit.xml`
- **THEN** the runner executes `php artisan test` (or `--parallel`), collects results to the configured provider, and fails the gate if coverage under `--min` is not met

#### Scenario: Arch-testing blocks structural violations

- **WHEN** a class violates a `tests/Architecture` rule (for example a model that does not extend `Model`, a `dd()` under `app/`)
- **THEN** the Architecture suite fails with the file and the violated expectation, without mixing that failure into security reports

### Requirement: Elixir/ExUnit runner under the same evidence protocol

The system SHALL support Elixir suites via `mix test` (ExUnit, including Phoenix/Ecto), property-based testing (PropEr/StreamData), and mocks with Mox/Hammox under explicit contracts.

#### Scenario: An Elixir suite is collectable

- **WHEN** an Elixir/Phoenix project has an ExUnit suite
- **THEN** the runner executes `mix test`, collects results to the configured provider, and links them to their Linear issues

### Requirement: TypeScript 7 compatibility validation

The system SHALL validate the migration to TypeScript 7 (`tsgo`, native Go port) as a checklist: a single compiler version in the repo, `tsconfig` without `baseUrl` (relative paths, compatible `vite-tsconfig-paths`), a plan for code that imports `typescript` as a library (classic in parallel until API 7.1 or `oxc-parser`), dual CI TS6+TS7 during the transition, and a review of sharp edges (typed-array generics, `Buffer` vs `Uint8Array`, recursive mapped types, removed memory flags).

#### Scenario: A TS7 migration is verified

- **WHEN** a package declares TypeScript 7
- **THEN** the gate verifies `tsgo --noEmit` is green, `baseUrl` is absent, and no script depends on the compiler API without a fallback plan

#### Scenario: A regression between compilers is detected

- **WHEN** dual CI reports green on classic and red on `tsgo` (or the reverse)
- **THEN** the result is reported as a compiler-compatibility issue, not as a functional failure of the code

### Requirement: Flutter/Dart runner by level (unit/widget/integration)

The system SHALL support the Flutter/Dart pyramid: unit with `package:test`/`flutter_test` (`flutter test`, mocks with mockito, tags and `dart_test.yaml`), widget with `WidgetTester` plus finders, and integration with `integration_test` on a real/simulated device plus Maestro YAML (accessibility layer, `Semantics.identifier` since Flutter 3.19, release builds, native dialogs, auto-waits, one Android+iOS flow, modular `runFlow`, Studio). `flutter_driver` stays legacy (debug/profile only, no native dialogs). Suite references: `flutter/gallery` and `flutter/dev/manual_tests`.

#### Scenario: The full pyramid is collectable

- **WHEN** a package has unit/widget/integration tests and Maestro flows
- **THEN** the runner executes `flutter test` plus on-device integration plus flows, and collects all of it to the configured provider with links to Linear

#### Scenario: Maestro requires identifiers

- **WHEN** a Maestro flow references a widget without `Semantics.identifier`
- **THEN** the protocol marks it untestable and requires the identifier via lint before the gate

#### Scenario: flutter_driver marked legacy

- **WHEN** a project still uses `flutter_driver`
- **THEN** the protocol marks it deprecated and proposes a migration to `integration_test` plus Maestro

### Requirement: Framework-agnostic adapters, not a closed list

The system SHALL define each runner as an adapter of the evidence protocol (run → collect → link to Linear → cluster); the initial stacks are the first adapters, not the only ones.

#### Scenario: A new adapter without changing the protocol

- **WHEN** a team needs an uncovered framework (for example Playwright for web)
- **THEN** an adapter is added that implements run/collect/link/cluster without modifying the existing ones

### Requirement: E2E and JS unit selection by matrix

The system SHALL select a framework by a documented matrix: Maestro default mobile-first (YAML, release builds, auto-wait, one Android+iOS flow); Playwright for cross-browser multi-language web (trace viewer, parallel); Cypress for web with JS DX (time-travel, screenshots/videos); Appium for native/hybrid with no code changes (XCUITest/UiAutomator2, Device Farm); Selenium only where infrastructure already exists; JS unit with Vitest/Jest.

#### Scenario: Web E2E does not force Maestro

- **WHEN** the target is cross-browser web
- **THEN** the protocol selects the Playwright adapter instead of forcing Maestro

#### Scenario: A PoC is mandatory before adoption

- **WHEN** a new framework is proposed as a supported adapter
- **THEN** a PoC is required (infra, training, maintenance, CI integration) before adopting it

### Requirement: Playwright web adapter with golden rules and quarantine with an exit

The system SHALL implement the Playwright adapter on the golden rules reinterpreted from `testdino-hq/playwright-skill` (MIT, v2.8.0, Agent Skills spec): `getByRole()` over CSS/XPath; `waitForTimeout()` forbidden (web-first assertions with auto-retry); total isolation per test; `baseURL` in config with no hardcoded URLs; retries 2 in CI / 0 local; traces `on-first-retry`; fixtures over globals; one behavior per test; mocks only of external services. Quarantine with an exit: mark `fail` (runs and warns if it goes green again) over `skip`; `@critical` is never auto-quarantined; the reporter fetch can never take down the run. Trust boundary: only our own or authorized apps; page content treated as untrusted (no injection into instructions); CI dependencies pinned by SHA/digest.

#### Scenario: Golden rules are enforceable at the gate

- **WHEN** a spec uses `waitForTimeout`, hardcoded URLs, or shared state
- **THEN** review/gate marks it as a violation before merge

#### Scenario: Quarantine that shrinks on its own

- **WHEN** a quarantined test (`fail`) goes green again
- **THEN** the run reports it recovered and it leaves the list without a manual edit; an `@critical` test never enters auto-quarantine

#### Scenario: Flake taxonomy drives the fix

- **WHEN** a test flakes
- **THEN** it is classified (timing/async, isolation, environment, infra) with the flowchart (`--repeat-each`, `--workers=1`, CI/local trace comparison) and the fix matches its category, not a timeout increase

### Requirement: MobileWright adapter for mobile with a Playwright-style API

The system SHALL support MobileWright (Apache-2.0) as a mobile adapter: `screen` fixtures (`getByText/Label/TestId/Role/Type`, tap/fill/swipe, assertions with auto-retry) and `device` (`openUrl`), one spec for iOS+Android, the accessibility tree as the agent-first surface (no vision model), and `testResult` metadata (name/tags/environment) that travels to the provider for link/cluster. `getByTestId` equals a Flutter widget Key in debug. Status: PoC candidate — Maestro stays the mobile-first default until the PoC is complete (maturity, coupling to the vendor cloud).

#### Scenario: One spec, two platforms

- **WHEN** the suite runs on iOS and Android
- **THEN** the same spec executes on both with no per-platform branches

#### Scenario: Evidence metadata travels to the provider

- **WHEN** a MobileWright run finishes with `testResult` configured
- **THEN** name/tags/environment are collected as evidence traceable to Linear

### Requirement: Mutation testing with per-stack MSI gates

The system SHALL support mutation per stack: Infection (PHP/PHPUnit, `minMsi`/`minCoveredMsi`, PHPStan/Mago integration), Stryker (TS/JS, incremental), muex (Elixir). MSI is a gate (coverage alone does not approve); in CI, mutation is incremental (touched lines).

#### Scenario: Low MSI blocks even when coverage is high

- **WHEN** the suite has 90% coverage but MSI under the threshold
- **THEN** the gate fails (the tests execute code without verifying it)

#### Scenario: Survivors are triaged with an exact location

- **WHEN** a mutant survives
- **THEN** it is reported with file, line, and mutator so the missing test can be written

### Requirement: Contract testing in two layers

The system SHALL cover contracts in two layers: schema-driven first with Schemathesis (CLI against OpenAPI, no new infra, baseline of known failures, nightly or on the provider PR — it also forces spec hygiene), and consumer-driven with Pact plus Broker plus `can-i-deploy` as the deploy gate for pairs with a history of breaks; Microcks/Prism for consistent mocks; BDCT (PactFlow) where the provider does not install verification.

#### Scenario: Spec drift detected on the provider

- **WHEN** Schemathesis runs against staging and the response violates the OpenAPI
- **THEN** the violation blocks or enters the baseline as a known failure, and is never silently ignored

#### Scenario: Deploy blocked by incompatibility

- **WHEN** `can-i-deploy` is red for the candidate version
- **THEN** the pipeline stops the deploy with the responsible consumer/provider pair

### Requirement: Performance testing with thresholds as gates

The system SHALL support perf by the team's language: k6 default JS/TS (thresholds → exit code, arrival-rate executors), Locust Python (distributed for free), Gatling JVM (HTML reports), JMeter for legacy protocols or no-code testers. Percentiles are reported (p95/p99, not averages) and feed the liveness SLOs. License note: k6 is AGPL-3.0 (a legal decision if it is embedded; using it as a CLI tool against our own systems does not trigger copyleft).

#### Scenario: A broken threshold stops promotion

- **WHEN** p99 exceeds the declared threshold
- **THEN** the run exits non-zero and blocks the corresponding gate

### Requirement: Patrol grey for regression, Maestro for smoke (Flutter)

The system SHALL use Patrol as the default for dev-owned regression (Dart, Keys, `$.native` for permissions/WebViews/notifications, runs on farms that support native tests) and Maestro for QA-owned smoke and restart; `integration_test` for fast dev checks. Recorded caveat: Patrol CI instability → pin versions and fix device OS images.

#### Scenario: A flow with a native permission

- **WHEN** the flow requires an OS permission dialog
- **THEN** Patrol or Maestro is used, never `integration_test` alone

### Requirement: Accessibility by level with a staged gate

The system SHALL audit a11y by level: axe-core on web/WebView (WCAG 2.0–2.2 A/AA), Axe DevTools Mobile plus Maestro commands (`axeStartScanSession`/`axeScan`) on native, XCTest/Espresso where it applies, MCP scanner for agent-first audits. Gate: critical/serious block, moderate/minor only warn.

#### Scenario: A critical violation blocks

- **WHEN** the scan reports a critical or serious violation
- **THEN** the gate fails with the WCAG criterion and the affected element

### Requirement: Visual regression and general PBT

The system SHALL support web visual regression with `toHaveScreenshot` (WebP baselines, `maxDiffPixelRatio` threshold) and property-based testing per stack: fast-check (TS), Hypothesis/Schemathesis (API/Python), PropEr/StreamData (Elixir) — invariants over ranges and edges, not only examples.

#### Scenario: A visual diff decides with a threshold

- **WHEN** the UI changes and the diff exceeds the configured threshold
- **THEN** the case fails with baseline/actual/diff screenshots attached

### Requirement: Stories as portable test units (component testing)

The system SHALL treat stories (CSF) as the single fixture that feeds every level without rewriting: render test (smoke), interaction with a play function (Testing Library queries with role priority → testid as last resort, `userEvent`/`expect` always awaited, `fn()` spies, `step()` grouping, `beforeEach/afterEach` isolation), a11y via addon (axe-core, `parameters.a11y.test` at `error`/`todo`/`off`), visual (Chromatic), coverage from stories, unit (portable stories), and E2E (iframe `?id=` with Cypress/Playwright). Default runner: Vitest addon (real Chromium browser mode, `include/exclude/skip` tags, UI/CLI/CI/editor); test-runner (Jest) only where the framework does not use Vite. The a11y migration `error` → `todo` → fix maps to the staged gate.

#### Scenario: One story, many runners

- **WHEN** a story with a play function exists
- **THEN** it runs as a component test (Vitest), a11y, visual, and E2E via iframe without duplicating authoring

#### Scenario: A11y error/todo/off maps to the gate

- **WHEN** `a11y.test` is `error` and there is a violation
- **THEN** it blocks; if it is `todo` it warns; `off` only on documented anti-patterns

#### Scenario: Tags govern the suite

- **WHEN** a story carries the tag `experimental`
- **THEN** it is excluded from the gate but visible in results

### Requirement: Widgetbook scenarios as portable Flutter units

The system SHALL treat Widgetbook scenarios as the Flutter mirror of web stories: Story (one state, `$`-var in `.stories.dart`) plus type-safe Args (`Arg.fixed` pinned) plus Modes (theme/locale/viewport/text-scale via addons) plus a frozen Scenario (fixed args, deterministic, runs in `flutter_test` with a `run` callback for taps/pumps/asserts, screenshot to `build/.widgetbook`). Global definitions with strategies `perScenario`/`perStory`/`both` multiply the matrix (theme × locale × text-scale × device) in a single `flutter test`. Goldens: fixed environment plus collaborative review (zero hand-written goldens in Cloud); `flutter_test` a11y guidelines (androidTapTarget 48, iOSTapTarget 44, labeledTapTarget → WCAG 4.1.2, textContrast → WCAG 1.4.3) in each cell; semantics-tree diff for regressions invisible to the visual diff. Cheapest fix: design-system tokens (contrast, target size) before tests.

#### Scenario: One scenario, full matrix

- **WHEN** a scenario crosses global definitions
- **THEN** it runs on theme × locale × viewport × text-scale with the 4 guidelines in each cell

#### Scenario: A golden without platform false positives

- **WHEN** goldens run in a controlled environment with collaborative review
- **THEN** they do not fail on platform rendering and only intentional changes update the reference

#### Scenario: Semantics diff detects the invisible

- **WHEN** a refactor removes a label without changing a pixel
- **THEN** the semantics diff detects it even when the visual diff passes

### Requirement: Eval-driven development for LLM features

The system SHALL apply evaluation-driven development (Huyen Ch4): measurable criteria first (local/global factual consistency, safety, domain capabilities), benchmarks with distrust (mostly close-ended MMLU-style: verify what they measure before trusting them), specialized judges calibrated over generic LLM-judges, an eval pipeline that guides development, and conversational feedback as data (Ch10). Layered prompt-attack defense with a prioritized system prompt (Ch5).

#### Scenario: Criteria before code

- **WHEN** an LLM feature starts
- **THEN** measurable criteria plus a baseline exist before the first deploy (a deployed app with no evaluation is worse than not deploying it)

#### Scenario: A calibrated judge, not a generic opinion

- **WHEN** an AI-judge is used
- **THEN** it is specialized, calibrated against annotators, and versioned with the pipeline

### Requirement: Risk-driven suites with self-testing (Fowler)

The system SHALL design risk-driven suites: test what is most worrying if it fails (not "every public method"); incomplete tests that run are worth more than complete tests that do not exist; self-verifying, frequent, and isolated (any order); characterization tests before refactoring legacy with no net.

#### Scenario: An economical suite prioritized by risk

- **WHEN** time is limited
- **THEN** coverage prioritizes documented risk, and the rest stays as explicit debt, not as a silent hole

#### Scenario: A refactor with a net

- **WHEN** code without tests is refactored
- **THEN** characterization tests are green before and after each small step
