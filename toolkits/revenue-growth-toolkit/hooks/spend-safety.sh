#!/bin/bash
# AAARRR Flywheel — Spend Safety Hook
# Detecta llamadas Graph API que crean/modifican assets pagables.
# Emite warning a stderr (que Claude ve y eleva al usuario para confirmación).
# Nunca bloquea — solo flag.

set -uo pipefail

TOOL_INPUT="${1:-}"

# 1) Detectar writes a Meta Graph API
if echo "$TOOL_INPUT" | grep -qE "graph\.facebook\.com"; then
  if echo "$TOOL_INPUT" | grep -qE "(POST|DELETE|PUT|PATCH)"; then
    # Diferenciar por tipo de asset
    if echo "$TOOL_INPUT" | grep -qE "/campaigns([^/]|$)|/adsets([^/]|$)|/ads([^/]|$)|/adcreatives|/customaudiences"; then
      echo "⚠️  AAARRR Safety: Graph API write a campaña/adset/ad/audience detectado." >&2
      echo "    → Confirma con el usuario antes de ejecutar. Las campañas deben crearse PAUSED." >&2
    fi
    # Detectar cambios de status=ACTIVE (lo más sensible: empieza a gastar)
    if echo "$TOOL_INPUT" | grep -qE "status=ACTIVE|\"status\":\s*\"ACTIVE\""; then
      echo "🚨 AAARRR Safety: Activación detectada (status=ACTIVE)." >&2
      echo "    → Esta acción inicia gasto. Confirma explícitamente con el usuario." >&2
    fi
    # Detectar daily_budget changes
    if echo "$TOOL_INPUT" | grep -qE "daily_budget=|\"daily_budget\":"; then
      echo "💰 AAARRR Safety: Cambio de daily_budget detectado." >&2
      echo "    → Verifica que el nuevo budget esté dentro de max_daily_spend en settings.json." >&2
    fi
  fi
fi

# 2) Detectar lecturas que indican el agente está investigando antes de gastar — no flag, solo informativo
if echo "$TOOL_INPUT" | grep -qE "graph\.facebook\.com.*insights"; then
  : # silent — read-only, no warning
fi

# Siempre exit 0 para no bloquear nunca
exit 0
