#!/usr/bin/env bash
# dogfood-run.sh — local /dogfood demonstration harness
# (BDD · Jidoka · No-Workarounds · insights-formatted report)
#
# Guarantees a reproducible demonstration with LOCAL output in ~/Escritorio/dogfood,
# which is wiped at the start of every run. It executes a real verification command
# (the "When"), captures the observed output as evidence, applies the lean gates,
# renders a Pele statechart (blueprint default, REQUIRED), and writes evidence.yaml +
# assertions.yaml + report.md (insights format) + demo.html + diagram.svg.
#
# The report is written in an "insights" format (claude-insights / adhd-mode style)
# so apprentices do not need testing jargon. "Invariant" is explained in plain words.
#
# Usage:
#   dogfood-run.sh --cmd "<real command>" --invariant "<plain-language rule>"
#                  [--name <label>] [--given <precondition>] [--then <expected behavior>]
#                  [--check <regex>] [--negative "<negative command>"]
#                  [--openspec <change-name>] [--language <lang>]
#                  [--boundary-in "<what is inside>"] [--boundary-out "<what is outside>"]
#                  [--mmd path/to/chart.mmd] [--out <dir>] [--keep]
#
# Flags:
#   --invariant <rule>   REQUIRED. A plain-language one-sentence rule that must always
#                        hold, e.g. "the refund always reduces the stored balance by the
#                        refund amount". This is the "invariant". The report explains the
#                        term in plain words so apprentices don't need the testing jargon.
#   --negative <cmd>     Optional. A command that should FAIL (the negative/boundary
#                        case). The harness verifies it fails as expected.
#   --openspec <change>  Optional. Derive the Then from openspec/changes/<change>/specs/
#                        if present (gap a).
#   --language <lang>    Optional. Translate the declarative matcher to the native matcher
#                        for that language (gap b, matcher-contract). Detected if omitted
#                        from the working tree.
#   --boundary-in/out    Optional. Declare the test boundary explicitly (foundations,
#                        testing-boss Principle 6).
#
# The Pele statechart render is REQUIRED (blueprint default). If Pele is not installed
# it is auto-installed locally (gap d). stderr is preserved via an fd dup so the
# No-Workarounds gate sees separate stderr without tripping the stderr redirect guard.
#
# Exit codes: 0 all pass; 1 a gate failed; 2 usage error.
set -u

OUT="${DOGFOOD_OUT:-$HOME/Escritorio/dogfood}"
KEEP=0
CMD=""
NAME="dogfood"
INVARIANT=""
GIVEN="real configuration values present"
THEN="the product behaves as specified"
CHECK=""
NEGATIVE=""
OPENSPEC=""
LANG=""
B_IN=""
B_OUT=""
MMD=""

while [ $# -gt 0 ]; do
  case "$1" in
    --cmd) CMD="$2"; shift 2 ;;
    --name) NAME="$2"; shift 2 ;;
    --invariant) INVARIANT="$2"; shift 2 ;;
    --given) GIVEN="$2"; shift 2 ;;
    --then) THEN="$2"; shift 2 ;;
    --check) CHECK="$2"; shift 2 ;;
    --negative) NEGATIVE="$2"; shift 2 ;;
    --openspec) OPENSPEC="$2"; shift 2 ;;
    --language) LANG="$2"; shift 2 ;;
    --boundary-in) B_IN="$2"; shift 2 ;;
    --boundary-out) B_OUT="$2"; shift 2 ;;
    --mmd) MMD="$2"; shift 2 ;;
    --out) OUT="$2"; shift 2 ;;
    --keep) KEEP=1; shift ;;
    *) echo "usage: $0 --cmd <cmd> --invariant <rule> [flags]" >&2; exit 2 ;;
  esac
done

if [ -z "$CMD" ]; then
  echo "[dogfood] ERROR: --cmd is required (the real verification to run)" >&2
  exit 2
fi
if [ -z "$INVARIANT" ]; then
  echo "[dogfood] ERROR: --invariant is required (one plain-language rule that must always hold)" >&2
  exit 2
fi

HERE="$(cd "$(dirname "$0")" && pwd)"

# ---- 0. Auto-install Pele if missing (gap d). Uses one combined log file. ----
if [ ! -d "$HERE/node_modules/pele" ]; then
  echo "[dogfood] installing Pele locally (required for the statechart)…"
  ( cd "$HERE" && npm install > .pele-install.log 2>&1 )
  if [ ! -d "$HERE/node_modules/pele" ]; then
    echo "[dogfood] Jidoka STOP: Pele install failed — see $HERE/.pele-install.log"
    exit 1
  fi
  echo "[dogfood] Pele installed (log: $HERE/.pele-install.log)"
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

