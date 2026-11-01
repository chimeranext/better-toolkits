# CIS — CI Security & Standards (doctrina)

## Purpose

Standardize the **security and lint CI gates** that every monorepo must carry,
and how those gates are **vendored** from `better-toolkits` into client repos.
Complements MPH (branch/ruleset protections) and GGT (branch model) with the
CI-layer doctrine: what runs, at what severity it fails, and who owns the
canonical templates.

## Doctrine

1. **Every monorepo SHALL run three CI gate families** on PRs to the protected
   branch:
   - **Lint** — MegaLinter (`megalinter.yml`), file-scoped to the PR diff
     (`VALIDATE_ALL_CODEBASE: false`), with a typecheck pre-command where TS is
     present.
   - **SAST** — CodeQL (`codeql-action/init|autobuild|analyze@v3`), security-
     extended queries. `analyze@v3` already uploads SARIF; there is **no**
     `upload-results@v3` action (that ref is invalid and fails the job).
     `languages` must use CodeQL's vocabulary: **`javascript`** for TS/JS
     (there is no `typescript` language; passing `typescript` fails with "Did
     not recognize the following languages"). See convention `ci-workflows`
      (platform) for the authoring rules.
   - **Container / IaC** — Trivy (`trivy-action`), config + fs/secret scans,
     failing on `CRITICAL,HIGH`.
2. **Severity is fail-closed.** CI gate failures block the merge. Bypasses are
   evidence, not switches — they go through the `internal-audits` trail (MPH).
   Advisory scans (SBOM, DAST) are the exception: they `continue-on-error` and
   report, but never block.
3. **The core security gate is `security-scan`** (CodeQL + Trivy +
   dependency-scan), and it is **extensible**: SBOM (CycloneDX) and DAST
   (OWASP ZAP baseline) are opt-in advisory steps of the same composite action.
4. **PR governance is a distinct gate family** (`pr-governance.yml`): PR size,
   stale PRs, and guards. It is not part of security nor lint; it covers
   engineering discipline.
3. **The gates are vendored, not hand-authored per repo.** Canonical templates
   live in `toolkits/assurance-toolkit/scripts/assurance-repo-setup/templates/`
   (`workflow-security.yml.tpl`, `workflow-megalinter.yml.tpl`, `workflow-
   bypass-audit.yml.tpl`) and the composite actions in
   `chimeranext/github-actions-templates/` (`security-scan`, `codeowners-
   replicate`, `prds-check`). Client repos derive their `.github/workflows/*`
   from these; they do not invent their own.
4. **Repo layout is discovered, never assumed.** CodeQL languages, Dockerfile
   paths (`config-scan-ref`), and IaC paths (`iac-scan-ref`) are read from the
   actual repo (tsconfig/pyproject/go.mod, Dockerfile locations, terraform/k8s
   dirs). Dart/Flutter and Rust are not CodeQL languages and are excluded from
   `languages` (Trivy still covers their containers/config).
5. **PR description gates (PRDS) are client-specific but standardized.** Where a
   client enforces PRDS (e.g. `HAB-*` tickets and Spanish body sections), the
   CI must pass it; a CI-only change still requires a compliant description.
6. **A red check that fails on `main` too is a baseline defect, not a PR
   defect.** Diagnostics must distinguish PR-caused failures (e.g. a new word in
   CODEOWNERS failing cspell) from repo-wide baseline failures (CodeQL/Trivy on
   pre-existing infrastructure). Do not enlarge a PR to fix baseline infra; file
   it separately.

## Why

- Without a canonical source, each client hand-authors security workflows and
  drifts (observed: `upload-results@v3` invalid ref in altrupets; cspell
  `DISABLE` ignored; Trivy scanning whole repo).
- Fail-closed severity prevents shipping known HIGH/CRITICAL issues.

## Application (generic)

- Vendor: `assurance-repo-setup` installs `security.yml`, `megalinter.yml`, and
  `bypass-audit.yml` from the templates (Phase 7; also CODEOWNERS via
  toolkits-initial-setup Phase 7b).
- Reuse: `security-scan` composite action wraps CodeQL + Trivy with the
  discovered `languages`/`config-scan-ref`/`iac-scan-ref`.
- Baseline: when a check fails on `main` regardless of the PR, treat it as a
  separate infrastructure finding — not a merge blocker on unrelated PRs, and
  not a reason to force-merge.

## References

- **MPH** (protected branch, fail-closed HITL, CODEOWNERS). **GGT** (branch
  model). **PRDS** (PR description gate). **NSQ** (merge method).
- Templates: `toolkits/assurance-toolkit/scripts/assurance-repo-setup/templates/`.
- Actions: `chimeranext/github-actions-templates/{security-scan,codeowners-replicate,prds-check}`.
- Learner summary: internal-handbook `docs/how-to/engineering-standards/CIS.md`.
