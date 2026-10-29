#!/usr/bin/env bash
# dogfood-run.sh — local /dogfood demonstration harness (BDD · Jidoka · No-Workarounds)
#
# Guarantees a reproducible demonstration with LOCAL output in ~/Escritorio/dogfood,
# which is wiped at the start of every run. It executes a real verification command
# (the "When"), captures the observed output as evidence, applies the two lean gates,
# renders a Pele statechart (blueprint default, REQUIRED), and writes evidence.yaml +
# report.md + demo.html + diagram.svg.
#
# Usage:
#   dogfood-run.sh --cmd "<real command>" [--name <label>] [--given <precondition>]
#                  [--then <expected behavior>] [--check <regex>] [--mmd path/to/chart.mmd]
#                  [--out <dir>] [--keep]
#
# --check <regex>: the observed output MUST contain a match (grep -E) for the
# demonstration to pass. This is the BDD "Then" verification — without it, a
# bogus/error output could still pass the "non-empty" gate. Optional but
# recommended; Jidoka fails the run when provided and unmatched.
#
# The Pele statechart render is REQUIRED (blueprint default). If --mmd is omitted,
# the built-in dogfood-flow template is used. Requires `npm i -g pele` once.
#
# Exit codes:
#   0  all assertions passed and gates OK
#   1  an assertion failed or a gate was violated
#   2  usage error
set -u

OUT="${DOGFOOD_OUT:-$HOME/Escritorio/dogfood}"
KEEP=0
CMD=""
NAME="dogfood"
GIVEN="real configuration values present"
THEN="the product behaves as specified"
MMD=""
CHECK=""

while [ $# -gt 0 ]; do
  case "$1" in
    --cmd) CMD="$2"; shift 2 ;;
    --name) NAME="$2"; shift 2 ;;
    --given) GIVEN="$2"; shift 2 ;;
    --then) THEN="$2"; shift 2 ;;
    --check) CHECK="$2"; shift 2 ;;
    --mmd) MMD="$2"; shift 2 ;;
    --out) OUT="$2"; shift 2 ;;
    --keep) KEEP=1; shift ;;
    *) echo "usage: $0 --cmd <cmd> [flags]" >&2; exit 2 ;;
  esac
done

if [ -z "$CMD" ]; then
  echo "[dogfood] ERROR: --cmd is required (the real verification to run)" >&2
  exit 2
fi

# ---- 1. Wipe the local output dir (unless --keep) ----
if [ "$KEEP" = "0" ]; then
  rm -rf "$OUT"
  mkdir -p "$OUT"
  echo "[dogfood] wiped $OUT"
else
  mkdir -p "$OUT"
  echo "[dogfood] keeping $OUT (--keep)"
fi

# ---- 2. Run the real command. Capture stdout and stderr SEPARATELY so a stderr
#        signal is never silently suppressed (No-Workarounds gate). ----
SCRATCH="$OUT/.scratch"
mkdir -p "$SCRATCH"

START=$SECONDS
set +e
( cd "$SCRATCH" && eval "$CMD" ) > "$SCRATCH/run.out" 2> "$SCRATCH/err.out"
RC=$?
set -e
ELAPSED=$((SECONDS - START))

OUTPUT=$(cat "$SCRATCH/run.out")
ERR=$(cat "$SCRATCH/err.out")

FAIL=0

# No-Workarounds gate: non-empty stderr is a suppressed signal — fail.
if [ -n "$ERR" ]; then
  echo "[dogfood] No-Workarounds FAIL: command wrote to stderr (suppressed signal):"
  printf '%s\n' "$ERR" | head -8 | sed 's/^/    /'
  FAIL=1
fi

if [ "$RC" != "0" ]; then
  echo "[dogfood] Jidoka STOP: command exited $RC"
  FAIL=1
fi

if [ -z "$OUTPUT" ]; then
  echo "[dogfood] Jidoka STOP: empty output (silent success / exit 0 with nothing)"
  FAIL=1
fi

# BDD "Then" verification gate: if --check is given, the observed output MUST
# contain a match. Without it, a bogus/error output could still pass the
# non-empty gate — that would not be a guaranteed demonstration.
if [ -n "$CHECK" ]; then
  if printf '%s' "$OUTPUT" | grep -qE "$CHECK"; then
    echo "[dogfood] Then-assertion matched: $CHECK"
  else
    echo "[dogfood] Jidoka STOP: Then-assertion NOT matched (--check '$CHECK')"
    FAIL=1
  fi
fi

# ---- 3. Build BDD assertions (natural-language afirmaciones + matchers) ----
# Each afirmación is a human-readable statement, a matcher, and an individual
# verdict. This is BDD (behavior described in words), not TDD (technical asserts).
A_EXIT="pass";   [ "$RC" = "0" ] || A_EXIT="fail"
A_ACTIVE="pass"; [ -n "$OUTPUT" ] || A_ACTIVE="fail"
A_STDERR="pass"; [ -z "$ERR" ] || A_STDERR="fail"
A_THEN="n/a"
if [ -n "$CHECK" ]; then
  if printf '%s' "$OUTPUT" | grep -qE "$CHECK"; then A_THEN="pass"; else A_THEN="fail"; fi
fi

