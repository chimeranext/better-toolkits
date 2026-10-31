#!/usr/bin/env bash
# Pre-tool-use guard: `gh pr merge --admin` requires explicit HUMAN approval.
#
# Fail-closed: intercepts the command before execution. If it sees `gh pr merge`
# with `--admin`, it demands a freshly created elevated marker that only a human
# can mint through an interactive elevation prompt (pkexec/sudo on Linux,
# osascript with administrator privileges on macOS, UAC on Windows). Declining
# blocks the tool use (exit 1). Approval TTL: 5 minutes.
#
# Wiring example (opencode.json hooks.beforeToolUse or adapter):
#   bash <repo>/shared/hooks/tooluse/approve-admin-merge.sh "$ARGUMENTS"
set -u

CMD="$*"
case "$CMD" in
  *"gh pr merge"*"--admin"*) ;;
  *) exit 0 ;; # not a guarded admin merge
esac

OS="$(uname -s)"
case "$OS" in
  MINGW*|MSYS*|CYGWIN*) PLATFORM="windows" ;;
  Darwin) PLATFORM="darwin" ;;
  *) PLATFORM="linux" ;;
esac

TTL=300

marker_path() {
  if [ "$PLATFORM" = "windows" ]; then
    printf '%s' "${PROGRAMDATA:-C:\\ProgramData}/better-toolkits/hitl-approve-main-merge"
  else
    printf '%s' "${XDG_CACHE_HOME:-${HOME}/.cache}/better-toolkits/hitl-approve-main-merge"
  fi
}

marker_fresh() {
  local m="$1" age owner
  [ -f "$m" ] || return 1
  if [ "$PLATFORM" = "windows" ]; then
    age=$(powershell.exe -NoProfile -Command "([int]((Get-Date)-(Get-Item '$m').LastWriteTime).TotalSeconds)")
    age=$(printf '%s' "$age" | tr -d '\r')
    [ -n "$age" ] || return 1
    [ "$age" -le "$TTL" ] || return 1
    return 0
  fi
  owner="$(stat -c %u "$m")"
  [ "$owner" = "0" ] || return 1
  age=$(( $(date +%s) - $(stat -c %Y "$m") ))
  [ "$age" -le "$TTL" ]
}

elevate() {
  local m="$1" d
  d="$(dirname "$m")"
  if [ "$PLATFORM" = "darwin" ]; then
    osascript -e "do shell script \"mkdir -p '$d' && touch '$m' && chown root:root '$m'\" with administrator privileges"
    return $?
  fi
  if [ "$PLATFORM" = "windows" ]; then
    powershell.exe -NoProfile -Command "Start-Process cmd -Verb RunAs -ArgumentList '/c','mkdir \"$d\" & echo ok > \"$m\"'"
    return $?
  fi
  if command -v pkexec; then
    pkexec bash -c "mkdir -p '$d' && touch '$m' && chown root:root '$m'"
    return $?
  fi
  if command -v sudo; then
    sudo bash -c "mkdir -p '$d' && touch '$m' && chown root:root '$m'"
    return $?
  fi
  echo "[tooluse] ERROR: no elevation mechanism available (pkexec/sudo/osascript/UAC)." >&2
  return 1
}

MARKER="$(marker_path)"

if marker_fresh "$MARKER"; then
  exit 0
fi
rm -f "$MARKER"

echo "[tooluse] 'gh pr merge --admin' requires explicit HUMAN approval." >&2
echo "[tooluse] An elevation prompt is about to open (pkexec/sudo, osascript, or UAC)." >&2

if ! elevate "$MARKER"; then
  echo "[tooluse] BLOCKED: admin merge not approved by human." >&2
  exit 1
fi

if marker_fresh "$MARKER"; then
  echo "[tooluse] OK: human approval recorded. Proceeding." >&2
  exit 0
fi

echo "[tooluse] BLOCKED: approval marker not verified." >&2
exit 1
