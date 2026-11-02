---
name: ci-checks-verify
disable-model-invocation: true
description: 'Diagnose a named failing CI check. Resolves the check in the canonical catalog (shared/references/ci/ci-checks.yml), runs or queries the real check (e.g. gh pr checks, gh run view, or the check''s own runner script), and returns the cause plus ranked actionables, backed by observable evidence. Invoke explicitly as /ci-checks-verify <check-name>. Companion tools: /ci-checks-setup (install/generate) and /ci-checks-audit (compare actual workflows vs the catalog).'
---
# /ci-checks-verify

Read and follow [`references/ci-checks-verify/protocol.md`](../references/ci-checks-verify/protocol.md) (protocol SSOT). Data source: [`shared/references/ci/ci-checks.yml`](../../../../shared/references/ci/ci-checks.yml).

`$ARGUMENTS` must include the failing check name (e.g. `/ci-checks-verify check-skills-catalog`).
