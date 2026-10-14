#!/usr/bin/env bash
# Deprecated wrapper — use prune-better-toolkits-cache.sh (/prune-better-toolkits-cache).
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "refresh-cursor-better-toolkits-plugin-cache.sh is deprecated; use prune-better-toolkits-cache.sh" >&2
exec "${SCRIPT_DIR}/prune-better-toolkits-cache.sh"
