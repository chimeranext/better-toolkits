#!/usr/bin/env bash
# Thin UI prompt for the initial-setup Makefile (between phases).
# Usage: make-prompt.sh "<label>" [yes]
# Returns 0 = continue, 1 = abort.
set -u

label="${1:-continuar}"
auto="${2:-}"

if [ "$auto" = "yes" ]; then
  exit 0
fi

read -r -p "[make] ${label} — ¿continuar? [s/N]: " ans
case "$ans" in
  s|S|y|Y) exit 0 ;;
  *) echo "abortado por el usuario"; exit 1 ;;
esac
