#!/usr/bin/env bash
# Wrapper for backward compatibility -> unified sync (SSOT).
exec "$(cd "$(dirname "$0")/.." && pwd)/scripts/sync-hooks-from-shared.sh" prds
