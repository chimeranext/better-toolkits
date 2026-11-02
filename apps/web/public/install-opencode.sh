#!/usr/bin/env bash
# Install the better-toolkits layer for OpenCode (harness already installed).
# One-liner: curl -fsSL https://toolkits.chimeranext.dev/install-opencode.sh | bash
# What it does: adds the HTTP skills catalog to ~/.config/opencode/opencode.json
# and installs the hooks (stderr / bilingual / code-smells).
set -euo pipefail

CONFIG_DIR="${OPENCODE_CONFIG_DIR:-${HOME}/.config/opencode}"
CONFIG="${CONFIG_DIR}/opencode.json"
CATALOG="https://toolkits.chimeranext.dev/opencode/skills/"

echo "[opencode] config: ${CONFIG}"
mkdir -p "${CONFIG_DIR}"

# 1. Ensure the catalog URL is in the "skills" array (idempotent JSON edit).
if [ ! -f "${CONFIG}" ]; then
  printf '{\n  "$schema": "https://opencode.ai/config.json",\n  "skills": ["%s"]\n}\n' "${CATALOG}" > "${CONFIG}"
  echo "[opencode] created config with skills catalog"
else
  python3 - "${CONFIG}" "${CATALOG}" <<'PY'
import json, sys
path, url = sys.argv[1], sys.argv[2]
with open(path, encoding="utf-8") as fh:
    doc = json.load(fh)
skills = doc.get("skills") or []
if url not in skills:
    skills.append(url)
doc["skills"] = skills
with open(path, "w", encoding="utf-8") as fh:
    json.dump(doc, fh, indent=2)
    fh.write("\n")
PY
  echo "[opencode] skills catalog added to config"
fi

# 2. Hooks: install tool-use guards (stderr/bilingual fallback) via the shared script.
if [ -f "scripts/ci/install-tooluse-guards.sh" ]; then
  bash scripts/ci/install-tooluse-guards.sh
  echo "[opencode] tool-use guards installed"
else
  echo "[opencode] WARN: install-tooluse-guards.sh not found in cwd (run from repo root)"
fi

echo "[opencode] done. Restart OpenCode to load the catalog."
