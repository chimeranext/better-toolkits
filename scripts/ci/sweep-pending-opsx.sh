#!/usr/bin/env bash
# sweep-pending-opsx.sh — startup-agnostic OpenSpec pending-work sweep.
#
# For every OpenSpec change under openspec/changes/ (excluding archive/):
#   1. tasks.md checklist completeness  — count "- [ ]" vs "- [x]"
#   2. spec drift                       — delta specs under openspec/changes/<id>/specs/
#                                         whose openspec/specs/ counterpart is missing
#   3. archive-ready                    — all tasks [x] but the change is not yet archived
#
# Exit: 0 if nothing pending; 1 if any pending row exists; 2 on engine errors.
# Read-only: never mutates changes, specs, or tasks. Sonly temp file it writes is
# under /tmp (JSON row buffer), removed on exit.
#
# StS discipline: no null redirections, stderr preserved. Usage:
#   bash scripts/ci/sweep-pending-opsx.sh [--json]
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

JSON=0
for arg in "$@"; do
  case "$arg" in
    --json) JSON=1 ;;
    -h|--help)
      cat <<'EOF'
Usage: bash scripts/ci/sweep-pending-opsx.sh [--json]

Scans openspec/changes/** (archive excluded) for pending OpenSpec work:
pending tasks (unchecked checkboxes), spec drift (delta without main spec),
archive-ready (all [x] but still under openspec/changes/).
Exit 0 = nothing pending. Exit 1 = pending items exist (report printed).
EOF
      exit 0 ;;
    *) echo "unknown arg: $arg" >&2; exit 2 ;;
  esac
done

CHANGES_ROOT="$REPO_ROOT/openspec/changes"
SPECS_ROOT="$REPO_ROOT/openspec/specs"

if [ ! -d "$CHANGES_ROOT" ]; then
  echo "sweep-pending-opsx: no openspec/changes/ under $REPO_ROOT" >&2
  exit 2
fi

ROWS_JSON="$(mktemp /tmp/sweep-pending-opsx.XXXXXX.jsonl)"
trap 'rm -f "$ROWS_JSON"' EXIT

json_row() {
  # $1 change  $2 pending_tasks  $3 total_tasks  $4 spec_drift  $5 archive_ready
  printf '{"change":"%s","pending_tasks":%d,"total_tasks":%d,"spec_drift":%d,"archive_ready":%s}\n' \
    "$1" "$2" "$3" "$4" "$5" >> "$ROWS_JSON"
}

pending=0
for d in "$CHANGES_ROOT"/*/; do
  change="$(basename "$d")"
  [ "$change" = "archive" ] && continue

  # --- 1. checklist completeness ---
  total=0; done_c=0; open=0
  if [ -f "$d/tasks.md" ]; then
    total=$(grep -cE '^[[:space:]]*- \[[xX ]\]' "$d/tasks.md")
    done_c=$(grep -cE '^[[:space:]]*- \[[xX]\]' "$d/tasks.md")
    open=$(( total - done_c ))
  fi

  archive_ready="false"
  if [ "$total" -gt 0 ] && [ "$open" -eq 0 ]; then
    archive_ready="true"
  fi

  # --- 2. spec drift: delta spec exists but main spec missing ---
  drift=0
  if [ -d "$d/specs" ]; then
    while IFS= read -r rel; do
      [ -z "$rel" ] && continue
      if [ ! -f "$SPECS_ROOT/$rel" ]; then
        drift=$(( drift + 1 ))
      fi
    done < <(cd "$d/specs" && find . -name spec.md -type f -printf '%P\n')
  fi

  # --- emit ---
  if [ "$open" -gt 0 ] || [ "$drift" -gt 0 ]; then
    pending=$(( pending + 1 ))
    if [ "$JSON" -eq 1 ]; then
      json_row "$change" "$open" "$total" "$drift" "$archive_ready"
    else
      printf 'change: %-55s pending_tasks: %-4d total_tasks: %-4d spec_drift: %-3d\n' \
        "$change" "$open" "$total" "$drift"
    fi
  elif [ "$archive_ready" = "true" ]; then
    # all checked, not yet archived — still pending an /opsx-archive run
    pending=$(( pending + 1 ))
    if [ "$JSON" -eq 1 ]; then
      json_row "$change" "$open" "$total" "$drift" "$archive_ready"
    else
      printf 'change: %-55s archive_ready (all [x]; run /opsx-archive)\n' "$change"
    fi
  fi
done

if [ "$JSON" -eq 1 ]; then
  python3 - "$ROWS_JSON" "$pending" <<'PYEOF'
import json, sys
rows = [json.loads(line) for line in open(sys.argv[1]) if line.strip()]
print(json.dumps({"pending_changes": len(rows), "rows": rows}, indent=2))
PYEOF
else
  echo "---------------------------------------------"
  echo "PENDING changes: $pending"
fi

[ "$pending" -eq 0 ] && exit 0 || exit 1
