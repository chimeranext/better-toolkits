#!/usr/bin/env bash
# install-tooluse-guards.sh — install tool-use guards into central hooks home.
#
# Convention:
#   $HARNESS_HOME    = /home/<user>/.agents   (central agent home)
#   $HARNESS_HOOKS   = $HARNESS_HOME/hooks    (central hooks dir)
# Usage: bash scripts/ci/install-tooluse-guards.sh [--root <custom-home>]
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HARNESS_HOME="${HARNESS_HOME:-$HOME/.agents}"
for arg in "$@"; do
  case "$arg" in
    --root) HARNESS_HOME="${2:-$HARNESS_HOME}"; shift 2 ;;
  esac
done
HARNESS_HOOKS="$HARNESS_HOME/hooks"

mkdir -p "$HARNESS_HOOKS"
cp "$ROOT/shared/hooks/tooluse/enforce-prds.sh" "$HARNESS_HOOKS/enforce-prds.sh"
cp "$ROOT/shared/hooks/tooluse/approve-admin-merge.sh" "$HARNESS_HOOKS/approve-admin-merge.sh"
STOP_SRC="$ROOT/shared/hooks/tooluse/stop-prs-green.sh"
[ -f "$STOP_SRC" ] || STOP_SRC="$ROOT/toolkits/make-no-mistakes-toolkit/hooks/hygiene/stop-prs-green.sh"
[ -f "$STOP_SRC" ] && cp "$STOP_SRC" "$HARNESS_HOOKS/stop-prs-green.sh"
chmod +x "$HARNESS_HOOKS/"*.sh

echo "[tooluse-guards] installed: $HARNESS_HOOKS"
echo "  HARNESS_HOME=$HARNESS_HOME"
echo "  set these in your environment: export HARNESS_HOME=\"$HARNESS_HOME\"; export HARNESS_HOOKS=\"$HARNESS_HOOKS\""
exit 0
