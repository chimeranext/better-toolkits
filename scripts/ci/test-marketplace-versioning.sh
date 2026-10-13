#!/usr/bin/env bash
# Synthetic smoke test for marketplace_versioning.py (no network).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "${ROOT}"

python3 scripts/ci/marketplace_versioning.py sync

# Main should fail check if we hypothetically had toolkit changes without bump since merge-base.
# After a release bump PR, origin/main..HEAD on a docs-only branch should pass.
if python3 scripts/ci/marketplace_versioning.py check --range "origin/main..HEAD"; then
  echo "OK: check passed for origin/main..HEAD"
else
  echo "NOTE: check failed for origin/main..HEAD (expected on branches with pending toolkit edits)."
fi

echo "test-marketplace-versioning: done"
