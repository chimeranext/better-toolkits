---
description: "Install/generate CI checks from the canonical 10-phase catalog — walks phases 1→10, core always included, opt-in only on confirmation, emits the workflow set in phase order."
argument-hint: "[--with <check> ...] [--phase N] [--out <dir>]"
priority: 60
---
# /ci-checks-setup

Read and follow [`references/ci-checks-setup/protocol.md`](../references/ci-checks-setup/protocol.md) (protocol SSOT). Data source: [`shared/references/ci/ci-checks.yml`](../../../shared/references/ci/ci-checks.yml).

The walk is interactive per phase unless `--with <check>` supplies explicit opt-in confirmations.
