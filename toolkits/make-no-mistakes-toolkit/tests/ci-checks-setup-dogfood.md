# Dogfood — `/ci-checks-setup` run on better-toolkits

Task: run `/ci-checks-setup` on this repo and review the emitted set.

**Walk outcome:** phases 1→10 visited in order; all core checks included; no
opt-in check confirmed (the opinionated opt-ins — k6 suites, DAST/IaC/container
scans, Docker base-image mirroring, Chromatic publishing — are not applicable or
not confirmed for this repo; each was asked and declined). This is an honest run:
the emitted set contains exactly the core catalog with zero unconfirmed opt-ins.

## Emitted manifest (summary)

- Source: `shared/references/ci/ci-checks.yml`
- Phases: 1→10 (all), in order
- Core checks included: 50 total across the 10 phases
- Opt-in confirmed: 0
- Opt-in omitted (recorded): `check-deno-runtime`, `check-vendored-debrand`,
  `scan-web-dast`, `scan-iac-config`, `scan-container-images`,
  `sync-database-types`, `test-k6-auth`, `test-k6-guest`, `test-k6-suite`,
  `test-vrt-baseline`, `publish-ui-chromatic`, `sync-docker-images`

## Review of the emitted set vs this repo

| Observation | Verdict |
| --- | --- |
| Phase 1 core `check-skills-catalog` maps to `.github/workflows/skills-catalog-check.yml` (job renamed `check` → `check-skills-catalog`) | ✓ implemented |
| Phase 2 core `scan-security`/`scan-static` map to `.github/workflows/skillspector.yml` jobs (recorded legacy 2-segment names, not renamed) | ✓ implemented |
| Phase 2 core `verify-sbom-manifest`, `audit-supply-dependencies`, `guard-secrets-repo` | not implemented (catalog target; audit reports gap) |
| Phase 6 core `validate-spec-openspec` | `openspec` is validated by the `marketplace-versions` workflow's `sync-and-check` only partially; no dedicated job |
| Infra jobs (`review`, `deploy`, `megalinter`, `propagate`, `debrand`, `toolkit-lint`, `audit`, `sync-and-check`) excluded per catalog `infra_jobs` | ✓ |
| Naming validator (strict) over `.github/workflows` passes with `--allow-legacy` (only the two recorded legacy names) | ✓ |

**Conclusion:** the emitted set is the honest baseline. New checks must be
added as real jobs with 3-segment names — empty placeholders are NOT created
(No-Workarounds). `/ci-checks-audit` is the tool that keeps the gap visible.
