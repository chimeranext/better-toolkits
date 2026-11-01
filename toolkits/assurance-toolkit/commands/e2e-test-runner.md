---
description: Execute E2E tests from a test-suite.json file. Selects the optimal runner for each scenario, produces immutable result files, and optionally reports to Linear or Markdown. Accepts a path to test-suite.json or a jq filter as $ARGUMENTS.
priority: 30
---
# /assurance:e2e-test-runner

Read and follow [`references/e2e-test-runner/protocol.md`](../references/e2e-test-runner/protocol.md).

This command executes an existing suite. It does not generate it (`/assurance:e2e-test-builder`) and it does not open the Qt preview (`/assurance:e2e-test-preview`).

`$ARGUMENTS` is a path to `test-suite.json` or a jq filter.

### Storybook interaction testing

If a runner is `storybook` (or a component runner), execute the suite's `play`
functions / interaction tests. **BDD always comes first**: each Storybook interaction
test must correspond to a BDD scenario (Given/When/Then) already declared in the
`test-suite.json` / OpenSpec. Do not treat a Storybook test as evidence of behavior
unless it implements a declared `Then` assertion. Example:

```bash
# run the Storybook interaction tests for the suite's component scenarios
npx storybook test-runner --json --output-file results/storybook.json
```
