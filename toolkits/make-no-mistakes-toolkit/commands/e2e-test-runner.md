---
description: Execute E2E tests from a test-suite.json file. Selects the optimal runner for each scenario, produces immutable result files, and optionally reports to Linear or Markdown. Accepts a path to test-suite.json or a jq filter as $ARGUMENTS.
priority: 30
---
# /e2e-test-runner

Read and follow [`references/e2e-test-runner/protocol.md`](../references/e2e-test-runner/protocol.md) (protocol SSOT). Behavior is unchanged — only structure moved for multi-harness reuse.

`$ARGUMENTS` are unchanged from the pre-split command.
