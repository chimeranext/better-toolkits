---
description: Launch a Qt-based visual previewer for test-suite.json files. Auto-detects the suite in the current project, ensures PySide6 is installed, and opens an interactive table with filtering, detail pane, and CSV export. Accepts an optional path as $ARGUMENTS.
priority: 30
---
# /assurance:e2e-test-preview

Read and follow [`references/e2e-test-preview/protocol.md`](../references/e2e-test-preview/protocol.md).

This command opens the Qt preview of an existing suite. It does not generate it (`/assurance:e2e-test-builder`) and it does not execute it (`/assurance:e2e-test-runner`).

`$ARGUMENTS` is an optional path to `test-suite.json`.
