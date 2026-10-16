#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "${ROOT}"
PYTHON="$(command -v python3)"

"${PYTHON}" scripts/lint/check_no_stale_deprecated_shims.py --repo

TMP="$(mktemp -d)"
trap 'rm -rf "${TMP}"' EXIT
BAD="${TMP}/toolkits/fake-toolkit/commands/old-cmd.md"
mkdir -p "$(dirname "${BAD}")"
cat >"${BAD}" <<'EOF'
---
description: Deprecated alias for /new-cmd
---
# /old-cmd (deprecated)

Use `/new-cmd` instead.
EOF

if "${PYTHON}" scripts/lint/check_no_stale_deprecated_shims.py "${BAD}"; then
  echo "expected failure for synthetic shim command" >&2
  exit 1
fi

echo "test_no_stale_deprecated_shims: OK"
