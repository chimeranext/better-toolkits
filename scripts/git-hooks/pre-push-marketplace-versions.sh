#!/usr/bin/env bash
# Pre-push: block when toolkit agent surface changed but marketplace version did not increase.
# Apply bumps: python3 scripts/ci/marketplace_versioning.py write --range <range>
#
# Install:
#   ln -sf ../../scripts/git-hooks/pre-push-marketplace-versions.sh .git/hooks/pre-push
# Or: pre-commit install --hook-type pre-push (when wired in .pre-commit-config.yaml)

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "${ROOT}"

if [[ "${SKIP_MARKETPLACE_VERSION_CHECK:-}" == "1" ]]; then
  exit 0
fi

if [[ -n "${PRE_COMMIT_FROM_REF:-}" && -n "${PRE_COMMIT_TO_REF:-}" ]]; then
  RANGE="${PRE_COMMIT_FROM_REF}..${PRE_COMMIT_TO_REF}"
elif [[ $# -ge 4 ]]; then
  # git pre-push: remote_name url local_ref local_sha remote_ref remote_sha
  LOCAL_SHA="${4}"
  REMOTE_REF="${5:-}"
  if [[ -n "${REMOTE_REF}" && "${REMOTE_REF}" != "(delete)" ]]; then
    RANGE="${REMOTE_REF}..${LOCAL_SHA}"
  else
    RANGE="origin/main..${LOCAL_SHA}"
  fi
else
  RANGE="origin/main..HEAD"
fi

PYTHON="$(command -v python3)"
if [[ -z "${PYTHON}" ]]; then
  echo "pre-push-marketplace-versions: python3 not found; skipping check." >&2
  exit 0
fi

"${PYTHON}" scripts/ci/marketplace_versioning.py sync >&2 || exit 1
"${PYTHON}" scripts/ci/marketplace_versioning.py check --range "${RANGE}"
"${PYTHON}" scripts/lint/check_no_stale_deprecated_shims.py --range "${RANGE}"
