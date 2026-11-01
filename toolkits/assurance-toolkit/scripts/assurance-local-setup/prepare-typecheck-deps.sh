#!/usr/bin/env bash
# Prepares the local typecheck dependencies (tsc + @types/node).
# Local: fetches deps to run `npm run typecheck` on the machine.
# --include=dev is mandatory (NODE_ENV=production would omit devDeps), same
# as in the CI PRE_COMMAND.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)" || ROOT="$(pwd)"
HOOKS_DIR="$ROOT/shared/hooks"

if [ ! -d "$HOOKS_DIR" ]; then
  echo "assurance-local-setup: no shared/hooks; local typecheck does not apply" >&2
  exit 0
fi

if [ -f "$HOOKS_DIR/package.json" ]; then
  cd "$HOOKS_DIR"
  npm ci --include=dev
  echo "assurance-local-setup: typecheck deps ready"
fi

cd "$ROOT"
echo "assurance-local-setup: done (if there is a base tsconfig, run 'npm run typecheck' in shared/hooks)"
