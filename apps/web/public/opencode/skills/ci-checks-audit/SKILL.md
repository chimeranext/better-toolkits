---
name: ci-checks-audit
description: 'Audit a repository''s actual CI jobs (.github/workflows/) against the canonical 10-phase catalog (shared/references/ci/ci-checks.yml). Reports missing required (core) checks, extra/unnamed jobs, duplicate check-runs on the same head, and naming violations (verb-type-subject). Read-only — never edits workflows. Use when checking CI coverage or gaps — what checks am I missing, audit my CI, duplicados en CI, or qué checks me faltan. Companion tools: /ci-checks-setup (install/generate) and /ci-checks-verify (diagnose a failing check).'
---
# /ci-checks-audit

Read and follow [`references/ci-checks-audit/protocol.md`](../references/ci-checks-audit/protocol.md) (protocol SSOT). Data source: [`shared/references/ci/ci-checks.yml`](../../../../shared/references/ci/ci-checks.yml).

`$ARGUMENTS` may select a workflow dir (`--workflows <dir>`, default `.github/workflows`).
