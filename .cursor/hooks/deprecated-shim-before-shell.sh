#!/usr/bin/env bash
# Block git commit when staged agent commands/scripts look like deprecated rename shims.
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
INPUT="$(cat)"
CMD="$(printf '%s' "${INPUT}" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("command",""))' 2>/dev/null || true)"
if [[ "${CMD}" != git\ commit* ]]; then
  exit 0
fi
cd "${REPO_ROOT}"
mapfile -t FILES < <(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null || true)
if [[ "${#FILES[@]}" -eq 0 ]]; then
  exit 0
fi
if python3 scripts/lint/check_no_stale_deprecated_shims.py "${FILES[@]}"; then
  exit 0
fi
printf '%s\n' '{"permission":"deny","userMessage":"Deprecated command/script shims are not allowed. Rename cleanly: update references and delete the old path (see shared/references/engineering-standards/no-deprecated-agent-shims.md)."}'
exit 0
