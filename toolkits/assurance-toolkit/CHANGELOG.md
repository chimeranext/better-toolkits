# Changelog — assurance

## [Unreleased]

### Fixed

- `references/triage/protocol.md` Mermaid blocks: GitHub-compatible flowchart and
  sequence syntax; hub LESSONS L1 points at `platform/diagrams/mermaid-github`.

### Changed

- Rename testing pillar SSOT files to avoid hub collisions:
  `references/testing/triage.md` → `triage-protocol.md`,
  `references/testing/protocol.md` → `e2e-protocol.md` (all in-repo links updated).
- `/assurance:e2e-test-builder` runs after `/assurance:triage pr` PASS (mandatory
  in ready-to-review §2c), using the testing pillar output.
  `/assurance:e2e-test-runner` is the stage QA assignee step (Seacrets: Darío,
  QA ready view).
- Security findings are `/assurance:triage security`. Removed the separate
  `triage-security-findings` command and the make-no-mistakes shim.

### Added

- `/assurance:github-app-setup` + skill `github-app-setup`: guía interactiva para que
  un founder cree su PROPIA GitHub App (settings de org) y la use como autora de los
  reviews de Heimdall (estilo CodeRabbit/Greptile). Incluye manifest reutilizable
  (`references/github-app-setup/github-app-manifest.json`), key-chain
  (`HEIMDALL_GITHUB_APP_ID`/`_KEY`), verificación y troubleshooting.
- Bibliography + mermaid diagrams (evidence pipeline, liveness loop,
  traceability + layered defense, release-gates sequence) in the 4 pillar
  protocols; hub routing flowchart in `references/triage/protocol.md`.
- **`/assurance:triage`** hub command + `references/triage/protocol.md`.
- Per-pillar PR triage sub-protocols: `references/testing/triage-protocol.md`,
  `references/security/triage.md`, `references/liveness/triage.md`,
  `references/governance/triage.md`.
- Wired into `/make-no-mistakes:ready-to-review-mergeable` §2b (before remote
  code review).

## 0.1.0

- Scaffold: plugin manifest, README, 4 protocols (testing, liveness, security, governance), 7 thin commands, 1 skill.
- Migrate 7 commands from `make-no-mistakes-toolkit` with shims + deprecation warnings.
- Migrate 21 skills from `flutter-boilerplate-monorepo-template/skills` (reinterpreted, shims in template).
- Protocol content: polyglot runners, stories/scenarios, mutation, contracts, perf, a11y, visual, PBT, eval-driven + risk-driven, red-team agentic ASI01–10, MASVS→MASWE→MASTG, SAST/DAST/SCA, signed supply-chain, mobile REA, K8s runtime/policy engines, pre-flight layers, gates contract, health score, SemVer universal.
