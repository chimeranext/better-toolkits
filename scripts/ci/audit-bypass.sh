#!/usr/bin/env bash
# Audit bypasses de gate — política internal-audits (ver
# toolkits/assurance-toolkit/references/governance/protocol.md).
#
# Detecta merges a main que pasaron por encima de un check fallido (bypass) y
# persiste un receipt en el repo interno privado internal-audits (push directo,
# sin PRs, fuera del ciclo de review).
#
# Prerrequisitos:
#   - gh autenticado (GITHUB_TOKEN) para leer PRs/checks del repo de producto.
#   - Secret AUDIT_GIT_TOKEN con permiso de push a AUDIT_REPO (default
#     chimeranext/internal-audits), solo si se desea persistir el receipt.
#
# Exit: 0 siempre (es auditor de evidencia, no gate de merge).
set -euo pipefail

PRODUCT_REPO="${GITHUB_REPOSITORY:?GITHUB_REPOSITORY required}"
SHA="${GITHUB_SHA:?GITHUB_SHA required}"
AUDIT_REPO="${AUDIT_REPO:-chimeranext/internal-audits}"
AUDIT_TOKEN="${AUDIT_GIT_TOKEN:-}"

# 1) PR(s) mergeados asociados a este commit
PRS="$(gh api "/repos/${PRODUCT_REPO}/commits/${SHA}/pulls" --jq '.[] | select(.merged_at != null) | .number' 2>/dev/null || true)"
if [ -z "$PRS" ]; then
  echo "audit-bypass: no merged PR for ${SHA}; nothing to audit"
  exit 0
fi

BYPASSED=0
for PR in $PRS; do
  HEAD_SHA="$(gh api "/repos/${PRODUCT_REPO}/pulls/${PR}" --jq '.head.sha')"
  CHECKS="$(gh api "/repos/${PRODUCT_REPO}/commits/${HEAD_SHA}/check-runs" --jq '.check_runs[] | select(.name=="megalinter") | .status+"/"+(.conclusion // "none")' 2>/dev/null || true)"
  echo "audit-bypass: PR #${PR} head=${HEAD_SHA} megalinter=${CHECKS:-n/a}"
  case "$CHECKS" in
    completed/failure|completed/action_required|in_progress/*|queued/*)
      BYPASSED=1 ;;
  esac
done

if [ "$BYPASSED" = "0" ]; then
  echo "audit-bypass: no bypass detected"
  exit 0
fi

# 2) generar receipt (inmutable, keyed por commit_sha)
TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
MONTH="$(date -u +%Y-%m)"
RECEIPT_DIR="evidence/receipts/governance/bypass-audit/${MONTH}"
RECEIPT_FILE="${RECEIPT_DIR}/${SHA}.json"
mkdir -p "$RECEIPT_DIR"
cat > "$RECEIPT_FILE" <<JSON
{
  "schema_version": 1,
  "type": "bypass_audit",
  "gate": "megalinter",
  "repo": "${PRODUCT_REPO}",
  "commit_sha": "${SHA}",
  "when": "${TS}",
  "verdict": "BYPASSED",
  "bypassed_check": "megalinter",
  "source": "workflow/bypass-audit.yml"
}
JSON

# 3) persistir en internal-audits
if [ -n "$AUDIT_TOKEN" ]; then
  TMP="$(mktemp -d)"
  trap 'rm -rf "$TMP"' EXIT
  git clone --depth 1 "https://x-access-token:${AUDIT_TOKEN}@github.com/${AUDIT_REPO}.git" "$TMP/audits"
  mkdir -p "$TMP/audits/$RECEIPT_DIR"
  cp "$RECEIPT_FILE" "$TMP/audits/$RECEIPT_DIR/"
  cd "$TMP/audits"
  git config user.name "opencode-bot"
  git config user.email "opencode-bot@users.noreply.github.com"
  git add .
  git commit -m "receipt: bypass megalinter ${SHA}" --allow-empty
  git push origin HEAD:main
  echo "audit-bypass: receipt pushed to ${AUDIT_REPO} -> ${RECEIPT_FILE}"
else
  echo "audit-bypass: WARN AUDIT_GIT_TOKEN not set; receipt NOT persisted (${RECEIPT_FILE})" >&2
fi
