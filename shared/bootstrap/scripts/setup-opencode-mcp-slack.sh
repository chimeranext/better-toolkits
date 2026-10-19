#!/usr/bin/env bash
#
# setup-opencode-mcp-slack.sh — pide SLACK_MCP_CLIENT_SECRET por diálogo GUI
# (estilo /secret-input: nunca queda en historial de terminal ni en el chat)
# y lo persiste con mode 0600.
#
# Uso:
#   setup-opencode-mcp-slack.sh            # persiste per-user (default, sin sudo)
#   setup-opencode-mcp-slack.sh --system   # persiste system-wide en
#                                          # /etc/profile.d (pide sudo vía GUI:
#                                          # run0 > pkexec > sudo)
#   setup-opencode-mcp-slack.sh --with-client-id
#                                          # además pide el Client ID en el mismo
#                                          # popup (zenity --forms) y lo imprime
#                                          # para `setup install --slack-client-id`
#
# Tras persistir: abrí una terminal nueva (o `source` el archivo) y corré
# `opencode mcp auth slack`.
#
# Ver playbook: shared/bootstrap/references/opencode-mcp-config/protocol.md
set -euo pipefail

SECRET_NAME="SLACK_MCP_CLIENT_SECRET"
USER_ENV_FILE="${XDG_CONFIG_HOME:-$HOME/.config}/opencode/mcp-secrets.env"
SYSTEM_ENV_FILE="/etc/profile.d/opencode-mcp.sh"
SYSTEM_MODE=0
WITH_CLIENT_ID=0

while [ $# -gt 0 ]; do
  case "${1:-}" in
    --system) SYSTEM_MODE=1; shift ;;
    --with-client-id) WITH_CLIENT_ID=1; shift ;;
    *) printf 'ERROR: unknown flag %s\n' "$1" >&2; exit 64 ;;
  esac
done

need() { _need_bin="$(command -v "$1")" && [ -n "$_need_bin" ]; }

prompt_secret() {
  local secret=""
  if [ "$WITH_CLIENT_ID" = "1" ]; then
    # zenity --forms supports multiple text boxes in one popup.
    local result=""
    if need zenity; then
      result="$(zenity --forms \
        --title="OpenCode Slack MCP" \
        --text="Pega el Client ID y el Client Secret de tu Slack app (api.slack.com/apps → Basic Information → App Credentials):" \
        --add-entry="Client ID" \
        --add-entry="Client Secret" \
        --ok-label="Guardar" --cancel-label="Cancelar")" || return 1
    elif need kdialog; then
      # kdialog has no multi-field form; fall back to two sequential prompts.
      local cid sec
      cid="$(kdialog --inputbox "Pega el Client ID de tu Slack app:" --title "OpenCode Slack MCP")" || return 1
      sec="$(kdialog --password "Pega el Client Secret de tu Slack app:" --title "OpenCode Slack MCP")" || return 1
      result="${cid}|${sec}"
    else
      printf 'zenity/kdialog no encontrados. Leo en terminal sin echo.\n' >&2
      printf 'Client ID: ' >&2
      IFS= read -r _cid || return 1
      printf 'Client Secret (no se muestra): ' >&2
      IFS= read -rs _sec || return 1
      printf '\n' >&2
      result="${_cid}|${_sec}"
    fi
    if [ -z "$result" ]; then
      printf 'ERROR: cancelado.\n' >&2
      return 1
    fi
    # zenity --forms separates fields with '|'.
    CLIENT_ID_OUT="${result%%|*}"
    secret="${result#*|}"
    if [ -z "$secret" ]; then
      printf 'ERROR: secret vacío, cancelado.\n' >&2
      return 1
    fi
    printf '%s' "$secret"
    return 0
  fi

  # Secret-only (original behaviour).
  if need zenity; then
    secret="$(zenity --password \
      --title="OpenCode Slack MCP" \
      --text="Pega el Client Secret de tu Slack app (api.slack.com/apps → Basic Information → App Credentials → Client Secret):" \
      --ok-label="Guardar" --cancel-label="Cancelar")" || return 1
  elif need kdialog; then
    secret="$(kdialog --password "Pega el Client Secret de tu Slack app:" \
      --title "OpenCode Slack MCP")" || return 1
  else
    printf 'zenity/kdialog no encontrados. Leo en terminal sin echo.\n' >&2
    printf 'Pega el Client Secret (no se muestra): ' >&2
    IFS= read -rs secret || return 1
    printf '\n' >&2
  fi
  if [ -z "$secret" ]; then
    printf 'ERROR: secret vacío, cancelado.\n' >&2
    return 1
  fi
  printf '%s' "$secret"
}