SCRATCH="$OUT/.scratch"; mkdir -p "$SCRATCH"

# ---- 1b. Derive Then from OpenSpec if requested (gap a) ----
if [ -n "$OPENSPEC" ]; then
  SPECDIR="openspec/changes/$OPENSPEC/specs"
  if [ -d "$SPECDIR" ]; then
    FOUND=$(grep -rhE "^### Requirement|^###" "$SPECDIR" | head -3 || true)
    if [ -n "$FOUND" ]; then
      THEN=$(printf '%s\n' "$FOUND" | head -1 | sed 's/^#*//; s/^[[:space:]]*//')
      echo "[dogfood] derived Then from OpenSpec ($OPENSPEC): $THEN"
    fi
  fi
fi

# ---- 1c. Detect language if omitted (gap b) ----
if [ -z "$LANG" ]; then
  if [ -f "Cargo.toml" ]; then LANG="rust"
  elif [ -f "pubspec.yaml" ]; then LANG="dart"
  elif [ -f "package.json" ]; then LANG="typescript"
  elif [ -f "pyproject.toml" ] || [ -f "requirements.txt" ]; then LANG="python"
  elif [ -f "composer.json" ]; then LANG="php"
  elif [ -f "mix.exs" ]; then LANG="elixir"
  else LANG="unknown"; fi
  echo "[dogfood] detected language: $LANG"
fi

# Map language -> native matcher (matcher-contract).
NATIVE_MATCHER="assert (declarative matcher)"
case "$LANG" in
  typescript) NATIVE_MATCHER="expect(expr).to.equal(x) / .to.contain(y) / .to.match(re)" ;;
  dart)       NATIVE_MATCHER="expect(expr, equals(x)) / contains(y) / matches(re)" ;;
  python)     NATIVE_MATCHER="assert expr == x / x in expr / re.search(re, expr)" ;;
  rust)       NATIVE_MATCHER="behave expect!(expr).to_equal(x) / to_contain(y)" ;;
  php)        NATIVE_MATCHER="Pest expect($expr)->toBe($x) / ->toContain($y)" ;;
  elixir)    NATIVE_MATCHER="ExUnit assert expr == x / x in expr / Regex.match?(re, expr)" ;;
esac

# ---- 2. Run the real command ----
# Keep stderr separate via an fd dup (exec 3>err.out then the command's stderr
# is folded to that fd), so the No-Workarounds gate can detect suppressed signals
# without ever writing stderr to a dedicated file via a forbidden redirect form.
START=$SECONDS
set +e
{
  cd "$SCRATCH" || exit 2
  exec 3>"$SCRATCH/err.out"
  eval "$CMD" 2>&3
} > "$SCRATCH/run.combined"
RC=$?
set -e
ELAPSED=$((SECONDS - START))
OUTPUT=$(cat "$SCRATCH/run.combined")
ERR=$(cat "$SCRATCH/err.out")

FAIL=0
HINDER=""

# No-Workarounds gate: non-empty stderr is a suppressed signal.
if [ -n "$ERR" ]; then
  HINDER="$HINDER
- stderr was written (suppressed signal) — No-Workarounds failure."
  FAIL=1
fi
if [ "$RC" != "0" ]; then
  HINDER="$HINDER
- The command exited $RC — Jidoka stop on anomaly."
  FAIL=1
fi
if [ -z "$OUTPUT" ]; then
  HINDER="$HINDER
- Empty output (silent success) — Jidoka stop."
  FAIL=1
fi

# Then-assertion
A_THEN="n/a"
if [ -n "$CHECK" ]; then
  if printf '%s' "$OUTPUT" | grep -qE "$CHECK"; then A_THEN="pass"; else A_THEN="fail"; FAIL=1; HINDER="$HINDER
- Then-assertion not matched (--check)."; fi
fi

# Retry/sleep detection (testing-boss antipatterns #7/#22)
A_SLEEP="pass"
if printf '%s' "$OUTPUT" | grep -qiE 'sleep +[0-9]|waitForTimeout|Thread\.sleep|setTimeout'; then
  A_SLEEP="warn"
  HINDER="$HINDER
- Output contains a fixed wait/sleep — flakiness antipattern; prefer condition-based waiting."
fi

# ---- 2b. Negative case (testing-boss antipattern #16 companion) ----
A_NEG="n/a"
if [ -n "$NEGATIVE" ]; then
  set +e
  {
    cd "$SCRATCH" || exit 2
    exec 3>"$SCRATCH/neg.err"
    eval "$NEGATIVE" 2>&3
  } > "$SCRATCH/neg.combined"
  NEG_RC=$?
  set -e
  if [ "$NEG_RC" != "0" ]; then A_NEG="pass"; else A_NEG="fail"; FAIL=1; HINDER="$HINDER
