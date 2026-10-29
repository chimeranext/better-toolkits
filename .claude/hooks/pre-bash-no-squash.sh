#!/usr/bin/env bash
# Dogfood: project hook delegates to shared no-squash SSOT (same adapter as OpenCode plugin).
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
exec bash "$REPO_ROOT/shared/hooks/no-squash/adapters/claude-pre-bash.sh"
