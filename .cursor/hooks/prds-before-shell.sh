#!/usr/bin/env bash
# Dogfood: project hook delegates to shared PRDS SSOT (parity with fractional-cto / make-no-mistakes).
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
exec bash "$REPO_ROOT/shared/hooks/prds/adapters/cursor-before-shell.sh"
