# CI checks — canonical catalog & invocation order

One-page reference. The machine-readable SSOT is
[`ci-checks.yml`](ci-checks.yml) (the table below is its human rendering).

**Naming convention:** every check name is `verb-type-subject` — lowercase,
three segments, matching
`^(check|test|scan|audit|build|verify|validate|enforce|deploy|publish|sync|guard|maintain|review|notify)-[a-z0-9]+-[a-z0-9]+$`.
Validate with `python3 scripts/ci/check-ci-naming.py`.

**Invocation order:** phases run **1 → 10**; each phase's **core** checks are
always included; **opt-in** checks are enabled only on explicit confirmation
(`/ci-checks-setup` asks per phase).

Canonical names are 3-segment; normalized spellings (from the original design
table) are shown in parentheses.

| Phase | Name | Core (default) | Opt-in (opinionated) |
|---|---|---|---|
| 1 | static/lint | `verify-static-types` (verify-types), `check-static-lint` (check-lint), `check-lint-mega`, `check-skills-catalog` | `check-deno-runtime` (deno-check), `check-vendored-debrand` (debrand) |
| 2 | security | `scan-security`*, `verify-sbom-manifest` (verify-sbom), `audit-supply-dependencies` (audit-dependencies), `scan-static`*, `guard-secrets-repo` (guard-secrets) | `scan-web-dast` (scan-dast), `scan-iac-config` (scan-iac), `scan-container-images` (scan-containers) |
| 3 | compile/graph | `build-app-bundle` (build-app), `build-ds-tokens` (compile-ds), `check-import-graph` | `sync-database-types` (database-types-sync) |
| 4 | test/behavior | `test-code-coverage` (test-coverage), `test-rls-gate` (test-rls), `test-dogfood-run` (run-dogfood), `test-testops-smoke` (qa-testops-smoke) | `test-k6-auth`, `test-k6-guest`, `test-k6-suite` |
| 5 | ui/regression | `test-ui-storybook` (test-storybook), `test-visual-regression`, `check-react-doctor` | `test-vrt-baseline` (test-vrt), `publish-ui-chromatic` (publish-chromatic) |
| 6 | docs/i18n | `check-docs-links`, `check-i18n-keys` (check-i18n), `validate-spec-openspec` (validate-openspec) | — |
| 7 | pr/governance | `enforce-pr-size`, `guard-pr-branch` (guard-pr), `check-stale-prs`, `check-govern-qa` (govern-qa), `guard-openspec-draft` (gate-openspec-draft), `maintain-codeowners-rotation` (codeowners-rotation), `enforce-reviewer-assignment` (assign-reviewer) | — |
| 8 | build artifact | `build-ci-artifacts` (build-artifacts) | `sync-docker-images` (mirror-docker-base-images) |
| 9 | deploy/promotion | `deploy-db-migrations` (deploy-migrations), `deploy-edge-runtime` (deploy-edge-functions), `deploy-release-pipeline` (deployment-pipeline), `deploy-promotion-ops` (stage-promotion-ops) | — |
| 10 | housekeeping | `maintain-monthly-housekeeping` (maintain-monthly), `review-quarterly-portfolio` (review-quarterly), `notify-deps-slack` (notify-dependabot-slack), `maintain-stale-prs` (stale-prs) | — |

\* `scan-security` / `scan-static` are the two recorded legacy 2-segment names
(merged before the 3-segment convention; see `naming.legacy_allowlist` in
`ci-checks.yml`).

## Tooling

- `/ci-checks-setup` — interactive phase walk 1→10; emits the workflow set in phase order.
- `/ci-checks-verify <check>` — diagnose a failing check (real run/query → cause + ranked actionables).
- `/ci-checks-audit` — compare actual workflow jobs vs this catalog (missing core, extra/unnamed, duplicate runs, naming violations).
- `python3 scripts/ci/check-ci-naming.py [--allow-legacy]` — naming validator.
