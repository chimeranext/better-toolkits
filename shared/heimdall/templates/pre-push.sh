#!/usr/bin/env bash
# pre-push hook instalado por `heimdall-review install --with-hook`.
#
# Corre el review local de Heimdall sobre el diff de la rama ANTES de cada
# push y pregunta si continuar. Es opt-in y no bloquea por sí solo: si el review
# falla por config (p.ej. falta NVIDIA_API_KEY) o el usuario responde "n", aborta
# el push con exit ≠ 0; en cualquier otro caso lo deja seguir.
#
# Para saltarlo puntualmente:  git push --no-verify
set -euo pipefail

# Si no hay TTY (push automatizado/CI), no interrumpas: dejá pasar.
if [ ! -t 1 ]; then
  exit 0
fi

echo "[heimdall pre-push] corriendo review local del diff…"

HEIMDALL_BIN="$(command -v heimdall-review)"
if [ -n "$HEIMDALL_BIN" ]; then
  REVIEW_CMD=("$HEIMDALL_BIN" diff)
else
  REVIEW_CMD=(bunx github:chimeranext/heimdall@main review diff)
fi

INFISICAL_BIN="$(command -v infisical)"
if [ -n "$INFISICAL_BIN" ]; then
  "$INFISICAL_BIN" run -- "${REVIEW_CMD[@]}" || {
    echo "[heimdall pre-push] el review falló (¿NVIDIA_API_KEY?). Push abortado." >&2
    exit 1
  }
else
  echo "[heimdall pre-push] 'infisical' no está en PATH; asegurate de exportar NVIDIA_API_KEY." >&2
  "${REVIEW_CMD[@]}" || {
    echo "[heimdall pre-push] el review falló. Push abortado." >&2
    exit 1
  }
fi

printf "[heimdall pre-push] ¿continuar con el push? [y/N] "
read -r answer </dev/tty || answer=""
case "$answer" in
  y | Y | yes | YES) exit 0 ;;
  *)
    echo "[heimdall pre-push] push cancelado por el usuario."
    exit 1
    ;;
esac
