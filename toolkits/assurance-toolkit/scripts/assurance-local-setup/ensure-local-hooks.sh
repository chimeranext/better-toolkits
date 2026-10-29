#!/usr/bin/env bash
# Activa los hooks git locales (pre-push / pre-commit) para el repo actual.
# Ámbito LOCAL: solo la máquina del dev; NO toca GitHub settings.
# Idempotente. No hace falta si ya hay core.hooksPath o pre-commit instalado.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "$(pwd)")"
cd "$ROOT"

case "${1:-auto}" in
  auto|pre-push|pre-commit) : ;;
  *) echo "uso: ensure-local-hooks.sh [auto|pre-push|pre-commit]"; exit 1 ;;
esac

# 1) Si hay pre-commit instalado y config, úsalo.
if command -v pre-commit >/dev/null && [ -f .pre-commit-config.yaml ]; then
  pre-commit install
  echo "assurance-local-setup: pre-commit hooks instalados"
  exit 0
fi

# 2) Fallback: hooks del monorepo (shared/hooks/git) vía core.hooksPath.
if [ -d shared/hooks/git ]; then
  git config core.hooksPath "$ROOT/shared/hooks/git"
  echo "assurance-local-setup: core.hooksPath -> shared/hooks/git"
  exit 0
fi

echo "assurance-local-setup: WARN no hay shared/hooks/git ni pre-commit; hooks locales no activados" >&2