cat > "$OUT/assertions.yaml" <<EOF
afirmaciones:            # BDD — comportamiento en lenguaje natural (no aserciones TDD)
  - id: A1
    statement: "El comando debe salir con código 0"
    matcher: "exit_code == 0"
    result: $A_EXIT
  - id: A2
    statement: "La salida observada debe ser activa (no vacía)"
    matcher: "output non-empty"
    result: $A_ACTIVE
  - id: A3
    statement: "No debe silenciarse ninguna señal a stderr (No-Workarounds)"
    matcher: "stderr empty"
    result: $A_STDERR
EOF

if [ -n "$CHECK" ]; then
cat >> "$OUT/assertions.yaml" <<EOF
  - id: A4
    statement: "El comportamiento esperado (Then) debe cumplirse: $THEN"
    matcher: "output matches the --check pattern (see evidence.yaml check)"
    result: $A_THEN
EOF
fi

# ---- 3b. Write evidence.yaml (metadata + gates) ----
cat > "$OUT/evidence.yaml" <<EOF
dogfood:
  name: $NAME
  timestamp: $(date -Is)
  given: $GIVEN
  when: $CMD
  then: $THEN
  check: ${CHECK:-none}
  gates:
    jidoka: $([ "$FAIL" = "0" ] && echo "pass" || echo "stop")
    no_workarounds: $([ "$FAIL" = "0" ] && echo "pass" || echo "fail")
    then_assertion: $A_THEN
  result:
    exit_code: $RC
    elapsed_seconds: $ELAPSED
    active_output: $([ -n "$OUTPUT" ] && echo "yes" || echo "no")
  evidence: |
$(printf '%s\n' "$OUTPUT" | sed 's/^/    /')
  stderr_captured: $([ -n "$ERR" ] && echo "yes" || echo "no")
EOF

# ---- 4. Render a statechart via Pele (REQUIRED — blueprint default). ----
# If --mmd is not given, use the built-in dogfood-flow template. A render
# failure is a Jidoka STOP (the demonstration without a chart is incomplete).
if [ -z "$MMD" ]; then
  MMD="${DOGFOOD_TEMPLATE_MMD:-$(dirname "$0")/template/dogfood-flow.mmd}"
fi
if [ ! -f "$MMD" ]; then
  echo "[dogfood] Jidoka STOP: statechart source not found: $MMD"
  FAIL=1
else
  cp "$MMD" "$OUT/diagram.mmd"
  RENDERERS="$(dirname "$0")/render-pele.mjs"
  if [ -f "$RENDERERS" ]; then
    if node "$RENDERERS" "$OUT/diagram.mmd" "$OUT/diagram.svg"; then
      echo "[dogfood] Pele statechart rendered (blueprint) → diagram.svg"
    else
      echo "[dogfood] Jidoka STOP: Pele render failed (statechart required)"
      FAIL=1
    fi
  else
    echo "[dogfood] Jidoka STOP: render-pele.mjs not found next to runner"
    FAIL=1
  fi
fi

# ---- 5. Write report.md ----
cat > "$OUT/report.md" <<EOF
# Dogfood report — ${NAME}

- **When**: \`${CMD}\`
- **Given**: ${GIVEN}
- **Then**: ${THEN}
- **Exit**: ${RC} · **Elapsed**: ${ELAPSED}s · **Active output**: $([ -n "$OUTPUT" ] && echo yes || echo no)

## Gates

- Jidoka (stop on anomaly): $([ "$FAIL" = "0" ] && echo "PASS" || echo "STOP")
- No-Workarounds (suppressed signal is a failure): $([ "$FAIL" = "0" ] && echo "PASS" || echo "FAIL")

## Observed evidence

\`\`\`
${OUTPUT}
\`\`\`
EOF

if [ -n "$MMD" ] && [ -f "$OUT/diagram.svg" ]; then
  printf '\n## Statechart (Pele)\n\n![statechart](diagram.svg)\n' >> "$OUT/report.md"
fi

# ---- 5b. Generate demo-data.json for demo.html hydration ----
cat > "$OUT/demo-data.json" <<EOF
{
  "dogfood": {
    "name": "$NAME",
    "given": "$GIVEN",
    "when": "$CMD",
    "then": "$THEN",
    "check": "${CHECK:-none}",
    "gates": {
      "jidoka": "$([ "$FAIL" = "0" ] && echo "pass" || echo "stop")",
      "no_workarounds": "$([ "$FAIL" = "0" ] && echo "pass" || echo "fail")",
      "then_assertion": "$A_THEN"
    },
    "result": {
      "exit_code": $RC,
      "elapsed_seconds": $ELAPSED,
      "active_output": $([ -n "$OUTPUT" ] && echo "true" || echo "false")
    },
    "evidence": $(printf '%s\n' "$OUTPUT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'),
    "afirmaciones": $(python3 -c 'import json,sys,yaml; d=yaml.safe_load(open(sys.argv[1])); print(json.dumps(d.get("afirmaciones",[])))' "$OUT/assertions.yaml")
  }
}
EOF

# Copy the demo.html template next to the output if present.
TEMPLATE="${DOGFOOD_TEMPLATE:-$(dirname "$0")/demo.html}"
if [ -f "$TEMPLATE" ]; then
  cp "$TEMPLATE" "$OUT/demo.html"
fi

# ---- 6. Exit ----
if [ "$FAIL" = "0" ]; then
  echo "[dogfood] PASS — demonstration written to $OUT"
  exit 0
else
  echo "[dogfood] FAILED — see $OUT/report.md"
  exit 1
fi
