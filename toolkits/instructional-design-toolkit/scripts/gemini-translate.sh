#!/usr/bin/env bash
# gemini-translate.sh — one-shot markdown translation on a cheap model via liteLLM.
#
# Self-contained, consumer-agnostic worker for the /idt:translate-content-gemini
# command. Reads ONE markdown content file, sends it + a translation rubric
# (plus optional consumer translation rules and a terminology glossary) to the
# target model in a SINGLE completion through a transient liteLLM proxy, and
# prints the translated markdown to stdout (or writes it with --out). NO nested
# Claude Code agent runs on the cheap model — just one completion per file. The
# orchestrator (the command) curates the output afterwards.
#
# Pattern source: make-no-mistakes-toolkit/scripts/gemini-code-review.sh
# (Design B — no nested agent).
#
# Usage:
#   gemini-translate.sh <source-file.md>
#   [--target-locale <label>]   # default "Latin American Spanish (es-419)"
#   [--rules <file>]            # consumer translation rules (e.g. agents/translator.md)
#   [--glossary <file>]         # terminology decisions from prior files (consistency)
#   [--out <file>]              # write result here instead of stdout only
#   [--model <litellm-id>]      # default gemini/gemini-3.5-flash
#
# Multi-model: liteLLM routes by the model prefix. Required API-key env:
# gemini/* -> GEMINI_API_KEY, openai|gpt* -> OPENAI_API_KEY,
# anthropic|claude-* -> ANTHROPIC_API_KEY. Stage it with the operator's secret
# helpers so it never leaks into logs.
#
# Requires: litellm, jq, curl.
set -euo pipefail

PORT="${GEMINI_TRANSLATE_PORT:-4101}"
MODEL="gemini/gemini-3.5-flash"
LOCALE="Latin American Spanish (es-419)"
SRC=""
RULES=""
GLOSSARY=""
OUT=""

while [ $# -gt 0 ]; do
  case "$1" in
    --target-locale) [ -z "${2:-}" ] && { echo "ERROR: --target-locale requiere un valor." >&2; exit 1; }; LOCALE="$2"; shift 2 ;;
    --rules) [ -z "${2:-}" ] && { echo "ERROR: --rules requiere un archivo." >&2; exit 1; }; RULES="$2"; shift 2 ;;
    --glossary) [ -z "${2:-}" ] && { echo "ERROR: --glossary requiere un archivo." >&2; exit 1; }; GLOSSARY="$2"; shift 2 ;;
    --out) [ -z "${2:-}" ] && { echo "ERROR: --out requiere una ruta." >&2; exit 1; }; OUT="$2"; shift 2 ;;
    --model) [ -z "${2:-}" ] && { echo "ERROR: --model requiere un valor (litellm id)." >&2; exit 1; }; MODEL="$2"; shift 2 ;;
    -h|--help) sed -n '2,28p' "$0"; exit 0 ;;
    *) SRC="$1"; shift ;;
  esac
done

[ -n "$SRC" ] || { echo "ERROR: falta el archivo fuente. Uso: gemini-translate.sh <source-file.md> [...]" >&2; exit 1; }
[ -f "$SRC" ] || { echo "ERROR: no existe el archivo fuente: $SRC" >&2; exit 1; }
if [ -n "$RULES" ] && [ ! -f "$RULES" ]; then echo "ERROR: no existe --rules: $RULES" >&2; exit 1; fi
if [ -n "$GLOSSARY" ] && [ ! -f "$GLOSSARY" ]; then echo "ERROR: no existe --glossary: $GLOSSARY" >&2; exit 1; fi

for bin in litellm jq curl; do
  command -v "$bin" >/dev/null 2>&1 || { echo "ERROR: falta '$bin' en PATH." >&2; exit 1; }
done

