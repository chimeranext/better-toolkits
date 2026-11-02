# Makefile — thin ergonomic wrapper for /toolkits-initial-setup (per-phase).
#
# NOT an orchestrator replacement: the phases require runtime harness detection
# and HITL confirmation. This file only aliases the existing CLI/scripts so you
# can drive them phase-by-phase, with a UI prompt between phases (`make setup`).
#
# Usage:
#   make phase-audit            # run one phase
#   make setup                  # run all phases, prompting between each
#   make doctor                  # health check
#
# Requires: bash + node (the happy-toolkits CLI). Platform note: Unix/POSIX
# shell (the protocol also ships PowerShell `.ps1` scripts for Windows).

SHELL := bash
BETTER := node shared/bootstrap/cli/bin/better-toolkits.js
PROMPT := bash shared/bootstrap/scripts/make-prompt.sh
HARNESS ?=

.PHONY: help setup doctor verify phase-detect phase-audit phase-propose phase-install phase-verify

help:
	@echo "targets: setup, doctor, verify, phase-detect, phase-audit, phase-propose, phase-install, phase-verify"

# --- Phase targets (thin wrappers over the CLI/scripts) ---

phase-detect:
	@echo "[phase 1] detectar harnesses (HARNESS='$(HARNESS)')"
	@test -n "$(HARNESS)" && echo "  harness fijado: $(HARNESS)" || echo "  auto-detección la hace el CLI en audit/install"

phase-audit:
	@echo "[phase 2] audit (read-only)"
	$(BETTER) setup --phases audit --harness $(HARNESS)

phase-propose:
	@echo "[phase 3] propose — revisa los diffs propuestos (HITL)"
	@echo "  (el pat actual es el CLI `setup`; la propuesta la revisa el humano)"

phase-install:
	@echo "[phase 5] install"
	$(BETTER) setup --phases install --harness $(HARNESS)

phase-verify:
	@echo "[phase 6] verify"
	$(BETTER) setup --phases verify --harness $(HARNESS)

doctor:
	$(BETTER) doctor

verify: phase-verify

# --- Full run: phases in order with a UI prompt between each ---

setup:
	@h=""; \
	for ph in detect audit propose install verify; do \
	  $(MAKE) phase-$$ph || exit 1; \
	  [ "$$ph" = "verify" ] || $(PROMPT) "tras fase $$ph" || exit 1; \
	done; \
	echo "bootstrap completo"
