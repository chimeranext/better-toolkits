---
description: "Mass-publish orchestrator — detects your project's framework + applicable stores, then runs the matching /ship-{framework} commands in sequence. Aggregates state across all child runs and produces a unified launch report. The 'ship anywhere we support' command."
argument-hint: "[--what-if | --resume | --skip ship-X[,ship-Y]]"
---
# /ship-everywhere

Read and follow [`references/ship-everywhere/protocol.md`](../references/ship-everywhere/protocol.md) (protocol SSOT). Behavior is unchanged — only structure moved for multi-harness reuse.

`$ARGUMENTS` are unchanged from the pre-split command.