# --- provider -> API-key env (multi-model; liteLLM routes by model prefix) ---
case "$MODEL" in
  gemini/*|google/*)              KEY_ENV="GEMINI_API_KEY" ;;
  openai/*|gpt-*|o[0-9]*|*codex*) KEY_ENV="OPENAI_API_KEY" ;;
  anthropic/*|claude-*)           KEY_ENV="ANTHROPIC_API_KEY" ;;
  *)                              KEY_ENV="GEMINI_API_KEY" ;;
esac
if [ -z "${!KEY_ENV:-}" ]; then
  echo "ERROR: ${KEY_ENV} no está en el entorno (requerido para el modelo '${MODEL}')." >&2
  exit 1
fi

CONTENT_SRC="$(cat "$SRC")"
SRC_CHARS=${#CONTENT_SRC}
[ "$SRC_CHARS" -gt 400000 ] && echo "WARN: archivo grande (${SRC_CHARS} chars) — considerá partirlo." >&2

# --- rubric (consumer-agnostic base; --rules injects consumer voice/rules) ---
read -r -d '' RUBRIC <<RUBRIC_EOF || true
You are a professional technical-education translator. Translate the given
markdown course-content file from English to ${LOCALE}.

Hard rules (violating any of these makes the output unusable):
1. Preserve the document structure EXACTLY: same headings hierarchy, same lists,
   same tables, same code blocks, same blank-line layout.
2. Do NOT translate: code blocks and inline code, CLI commands, file paths,
   URLs, product names, and proper nouns.
3. YAML frontmatter: keep every key and value untouched EXCEPT human-readable
   text values (title, description, promise) which you translate. NEVER change
   these keys even if their values look like prose: slug, au_id, type, status,
   access_level, video_url, duration_seconds, duration_min, thumbnail_url,
   passing_score, allow_retry, show_answers, randomize.
4. Quiz conventions must survive verbatim as markers: "### Q<N>:" headings,
   "- A)" option letters, "**Correct:**" and "**Explanation:**" prefixes, and
   inline ✅ markers stay in that exact form (translate only the surrounding
   question/option/explanation text).
5. Relative image paths: if the file will live one level deeper in a locale
   tree (e.g. es/), do NOT rewrite paths yourself — leave them untouched; the
   pipeline adjusts them. Translate alt text.
6. Use natural, neutral ${LOCALE} with correct orthography — every tilde and
   accent mark present. Never substitute accented characters.
7. Keep the teaching register: direct, second person, practical.
8. If a terminology glossary is provided, its decisions are BINDING — reuse
   them exactly.

Output ONLY the translated markdown file content. No preamble, no commentary,
no code fences around the whole document.
RUBRIC_EOF

if [ -n "$RULES" ]; then
  RUBRIC="${RUBRIC}"$'\n\n'"Consumer translation rules (BINDING, they override style defaults):"$'\n\n'"$(cat "$RULES")"
fi
if [ -n "$GLOSSARY" ]; then
  RUBRIC="${RUBRIC}"$'\n\n'"Terminology glossary (BINDING decisions from earlier files in this run):"$'\n\n'"$(cat "$GLOSSARY")"
fi

# --- transient liteLLM proxy (self-generated config + master key; kill only ours) ---
PROXY_LOG="$(mktemp -t gtr-proxy.XXXXXX.log)"
PROXY_CFG="$(mktemp -t gtr-config.XXXXXX.yaml)"
export LITELLM_MASTER_KEY="${LITELLM_MASTER_KEY:-sk-gtr-local-$$}"
cat > "$PROXY_CFG" <<CFG
model_list:
  - model_name: $MODEL
    litellm_params:
      model: $MODEL
      api_key: os.environ/$KEY_ENV
general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
litellm_settings:
  drop_params: true
CFG
STARTED=false
ready() { curl -fsS "http://127.0.0.1:${PORT}/health/readiness" >/dev/null 2>&1; }
cleanup() { $STARTED && [ -n "${PID:-}" ] && kill "$PID" 2>/dev/null || true; rm -f "$PROXY_LOG" "$PROXY_CFG"; }
trap cleanup EXIT INT TERM

if ! ready; then
  echo "Levantando liteLLM proxy (${MODEL}) en 127.0.0.1:${PORT}..." >&2
  litellm --config "$PROXY_CFG" --host 127.0.0.1 --port "$PORT" >"$PROXY_LOG" 2>&1 &
  PID=$!; STARTED=true
  for _ in $(seq 1 40); do ready && break; sleep 1; done
  ready || { echo "ERROR: el proxy no arrancó. Log:" >&2; tail -8 "$PROXY_LOG" >&2; exit 4; }
fi

# --- one completion ---
# `-sS` (NOT -fsS): on an HTTP 4xx/5xx the body is captured + diagnosed below.
BODY="$(jq -n --arg m "$MODEL" --arg sys "$RUBRIC" \
  --arg usr "Translate this file (${SRC}):"$'\n\n'"${CONTENT_SRC}" \
  '{model:$m, messages:[{role:"system",content:$sys},{role:"user",content:$usr}]}')"
RESP="$(curl -sS "http://127.0.0.1:${PORT}/v1/chat/completions" \
  -H "Authorization: Bearer ${LITELLM_MASTER_KEY}" \
  -H "Content-Type: application/json" -d "$BODY")" \
  || { echo "ERROR: no se pudo conectar al proxy." >&2; exit 5; }

CONTENT="$(printf '%s' "$RESP" | jq -r '.choices[0].message.content // empty')"
if [ -z "$CONTENT" ]; then
  echo "ERROR: respuesta sin contenido:" >&2
  printf '%s\n' "$RESP" | jq -r '.error // .' >&2 2>/dev/null || printf '%s\n' "$RESP" >&2
  exit 6
fi

# Strip a whole-document code fence if the model wrapped the output anyway.
CONTENT="$(printf '%s\n' "$CONTENT" | awk 'NR==1 && /^```/ {fenced=1; next} fenced && /^```[[:space:]]*$/ && !stripped {stripped=1; next} {print}')"

if [ -n "$OUT" ]; then
  mkdir -p "$(dirname "$OUT")"
  printf '%s\n' "$CONTENT" > "$OUT"
  echo "[written: $OUT · model: ${MODEL} · src: ${SRC} · ${SRC_CHARS} chars]" >&2
else
  printf '%s\n' "$CONTENT"
  echo "[model: ${MODEL} · src: ${SRC} · ${SRC_CHARS} chars]" >&2
fi
