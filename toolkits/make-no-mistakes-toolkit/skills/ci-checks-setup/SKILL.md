---
name: ci-checks-setup
description: 'Install/generate CI configuration from the canonical 10-phase check catalog (shared/references/ci/ci-checks.yml). Walks phases 1→10 in order, lists each phase''s core checks (always included) and asks whether to enable that phase''s opt-in checks, then emits the workflow set in phase order — only confirmed opt-in checks are ever added. Use when setting up CI on a new repo, adding the check catalog to an existing repo, or asking which CI checks should I have, armá el CI del repo, or instalá los checks. Companion tools: /ci-checks-verify (diagnose a failing check) and /ci-checks-audit (compare actual workflows vs the catalog).'
---
# /ci-checks-setup

Read and follow [`references/ci-checks-setup/protocol.md`](../references/ci-checks-setup/protocol.md) (protocol SSOT). Data source: [`shared/references/ci/ci-checks.yml`](../../../../shared/references/ci/ci-checks.yml) — the canonical 10-phase catalog.

`$ARGUMENTS` may carry opt-in confirmations (`--with <check>`) or a `--phase N` selector; otherwise the walk prompts per phase.
