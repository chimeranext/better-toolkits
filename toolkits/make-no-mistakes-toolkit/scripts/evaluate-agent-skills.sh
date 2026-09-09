#!/usr/bin/env bash
# evaluate-agent-skills.sh — thin wrapper around NVIDIA SkillSpector / SkillEvaluator.
#
# Peer CLIs (Apache-2.0 upstream) — install separately; this script does not vendor them.
#   uv tool install git+https://github.com/NVIDIA/SkillSpector.git
#   uv tool install --python 3.13 "skillevaluator[all] @ git+https://github.com/NVIDIA/SkillEvaluator.git"
#
# Usage:
#   evaluate-agent-skills.sh [scan|quality|validate|full] <path-or-url> [--llm] [--format FMT] [--output FILE]
#
# Exit: propagates upstream CLI exit code; 127 if required CLI missing; 2 on usage error.
set -euo pipefail

MODE="scan"
TARGET=""
LLM=false
FORMAT="markdown"
OUTPUT=""

usage() {
  sed -n '2,14p' "$0"
  exit 2
}

while [ $# -gt 0 ]; do
  case "$1" in
    scan|quality|validate|full) MODE="$1"; shift ;;
    --llm) LLM=true; shift ;;
    --format)
      [ -z "${2:-}" ] && usage
      FORMAT="$2"
      shift 2
      ;;
    --output|-o)
      [ -z "${2:-}" ] && usage
      OUTPUT="$2"
      shift 2
      ;;
    -h|--help) usage ;;
    *)
      if [ -z "$TARGET" ]; then
        TARGET="$1"
        shift
      else
        echo "ERROR: unexpected argument: $1" >&2
        usage
      fi
      ;;
  esac
done

if [ -z "$TARGET" ]; then
  echo "ERROR: missing <path-or-url> (skill directory, SKILL.md, zip, or URL)." >&2
  usage
fi

need() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: '$1' not on PATH." >&2
    echo "Install (peer dependency — not shipped in better-toolkits):" >&2
    case "$1" in
      skillspector)
        echo "  uv tool install git+https://github.com/NVIDIA/SkillSpector.git" >&2
        ;;
      skillevaluator)
        echo "  uv tool install --python 3.13 \"skillevaluator[all] @ git+https://github.com/NVIDIA/SkillEvaluator.git\"" >&2
        ;;
    esac
    echo "Docs: https://docs.nvidia.com/skills/evaluating-agent-skills" >&2
    exit 127
  fi
}

OUT_DIR="${EVALUATE_AGENT_SKILLS_OUT:-reports/evaluate-agent-skills}"
mkdir -p "$OUT_DIR"

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
safe_name="$(printf '%s' "$TARGET" | tr '/: ' '___' | cut -c1-80)"

run_scan() {
  need skillspector
  local args=(scan "$TARGET")
  if [ "$LLM" = false ]; then
    args+=(--no-llm)
  fi
  args+=(--format "$FORMAT")
  local out="${OUTPUT:-$OUT_DIR/skillspector-${safe_name}-${stamp}.${FORMAT}}"
  case "$FORMAT" in
    markdown) out="${out%.markdown}.md"; out="${out%.md}.md" ;;
  esac
  args+=(--output "$out")
  echo "+ skillspector ${args[*]}" >&2
  skillspector "${args[@]}"
  echo "Wrote: $out" >&2
}

run_quality() {
  need skillevaluator
  echo "+ skillevaluator quality-check $TARGET" >&2
  skillevaluator quality-check "$TARGET"
}

run_validate() {
  need skillevaluator
  local args=(validate "$TARGET" --no-dedup -r "$FORMAT" -o "${OUTPUT:-$OUT_DIR}")
  echo "+ skillevaluator ${args[*]}" >&2
  skillevaluator "${args[@]}"
}

case "$MODE" in
  scan) run_scan ;;
  quality) run_quality ;;
  validate) run_validate ;;
  full)
    run_scan
    run_validate
    echo "NOTE: Tier 3 live eval skipped — require HITL + evals/evals.json (see NVIDIA docs)." >&2
    ;;
  *) usage ;;
esac
