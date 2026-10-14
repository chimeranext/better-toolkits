#!/usr/bin/env bash
# Pre-commit / local wrapper — passes staged filenames to the Python checker.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "${ROOT}"
PYTHON="$(command -v python3)"
if [[ -z "${PYTHON}" ]]; then
  echo "check-no-stale-deprecated-shims: python3 not found" >&2
  exit 1
fi
if [[ $# -eq 0 ]]; then
  exec "${PYTHON}" scripts/lint/check_no_stale_deprecated_shims.py --repo
fi
exec "${PYTHON}" scripts/lint/check_no_stale_deprecated_shims.py "$@"
