#!/usr/bin/env bash
# Enables local git hooks (pre-push / pre-commit) for the current repo.
# LOCAL scope: only the developer's machine; does NOT touch GitHub settings.
# Idempotent. Not needed if core.hooksPath or pre-commit is already installed.
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)" || ROOT="$(pwd)"
cd "$ROOT"

case "${1:-auto}" in
  auto|pre-push|pre-commit) : ;;
  *) echo "usage: ensure-local-hooks.sh [auto|pre-push|pre-commit]"; exit 1 ;;
esac

# 1) If pre-commit is installed and configured, use it.
if [ -n "$(command -v pre-commit)" ] && [ -f .pre-commit-config.yaml ]; then
  pre-commit install
  echo "assurance-local-setup: pre-commit hooks instalados"
  exit 0
fi

# 2) Fallback: monorepo hooks (shared/hooks/git) via core.hooksPath.
if [ -d shared/hooks/git ]; then
  git config core.hooksPath "$ROOT/shared/hooks/git"
  echo "assurance-local-setup: core.hooksPath -> shared/hooks/git"
  exit 0
fi

echo "assurance-local-setup: WARN no hay shared/hooks/git ni pre-commit; hooks locales no activados" >&2
