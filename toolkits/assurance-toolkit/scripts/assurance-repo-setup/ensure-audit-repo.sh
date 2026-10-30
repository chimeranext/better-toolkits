#!/usr/bin/env bash
# Verifies that the evidence destination repo exists (internal-audits policy).
# Non-blocking: emits a GAP if missing (setup must not fail because of this).
set -euo pipefail

AUDIT_REPO="${1:-chimeranext/internal-audits}"

# Capture (do not discard, do not silence): stdout to variable, stderr visible.
if AUDIT_OUT="$(gh api "repos/${AUDIT_REPO}")"; then
  echo "assurance-setup: audit repo OK: ${AUDIT_REPO}"
  exit 0
fi

cat >&2 <<EOF
[GAP] The evidence repo ${AUDIT_REPO} does not exist.
internal-audits policy (references/governance/protocol.md):
receipts do NOT live in the product repo. Create that private internal repo
(and configure the AUDIT_GIT_TOKEN secret) to persist evidence.
You may continue; the gate works the same, only evidence is not persisted.
EOF
exit 0
