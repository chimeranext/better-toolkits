# Makefile — thin ergonomic wrapper for /toolkits-initial-setup (per-phase).
#
# NOT an orchestrator replacement: phases need runtime harness detection + HITL.
# This aliases the existing CLI/scripts. It does NOT fuse the two protocol parts:
#   - Part L (LOCAL, dev machine): harness detect/audit/propose/install/verify.
#   - Part R (REPO, remote/protection): GGT audit + policy provisioning (admin).
# REPO targets are never part of `setup`; they are explicit and permission-gated.
#
# Usage:
#   make setup            # Part L only, prompting between phases
#   make local-audit      # one Part L phase
#   make repo-audit       # Part R: read-only GGT audit
#   make repo-setup       # Part R: provision protection (requires admin + gh)
#   make doctor
#
# Platform: POSIX (bash + node). Windows twin: Makefile.windows (PowerShell).

SHELL := bash
BETTER := node shared/bootstrap/cli/bin/better-toolkits.js
PROMPT := bash shared/bootstrap/scripts/make-prompt.sh
HARNESS ?=
REPO ?= $(shell gh repo view --json nameWithOwner -q .nameWithOwner)

.PHONY: help setup doctor verify \
        local-detect local-audit local-propose local-install local-verify \
        repo-audit repo-setup

help:
	@echo "LOCAL (Part L): setup, local-detect, local-audit, local-propose, local-install, local-verify, doctor"
	@echo "REPO (Part R): repo-audit (read-only), repo-setup (requiere admin y gh)"

# ============================ Part L — LOCAL (dev machine) ============================

local-detect:
	@echo "[Part L][phase 1] detectar harnesses (HARNESS='$(HARNESS)')"
	@test -n "$(HARNESS)" && echo "  harness fijado: $(HARNESS)" || echo "  auto-detección: la hace el CLI en audit/install"

local-audit:
	@echo "[Part L][phase 2] audit (read-only)"
	$(BETTER) setup --phases audit --harness $(HARNESS)

local-propose:
	@echo "[Part L][phase 3] propose — revisa los diffs propuestos (HITL)"

local-install:
	@echo "[Part L][phase 5] install"
	$(BETTER) setup --phases install --harness $(HARNESS)

local-verify:
	@echo "[Part L][phase 6] verify"
	$(BETTER) setup --phases verify --harness $(HARNESS)

doctor:
	$(BETTER) doctor

verify: local-verify

# Chain Part L phases in order, prompting the user between each phase.
setup:
	@for ph in detect audit propose install verify; do \
	  $(MAKE) local-$$ph || exit 1; \
	  [ "$$ph" = "verify" ] || $(PROMPT) "tras fase $$ph" || exit 1; \
	done; \
	echo "bootstrap LOCAL completo"

# ============================ Part R — REPO (remote/protection) ============================
# Explicit, separate, and HITL-gated. Never pulled in by `setup`.

repo-audit:
	@test -n "$(REPO)" || { echo "define REPO=owner/repo (o necesitas gh)"; exit 1; }
	@echo "[Part R] audit GGT (read-only) — repo $(REPO)"
	bash scripts/ci/audit-repo-gitflow.sh --repo $(REPO)

repo-setup: repo-audit
	@echo "[Part R] provisioning de protección (ruleset/GGT/CODEOWNERS) — requiere admin"
	$(PROMPT) "aplicar políticas REPO (admin)"
	bash toolkits/assurance-toolkit/scripts/assurance-repo-setup/ensure-rule-set.sh
	bash toolkits/assurance-toolkit/scripts/assurance-repo-setup/ensure-audit-repo.sh
