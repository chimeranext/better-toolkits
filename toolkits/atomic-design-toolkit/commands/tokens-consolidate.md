---
description: "Extract design tokens from N repos/apps, flag where they diverge (never merge silently), propose a canonical set, and materialize a shared packages/tokens (tokens.css + tokens.ts + tailwind-preset.js) with a per-app migration plan that feeds /migrate."
argument-hint: "<path> [<path> ...] [:report] [:materialize]  e.g. ../app-a ../app-b, . ../other :report"
---
# /tokens-consolidate

Read and follow [`references/tokens-consolidate/protocol.md`](../references/tokens-consolidate/protocol.md) (protocol SSOT). Behavior is unchanged — only structure moved for multi-harness reuse.

`$ARGUMENTS` are unchanged from the pre-split command.
