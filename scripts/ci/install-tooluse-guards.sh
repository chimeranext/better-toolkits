#!/usr/bin/env bash
# install-tooluse-guards.sh — install tool-use guards into harness homes.
#
# Convention: $HARNESS_HOME is the per-harness config root.
#   opencode -> ${XDG_CONFIG_HOME:-$HOME/.config}/opencode
#   cursor   -> $HOME/.cursor
#   claude   -> $HOME/.claude
# Usage: bash scripts/ci/install-tooluse-guards.sh [opencode|cursor|claude] [--root <custom>]
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HARNESS="${1:-}"
CUSTOM_ROOT="${3:-}"

harness_home() {
  case "$HARNESS" in
    opencode) { [ -n "$CUSTOM_ROOT" ] && echo "$CUSTOM_ROOT" || echo "${XDG_CONFIG_HOME:-$HOME/.config}/opencode"; } ;;
    cursor)   { [ -n "$CUSTOM_ROOT" ] && echo "$CUSTOM_ROOT" || echo "$HOME/.cursor"; } ;;
    claude)   { [ -n "$CUSTOM_ROOT" ] && echo "$CUSTOM_ROOT" || echo "$HOME/.claude"; } ;;
    *) echo "" ;;
  esac
}

[ -n "$HARNESS" ] || { echo "usage: $0 [opencode|cursor|claude]"; exit 2; }

HH="$(harness_home)"
[ -n "$HH" ] || { echo "unknown harness: $HARNESS"; exit 2; }
mkdir -p "$HH/shared/hooks/tooluse"

cp "$ROOT/shared/hooks/tooluse/enforce-prds.sh" "$HH/shared/hooks/tooluse/enforce-prds.sh"
cp "$ROOT/shared/hooks/tooluse/approve-admin-merge.sh" "$HH/shared/hooks/tooluse/approve-admin-merge.sh"
chmod +x "$HH/shared/hooks/tooluse/"*.sh

case "$HARNESS" in
  cursor|claude)
    src="$ROOT/shared/hooks/tooluse/harness/${HARNESS}-settings.example.json"
    [ -f "$src" ] && sed "s#__BETTER_TOOLKITS_ROOT__#$ROOT#g" "$src" > "$HH/settings.json"
    echo "[tooluse-guards] installed: $HARNESS -> $HH/settings.json"
    ;;
  opencode)
    python3 - "$ROOT" "$HH" <<'PY'
import json, pathlib, sys
root, hh = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
example = root/"shared/hooks/tooluse/harness/opencode-opencode.json.example"
target = hh/"opencode.json"
add = json.loads(example.read_text())["hooks"]["beforeToolUse"]
if target.exists():
    data = json.loads(target.read_text())
    btu = data.setdefault("hooks", {}).setdefault("beforeToolUse", [])
    for e in add:
        if e not in btu:
            btu.append(e)
    target.write_text(json.dumps(data, ensure_ascii=False, indent=2)+"\n")
else:
    data = json.loads(example.read_text())
    data["hooks"]["beforeToolUse"] = [dict(e, command=e["command"].replace("__BETTER_TOOLKITS_ROOT__", str(root))) for e in data["hooks"]["beforeToolUse"]]
    target.write_text(json.dumps(data, ensure_ascii=False, indent=2)+"\n")
PY
    echo "[tooluse-guards] opencode: merged $HH/opencode.json (hooks.beforeToolUse)"
    ;;
esac
exit 0