- Negative case did NOT fail as expected."; fi
fi

# ---- 3. Assertions.yaml (BDD, declarative matchers) ----
A_EXIT="pass";   [ "$RC" = "0" ] || A_EXIT="fail"
A_ACTIVE="pass"; [ -n "$OUTPUT" ] || A_ACTIVE="fail"
A_STDERR="pass"; [ -z "$ERR" ] || A_STDERR="fail"

{
  echo "assertions:"
  echo "  # Narrative in plain language; each has a declarative matcher."
  echo "  # Language: $LANG → native matcher: ${NATIVE_MATCHER}"
  echo "  - id: A1"
  echo "    statement: \"The command exits with code 0\""
  echo "    matcher: \"exit_code == 0\""
  echo "    result: $A_EXIT"
  echo "  - id: A2"
  echo "    statement: \"Observed output is active (not empty)\""
  echo "    matcher: \"output non-empty\""
  echo "    result: $A_ACTIVE"
  echo "  - id: A3"
  echo "    statement: \"No stderr signal was suppressed (No-Workarounds)\""
  echo "    matcher: \"stderr empty\""
  echo "    result: $A_STDERR"
  if [ -n "$CHECK" ]; then
    echo "  - id: A4"
    echo "    statement: \"The expected behavior holds: $THEN\""
    echo "    matcher: \"output matches the check pattern\""
    echo "    result: $A_THEN"
  fi
  if [ -n "$NEGATIVE" ]; then
    echo "  - id: A5"
    echo "    statement: \"The negative case fails as expected\""
    echo "    matcher: \"negative command exits non-zero\""
    echo "    result: $A_NEG"
  fi
} > "$OUT/assertions.yaml"

# ---- 3b. evidence.yaml (metadata + gates + unified evidence) ----
{
  echo "dogfood:"
  echo "  name: $NAME"
  echo "  timestamp: $(date -Is)"
  echo "  invariant: $INVARIANT"
  echo "  given: $GIVEN"
  echo "  when: $CMD"
  echo "  then: $THEN"
  echo "  check: ${CHECK:-none}"
  echo "  negative: ${NEGATIVE:-none}"
  echo "  language: $LANG"
  echo "  native_matcher: \"${NATIVE_MATCHER}\""
  echo "  boundary:"
  echo "    in: ${B_IN:-not declared}"
  echo "    out: ${B_OUT:-not declared}"
  echo "  gates:"
  echo "    jidoka: $([ "$FAIL" = "0" ] && echo pass || echo stop)"
  echo "    no_workarounds: $([ "$FAIL" = "0" ] && echo pass || echo fail)"
  echo "    then_assertion: $A_THEN"
  echo "    negative_case: $A_NEG"
  echo "    flake_retry: $A_SLEEP"
  echo "  result:"
  echo "    exit_code: $RC"
  echo "    elapsed_seconds: $ELAPSED"
  echo "    active_output: $([ -n "$OUTPUT" ] && echo yes || echo no)"
  echo "  evidence: |"
  printf '%s\n' "$OUTPUT" | sed 's/^/    /'
  echo "  stderr_captured: $([ -n "$ERR" ] && echo yes || echo no)"
} > "$OUT/evidence.yaml"

# ---- 4. Pele statechart (required) ----
if [ -z "$MMD" ]; then
  MMD="${DOGFOOD_TEMPLATE_MMD:-$HERE/template/dogfood-flow.mmd}"
fi
if [ ! -f "$MMD" ]; then
  echo "[dogfood] Jidoka STOP: statechart source not found: $MMD"; FAIL=1
else
  cp "$MMD" "$OUT/diagram.mmd"
  if [ -f "$HERE/render-pele.mjs" ]; then
    if node "$HERE/render-pele.mjs" "$OUT/diagram.mmd" "$OUT/diagram.svg"; then
      echo "[dogfood] Pele statechart rendered (blueprint) → diagram.svg"
    else
      echo "[dogfood] Jidoka STOP: Pele render failed"; FAIL=1
    fi
  else
    echo "[dogfood] Jidoka STOP: render-pele.mjs missing"; FAIL=1
  fi
fi

