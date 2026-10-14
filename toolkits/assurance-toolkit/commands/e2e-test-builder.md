---
description: Generate or update a TestSprite-compatible test-suite.json from use case documentation. Accepts a URL or file path as $ARGUMENTS.
priority: 30
---
# /assurance:e2e-test-builder

Read and follow [`references/e2e-test-builder/protocol.md`](../references/e2e-test-builder/protocol.md).

This command writes the suite. It does not execute it (`/assurance:e2e-test-runner`) and it does not open the Qt preview (`/assurance:e2e-test-preview`).

`$ARGUMENTS` is the use-case source (URL or file path).
