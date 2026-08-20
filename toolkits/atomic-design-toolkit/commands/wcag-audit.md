---
description: "Audit a web/Flutter UI for WCAG 2.2 AA conformance (Layer A) and design quality / anti-AI-slop (Layer B). Scores five dimensions 0-4 → /20 with P0-P3 severity, cites file:line + the exact WCAG success criterion, and optionally emits a report that feeds /migrate."
argument-hint: "[:stack] [:runtime] [:wcag|:design-quality] [:report]  e.g. :vite, :runtime, :wcag:report, :vite:runtime:report"
---
# /wcag-audit

Read and follow [`references/wcag-audit/protocol.md`](../references/wcag-audit/protocol.md) (protocol SSOT). Behavior is unchanged — only structure moved for multi-harness reuse.

`$ARGUMENTS` are unchanged from the pre-split command.