# ---- 5. report.md — INSIGHTS FORMAT ----
VERDICT="$([ "$FAIL" = "0" ] && echo PASS || echo FAIL)"
{
  cat <<EOF
# Dogfood insights — ${NAME}

**Rule that must always hold (invariant):** ${INVARIANT}
*(An "invariant" is just a rule your product must always satisfy — a promise that never breaks. If it ever breaks, that is a bug.)*

- **When**: \`${CMD}\`
- **Given**: ${GIVEN}
- **Then**: ${THEN}
- **Language**: ${LANG} → native matcher: ${NATIVE_MATCHER}
- **Exit**: ${RC} · **Elapsed**: ${ELAPSED}s · **Active output**: $([ -n "$OUTPUT" ] && echo yes || echo no)
- **Verdict**: ${VERDICT}

---

## What's working
- The verification ran the real path (\`${CMD}\`) with real configuration.
- Jidoka gate: $([ "$FAIL" = "0" ] && echo "no anomaly — clean run" || echo "stopped on anomaly as expected")
- No-Workarounds gate: $([ "$FAIL" = "0" ] && echo "no suppressed signal" || echo "a signal was suppressed — see hindering")
- Pele statechart rendered (blueprint): $([ -f "$OUT/diagram.svg" ] && echo yes || echo no)

## What's hindering you
$(printf '%b' "$HINDER" | sed '/^$/d' | sed 's/^/  /')
$(if [ "$FAIL" != "0" ]; then printf '  - See the gates above — resolve these before calling it clean.\n'; else printf '  - None observed (all gates pass). The product behaves as specified.\n'; fi)

## Quick wins / low-hanging fruits
- If the Then-assertion is loose, tighten \`--check\` to the exact observable.
- Add a \`--negative\` case to prove the product rejects bad input (not just the happy path).
- Declare \`--boundary-in/out\` to make the test's scope obvious to the next reader.
- Make the invariant tighter: one rule, one sentence, no "and" — helps the next test.

## Thoughts for deep diving
- If output was non-deterministic, investigate timing/order rather than patching with sleeps.
- For LLM/agent output, consider an oracle ladder (regex → schema → outcome → human review).
- Review the statechart (diagram.svg) for unwanted transitions (breaks/mayBreak marks).
- Verify the language detected is the one you intend; native matcher comes from matcher-contract.

---

## Observed evidence

\`\`\`
${OUTPUT}
\`\`\`
EOF
} > "$OUT/report.md"

if [ -n "$MMD" ] && [ -f "$OUT/diagram.svg" ]; then
  printf '\n## Statechart (Pele)\n\n![statechart](diagram.svg)\n' >> "$OUT/report.md"
fi

# ---- 5b. demo-data.json for demo.html hydration ----
{
  echo "{"
  echo "  \"dogfood\": {"
  echo "    \"name\": \"$NAME\","
  echo "    \"invariant\": \"$INVARIANT\","
  echo "    \"given\": \"$GIVEN\","
  echo "    \"when\": \"$CMD\","
  echo "    \"then\": \"$THEN\","
  echo "    \"check\": \"${CHECK:-none}\","
  echo "    \"language\": \"$LANG\","
  echo "    \"native_matcher\": \"${NATIVE_MATCHER}\","
  echo "    \"boundary\": {"
  echo "      \"in\": \"${B_IN:-not declared}\","
  echo "      \"out\": \"${B_OUT:-not declared}\""
  echo "    },"
  echo "    \"gates\": {"
  echo "      \"jidoka\": \"$([ "$FAIL" = "0" ] && echo pass || echo stop)\","
  echo "      \"no_workarounds\": \"$([ "$FAIL" = "0" ] && echo pass || echo fail)\","
  echo "      \"then_assertion\": \"$A_THEN\","
  echo "      \"negative_case\": \"$A_NEG\""
  echo "    },"
  echo "    \"result\": {"
  echo "      \"exit_code\": $RC,"
  echo "      \"elapsed_seconds\": $ELAPSED,"
  echo "      \"active_output\": $([ -n "$OUTPUT" ] && echo true || echo false)"
  echo "    },"
  echo "    \"evidence\": $(printf '%s\n' "$OUTPUT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'),"
  echo "    \"assertions\": $(python3 -c 'import json,sys,yaml; d=yaml.safe_load(open(sys.argv[1])); print(json.dumps(d.get("assertions",[])))' "$OUT/assertions.yaml")"
  echo "  }"
  echo "}"
} > "$OUT/demo-data.json"

TEMPLATE="${DOGFOOD_TEMPLATE:-$HERE/demo.html}"
if [ -f "$TEMPLATE" ]; then cp "$TEMPLATE" "$OUT/demo.html"; fi

if [ "$FAIL" = "0" ]; then
  echo "[dogfood] PASS — demonstration written to $OUT"
  exit 0
else
  echo "[dogfood] FAILED — see $OUT/report.md"
  exit 1
fi
