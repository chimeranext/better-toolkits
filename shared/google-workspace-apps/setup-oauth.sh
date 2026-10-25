#!/usr/bin/env bash
# /google-workspace-oauth-setup — Script versionado (v1.0.0)
# NO es un "dumb prompt" de 4 inputs. Es flujo guiado con EVIDENCIA LEGAL primero.
# Fuente legal: Google APIs TOS (dev.google.com/terms, b. Confidential Matters)
# + OAuth 2.0 Policies (dev.google.com/identity/protocols/oauth2/policies)
# + rclone docs (rclone.org/drive/#making-your-own-client-id)

set -euo pipefail

echo "=========================================="
echo "  PARA QUÉ: este MCP (google-for-rclone) necesita un remote (gdrive)"
echo "  para que 'rclone copy <file> gdrive:<folder>' funcione. El remote"
echo "  requiere tu propio OAuth client_id (NO compartido, NO embebido)."
echo "  EVIDENCIA TOS: Google APIs Terms (dev.google.com/terms, b.1) + rclone docs."
echo "=========================================="
echo ""
echo "1. CREA TU PROPIO client_id (NO compartido, NO embebido):"
echo "   https://console.cloud.google.com/ → APIs & Services → Credentials"
echo "   → OAuth client ID → Desktop app"
echo ""
echo "2. HABILITA Google Drive API en tu proyecto"
echo ""
echo "3. CONFIGURA RCLONE (interactivo):"
echo "   rclone config"
echo ""
echo "4. VERIFICA:"
echo "   rclone lsf gdrive:"
echo ""
echo "5. CONFIGURA ENV (local, NO repo):"
echo "   export RCLONE_REMOTE=gdrive"
echo "   export GOOGLE_DRIVE_FOLDER_ID='<folder_id>'"
echo ""
echo "REFERENCIA: ./google-workspace-oauth-setup.md (evidencia TOS completa)"
echo "=========================================="

# Si falta .rclone-config.json o .config/rclone/rclone.conf, lanzar rclone config
CONFIG_JSON="$HOME/.rclone-config.json"
CONFIG_RCLONE="$HOME/.config/rclone/rclone.conf"

if [[ ! -f "$CONFIG_JSON" && ! -f "$CONFIG_RCLONE" ]]; then
  echo "[WARNING] No se encontró remote configurado. Lanzando rclone config..."
  "$HOME/.local/bin/rclone" config
fi

echo "Listo. Remote: ${RCLONE_REMOTE:-gdrive}"
