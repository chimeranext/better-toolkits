# Changelog — assurance

## [Unreleased]

### Added

- **`/assurance:triage`** hub command + `references/triage/protocol.md`.
- Per-pillar PR triage sub-protocols: `references/testing/triage.md`,
  `references/security/triage.md`, `references/liveness/triage.md`,
  `references/governance/triage.md`.
- Wired into `make-no-mistakes` `/ready-to-review-mergeable` §2b (before remote
  code review).

### Changed

- README **Start here** → `/assurance:triage`; `triage-security-findings` documented
  as security backlog helper under the hub.

## 0.1.0

- Scaffold: plugin manifest, README, 4 protocols (testing, liveness, security, governance), 7 thin commands, 1 skill.
- Migrate 7 commands from `make-no-mistakes-toolkit` with shims + deprecation warnings.
- Migrate 21 skills from `flutter-boilerplate-monorepo-template/skills` (reinterpreted, shims in template).
- Protocol content: polyglot runners, stories/scenarios, mutation, contracts, perf, a11y, visual, PBT, eval-driven + risk-driven, red-team agentic ASI01–10, MASVS→MASWE→MASTG, SAST/DAST/SCA, signed supply-chain, mobile REA, K8s runtime/policy engines, pre-flight layers, gates contract, health score, SemVer universal.
