#!/usr/bin/env bash
# Prepara las dependencias locales del typecheck (tsc + @types/node).
# Local: baja deps para correr `npm run typecheck` en la máquina.
# --include=dev es obligatorio (NODE_ENV=production omitiría devDeps), igual
# que en el PRE_COMMAND del CI.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "$(pwd)")"
HOOKS_DIR="$ROOT/shared/hooks"

if [ ! -d "$HOOKS_DIR" ]; then
  echo "assurance-local-setup: no hay shared/hooks; typecheck local no aplica" >&2
  exit 0
fi

if [ -f "$HOOKS_DIR/package.json" ]; then
  cd "$HOOKS_DIR"
  npm ci --include=dev
  echo "assurance-local-setup: deps typecheck listas"
fi

cd "$ROOT"
echo "assurance-local-setup: listo (si hay tsconfig base, corre 'npm run typecheck' en shared/hooks)"
