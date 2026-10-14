---
description: Execute E2E tests from a test-suite.json file. Selects the optimal runner for each scenario, produces immutable result files, and optionally reports to Linear or Markdown. Accepts a path to test-suite.json or a jq filter as $ARGUMENTS.
priority: 30
---
# /assurance:e2e-test-runner

Read and follow [`references/e2e-test-runner/protocol.md`](../references/e2e-test-runner/protocol.md).

This command executes an existing suite. It does not generate it (`/assurance:e2e-test-builder`) and it does not open the Qt preview (`/assurance:e2e-test-preview`).

`$ARGUMENTS` is a path to `test-suite.json` or a jq filter.
