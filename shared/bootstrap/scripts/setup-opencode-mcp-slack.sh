#!/usr/bin/env bash
#
# setup-opencode-mcp-slack.sh — pide SLACK_MCP_CLIENT_SECRET (y opcionalmente el
# Client ID) por diálogo GUI (estilo /secret-input: nunca queda en historial de
# terminal ni en el chat) y lo persiste con mode 0600.
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
CLIENT_ID_OUT=""

while [ $# -gt 0 ]; do
  case "${1:-}" in
    --system) SYSTEM_MODE=1; shift ;;
    --with-client-id) WITH_CLIENT_ID=1; shift ;;
    *) printf 'ERROR: unknown flag %s\n' "$1" >&2; exit 64 ;;
  esac
done

need() { _need_bin="$(command -v "$1")" && [ -n "$_need_bin" ]; }

detect_platform() {
  case "$(uname -s || printf '')" in
    Darwin*) printf 'macos' ;;
    MINGW*|MSYS*|CYGWIN*) printf 'windows' ;;
    *)
      if [ -n "${WSL_DISTRO_NAME:-}" ] || [ -n "${WSL_INTEROP:-}" ]; then
        printf 'linux'
      elif need powershell.exe; then
        printf 'windows'
      else
        printf 'linux'
      fi
      ;;
  esac
}
PLATFORM="$(detect_platform)"

# Prompt de un solo campo. Imprime el valor en stdout; retorna 1 si cancela/vacío.
# $1 = title, $2 = text, $3 = "hidden" (1) o "plain" (0).
gui_prompt_single() {
  local title="$1" text="$2" hidden="${3:-0}" value=""
  case "$PLATFORM" in
    macos)
      if need osascript; then
        if [ "$hidden" = "1" ]; then
          value="$(osascript -e "display dialog \"${text}\" with title \"${title}\" default answer \"\" with hidden answer" \
            -e 'text returned of result')" || return 1
        else
          value="$(osascript -e "display dialog \"${text}\" with title \"${title}\" default answer \"\"" \
            -e 'text returned of result')" || return 1
        fi
      else
        return 1
      fi
      ;;
    windows)
      if need powershell.exe; then
        value="$(powershell.exe -NoProfile -Command "
          Add-Type -AssemblyName Microsoft.VisualBasic
          [Microsoft.VisualBasic.Interaction]::InputBox('${text}','${title}','') ")" || return 1
      else
        return 1
      fi
      ;;
    *)
      # Linux: zenity (GUI) o kdialog (KDE).
      if need zenity; then
        if [ "$hidden" = "1" ]; then
          value="$(zenity --password --title="$title" --text="$text" \
            --ok-label="Guardar" --cancel-label="Cancelar")" || return 1
        else
          value="$(zenity --entry --title="$title" --text="$text" \
            --ok-label="Guardar" --cancel-label="Cancelar")" || return 1
        fi
      elif need kdialog; then
        if [ "$hidden" = "1" ]; then
          value="$(kdialog --password "$text" --title "$title")" || return 1
        else
          value="$(kdialog --inputbox "$text" --title "$title")" || return 1
        fi
      else
        return 1
      fi
      ;;
  esac
  if [ -z "$value" ]; then
    return 1
  fi
  printf '%s' "$value"
}

# Prompt del secret (y del Client ID si --with-client-id).
# Imprime el secret en stdout. Si --with-client-id, setea CLIENT_ID_OUT.
prompt_secret() {
  local secret="" result=""

  if [ "$WITH_CLIENT_ID" = "1" ]; then
    # Preferir zenity --forms (un solo popup con ambos campos). Fallback a dos
    # prompts secuenciales en macOS/Windows/terminal.
    if need zenity; then
      result="$(zenity --forms \
        --title="OpenCode Slack MCP" \
        --text="Pega el Client ID y el Client Secret de tu Slack app (api.slack.com/apps → Basic Information → App Credentials):" \
        --add-entry="Client ID" \
        --add-entry="Client Secret" \
        --ok-label="Guardar" --cancel-label="Cancelar")" || return 1
      CLIENT_ID_OUT="${result%%|*}"
      secret="${result#*|}"
    else
      # kdialog / macOS / Windows / terminal: dos prompts secuenciales.
      CLIENT_ID_OUT="$(gui_prompt_single "OpenCode Slack MCP" "Pega el Client ID de tu Slack app (api.slack.com/apps → Basic Information → App Credentials):" 0)" || return 1
      secret="$(gui_prompt_single "OpenCode Slack MCP" "Pega el Client Secret de tu Slack app:" 1)" || return 1
    fi
    if [ -z "$secret" ]; then
      printf 'ERROR: secret vacío, cancelado.\n' >&2
      return 1
    fi
    printf '%s' "$secret"
    return 0
  fi

  # Secret-only (comportamiento original).
  secret="$(gui_prompt_single "OpenCode Slack MCP" "Pega el Client Secret de tu Slack app (api.slack.com/apps → Basic Information → App Credentials → Client Secret):" 1)" || return 1
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
    if [ -f "$rc" ] && ! grep -qF "mcp-secrets.env" "$rc"; then
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
