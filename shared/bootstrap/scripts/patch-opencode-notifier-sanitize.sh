#!/usr/bin/env bash
# patch-opencode-notifier-sanitize.sh
#
# Applies (idempotently) a local sanitization patch to the installed
# @mohak34/opencode-notifier so that `{sessionTitle}` is stripped of Markdown
# before it is shown in notifications (turning `*Fix login bug*` into
# `Fix login bug`). opencode-notifier does not expose a Markdown-sanitizing
# option, so we patch the interpolated title at the source.
#
# The patch is applied to the npm-cached copy under ~/.cache/opencode/npm/...
# A fresh `opencode plugin update` restores the pristine file, so re-run this
# script after updating the plugin (wired in setup-opencode.md).
#
# Usage: bash scripts/patch-opencode-notifier-sanitize.sh
set -euo pipefail

PLUGIN_DIR="${OPENCODE_NOTIFIER_PLUGIN_DIR:-}"
if [ -z "$PLUGIN_DIR" ]; then
  PLUGIN_DIR=$(find "$HOME/.cache/opencode/npm" -type d -path "*@mohak34/opencode-notifier*/node_modules/@mohak34/opencode-notifier" | head -1 || true)
fi
if [ -z "$PLUGIN_DIR" ] || [ ! -d "$PLUGIN_DIR" ]; then
  echo "[patch] ERROR: opencode-notifier plugin not found in npm cache"
  echo "[patch] hint: install it first with: opencode plugin add @mohak34/opencode-notifier@latest"
  exit 1
fi

TARGET="$PLUGIN_DIR/dist/index.js"
if [ ! -f "$TARGET" ]; then
  echo "[patch] ERROR: dist/index.js not found in $PLUGIN_DIR"
  exit 1
fi

if grep -q "function stripMarkdown" "$TARGET"; then
  echo "[patch] already applied (stripMarkdown present) — nothing to do"
  exit 0
fi

# Insert stripMarkdown just before interpolateMessage and use it for sessionTitle.
python3 - "$TARGET" <<'PY'
import sys
path = sys.argv[1]
with open(path, encoding="utf-8") as fh:
    src = fh.read()

anchor = "function interpolateMessage(message, context) {"
if anchor not in src:
    print("[patch] ERROR: interpolateMessage anchor not found", file=sys.stderr)
    sys.exit(1)

helper = """function stripMarkdown(s) {
  if (typeof s !== "string") return s;
  return s
    .replace(/\\*\\*([^*]+)\\*\\*/g, "$1")
    .replace(/\\*([^*]+)\\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\\[([^\\]]+)\\]\\([^)]*\\)/g, "$1")
    .trim();
}
"""

before = "  const sessionTitle = context.sessionTitle || \"\";"
after = "  const sessionTitle = stripMarkdown(context.sessionTitle) || \"\";"
if before not in src:
    print("[patch] ERROR: sessionTitle line not found", file=sys.stderr)
    sys.exit(1)

src = src.replace(anchor, helper + anchor, 1)
src = src.replace(before, after, 1)

with open(path, "w", encoding="utf-8") as fh:
    fh.write(src)

print(f"[patch] applied stripMarkdown to {path}")
PY

node --check "$TARGET" && echo "[patch] SYNTAX-OK"