elevate_install() {
  # $1 = archivo temporal (600, del usuario), $2 = destino
  local tmp="$1" dest="$2"
  if need run0; then
    run0 install -m 600 "$tmp" "$dest"
  elif need pkexec; then
    pkexec install -m 600 "$tmp" "$dest"
  else
    printf 'run0/pkexec no disponibles, uso sudo en terminal.\n' >&2
    sudo install -m 600 "$tmp" "$dest"
  fi
}

persist_user() {
  local secret="$1"
  local dir
  dir="$(dirname "$USER_ENV_FILE")"
  mkdir -p "$dir"
  # %q escapa el valor para re-sourcing seguro (maneja comillas, $, etc.)
  printf "export %s=%q\n" "$SECRET_NAME" "$secret" > "$USER_ENV_FILE.tmp"
  chmod 600 "$USER_ENV_FILE.tmp"
  mv "$USER_ENV_FILE.tmp" "$USER_ENV_FILE"
  printf 'Guardado en %s (mode 0600).\n' "$USER_ENV_FILE"

  # Auto-source desde la shell interactiva (idempotente).
  for rc in "$HOME/.bashrc" "$HOME/.zshrc"; do
    if [ -f "$rc" ] && ! grep -qF "mcp-secrets.env" "$rc" 2>&1; then
      printf '\n# OpenCode MCP secrets (ver better-toolkits: opencode-mcp-config)\n[ -f "%s" ] && source "%s"\n' \
        "$USER_ENV_FILE" "$USER_ENV_FILE" >> "$rc"
      printf 'Agregado source en %s.\n' "$rc"
    fi
  done
}

persist_system() {
  local secret="$1" tmp
  tmp="$(mktemp)"
  chmod 600 "$tmp"
  printf "export %s=%q\n" "$SECRET_NAME" "$secret" > "$tmp"
  elevate_install "$tmp" "$SYSTEM_ENV_FILE"
  if need shred; then shred -u "$tmp"; else rm -f "$tmp"; fi
  printf 'Guardado system-wide en %s (mode 0600, root).\n' "$SYSTEM_ENV_FILE"
  printf 'Aplica a shells de login nuevas. Tu shell actual: source %s\n' "$SYSTEM_ENV_FILE"
}

main() {
  printf 'OpenCode Slack MCP — setup del Client ID + Client Secret\n'
  printf 'Fuente: Basic Information → App Credentials (NO Signing Secret).\n'
  local secret
  secret="$(prompt_secret)" || exit 1
  if [ "$SYSTEM_MODE" = "1" ]; then
    persist_system "$secret"
  else
    persist_user "$secret"
  fi
  secret=""
  if [ "$WITH_CLIENT_ID" = "1" ] && [ -n "${CLIENT_ID_OUT:-}" ]; then
    printf '\nClient ID capturado (pasalo a setup install --slack-client-id):\n'
    printf '  %s\n' "$CLIENT_ID_OUT"
  fi
  printf '\nPróximo paso (terminal nueva o tras source):\n'
  printf '  opencode mcp logout slack && opencode mcp auth slack\n'
  printf 'Verificar: opencode mcp list   # ✓ slack  connected (OAuth)\n'
}

main "$@"
