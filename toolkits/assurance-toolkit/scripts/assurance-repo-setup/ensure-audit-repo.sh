#!/usr/bin/env bash
# Verifica que exista el repo destino de evidencia (política internal-audits).
# No bloquea: emite GAP si falta (el setup no debe fallar por esto).
set -euo pipefail

AUDIT_REPO="${1:-chimeranext/internal-audits}"

if gh api "repos/${AUDIT_REPO}" >/dev/null 2>&1; then
  echo "assurance-setup: audit repo OK: ${AUDIT_REPO}"
  exit 0
fi

cat >&2 <<EOF
[GAP] No existe el repo de evidencia ${AUDIT_REPO}.
Politica internal-audits (references/governance/protocol.md):
los receipts NO viven en el repo de producto. Crea ese repo interno privado
(y configura el secret AUDIT_GIT_TOKEN) para persistir evidencia.
Puedes continuar; el gate funciona igual, solo que la evidencia no se persiste.
EOF
exit 0
