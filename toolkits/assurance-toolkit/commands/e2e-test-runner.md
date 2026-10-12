---
description: Execute E2E tests from a test-suite.json file. Selects the optimal runner for each scenario, produces immutable result files, and optionally reports to Linear or Markdown. Accepts a path to test-suite.json or a jq filter as $ARGUMENTS.
priority: 30
---
# /e2e-test-runner

Read and follow [`references/testing/protocol.md`](../references/testing/protocol.md) (protocol SSOT). Migrated from make-no-mistakes-toolkit; behavior unchanged.

`$ARGUMENTS` are unchanged from the pre-move command.
