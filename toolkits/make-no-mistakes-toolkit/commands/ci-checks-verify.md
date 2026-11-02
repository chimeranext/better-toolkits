---
description: "Diagnose a named failing CI check — resolve in the catalog, run/query the real check, return cause + ranked actionables (never asserts without evidence)."
argument-hint: "<check-name> [--pr N]"
priority: 60
---
# /ci-checks-verify

Read and follow [`references/ci-checks-verify/protocol.md`](../references/ci-checks-verify/protocol.md) (protocol SSOT). Data source: [`shared/references/ci/ci-checks.yml`](../../../shared/references/ci/ci-checks.yml).

`$ARGUMENTS` must include the failing check name.
