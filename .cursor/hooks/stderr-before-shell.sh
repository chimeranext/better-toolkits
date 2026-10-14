#!/usr/bin/env bash
# Dogfood: project hook delegates to shared stderr SSOT (same adapter as OpenCode plugin).
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
exec bash "$REPO_ROOT/shared/hooks/stderr/adapters/cursor-before-shell.sh"
