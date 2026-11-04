#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "${ROOT}"
PYTHON="$(command -v python3)"

# 1. Unit tests (regex + legacy allowlist + extraction).
"${PYTHON}" scripts/ci/check-ci-naming.py --selftest

# 2. Literal-name mode: conforming names pass.
"${PYTHON}" scripts/ci/check-ci-naming.py --names \
  scan-security-dependencies enforce-pr-size deploy-db-migrations check-skills-catalog

# 3. Literal-name mode: violations are rejected.
if "${PYTHON}" scripts/ci/check-ci-naming.py --names scan-security; then
  echo "expected failure for legacy name without --allow-legacy" >&2
  exit 1
fi

# 4. Legacy names pass only with --allow-legacy.
"${PYTHON}" scripts/ci/check-ci-naming.py --allow-legacy --names scan-security scan-static

# 5. Full-repo workflow scan passes with --allow-legacy (recorded legacy + infra excluded).
"${PYTHON}" scripts/ci/check-ci-naming.py --allow-legacy

echo "test_check_ci_naming: OK"
