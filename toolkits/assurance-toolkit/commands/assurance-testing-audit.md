---
description: Audit whether the repo's testing framework(s) are wired into the assurance evidence pipeline (mobile: Maestro/MobileWright/Qualflare; web: Playwright/Cypress/Vitest; API: Schemathesis/Pact). Static scan + minimal probe. Accepts a repo path as $ARGUMENTS.
priority: 35
---
# /assurance-testing-audit

Read and follow [`references/testing/assurance-testing-audit/protocol.md`](../references/testing/assurance-testing-audit/protocol.md) (protocol SSOT).

`$ARGUMENTS` is the repo path to audit (default: current directory).

This command audits which testing framework(s) the repo uses and whether the adapter evidence
pipeline is wired. It does not execute the suites (use `/assurance:e2e-test-runner`).
