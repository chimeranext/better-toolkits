# Design — CI check catalog, phase model, and `/ci-checks-setup`

## 1. Canonical catalog (10 phases + order)

Each check has a canonical name `verb-type-subject` (e.g. `scan-security-dependencies`,
`enforce-pr-size`) and maps to a concrete workflow job.

| Phase | Name | Core (default) | Opt-in (opinionated) |
|---|---|---|---|
| 1 | static/lint | `verify-types`, `check-lint`, `check-lint-mega`, `check-skills-catalog` | `deno-check`, `debrand` |
| 2 | security | `scan-security`, `verify-sbom`, `audit-dependencies`, `scan-static`, `guard-secrets` | `scan-dast`, `scan-iac`, `scan-containers` |
| 3 | compile/graph | `build-app`, `compile-ds`, `check-import-graph` | `database-types-sync` |
| 4 | test/behavior | `test-coverage`, `test-rls`, `run-dogfood`, `qa-testops-smoke` | `test-k6-auth`, `test-k6-guest`, `test-k6-suite` |
| 5 | ui/regression | `test-storybook`, `test-visual-regression`, `check-react-doctor` | `test-vrt`, `publish-chromatic` |
| 6 | docs/i18n | `check-docs-links`, `check-i18n`, `validate-openspec` | — |
| 7 | pr/governance | `enforce-pr-size`, `guard-pr`, `check-stale-prs`, `govern-qa`, `gate-openspec-draft`, `codeowners-rotation`, `assign-reviewer` | — |
| 8 | build artifact | `build-artifacts` | `mirror-docker-base-images` |
| 9 | deploy/promotion | `deploy-migrations`, `deploy-edge-functions`, `deployment-pipeline`, `stage-promotion-ops` | — |
| 10 | housekeeping | `maintain-monthly`, `review-quarterly`, `notify-dependabot-slack`, `stale-prs` | — |

### On `mirror-docker-base-images`

Copies (mirrors) the Docker **base images** your build/deploy relies on (e.g.
`node`, `python`, runtime images) from the public upstream registry into your own
registry. It is **opt-in** because it requires a target registry with push access
and typically a scheduled trigger. Value: supply-chain stability (your builds do
not depend on upstream registry availability or rate limits), reproducibility
(pinned bases), and the ability to scan the exact bases you deploy. It is a
Docker-specific concern, so it is not part of the startup-agnostic default core.

### Vendor-neutrality

Every opt-in check keeps its **name and body vendor-neutral**: it expresses a
reusable convention parameterized for a stack (e.g. `database-types-sync` targets
whichever DB engine the repo configures) and is never hard-bound to a specific
product, client, or organization.

## 2. Naming & de-duplication

- Every workflow job gets a meaningful `verb-type-subject` name; no check is
  named just `check` or `scan`.
- Workflows that must run on both `push` and `pull_request` use a single trigger
  set that does **not** produce duplicate check-runs on the same head (e.g. use
  one trigger with `concurrency` + `cancel-in-progress`, or gate to `pull_request`
  only where the PR is the unit).

## 3. Splitting the monolithic `scan`

`skillspector.yml`'s single `scan` job is split into the phase-2 named checks
(`scan-security`, `verify-sbom`, `audit-dependencies`, `scan-static`). Each is
its own job with a meaningful name.

## 4. The `/ci-checks` command family

Three toolkit skills around the canonical catalog:

- **`/ci-checks-setup`** — install/generate CI config. Reads the catalog; for
  each phase 1→10, in order, shows the **core** checks (always installed) and
  asks whether to enable that phase's **opt-in** checks, then emits the resulting
  workflow set (or a manifest `ci-checks.yml` + scaffolding) in phase order.
- **`/ci-checks-verify`** — diagnose a failing check. Resolves the check in the
  catalog, runs (or points to) the real check, and returns the cause + ranked
  actionables (consistent with `/explain` for CI failures).
- **`/ci-checks-audit`** — compare the repo's actual workflow jobs against the
  catalog and report: missing required checks, extra/unnamed checks, duplicate
  runs, and naming violations.

Behavior contract (`/ci-checks-setup`):
- `Given` a repo + chosen opt-in per phase
- `When` `/ci-checks-setup` runs
- `Then` each phase is visited in order, core checks are included by default, and
  only the confirmed opt-in checks are added.
