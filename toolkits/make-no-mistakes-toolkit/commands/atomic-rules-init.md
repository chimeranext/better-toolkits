---
description: Scaffold a .atomic-design-rules.json at the current repo root so the make-no-mistakes atomic-design hooks (PreToolUse ownership enforcement + PostToolUse drift telemetry) start enforcing for this repo. No-op if the file already exists.
priority: 60
---
# /atomic-rules-init

Read and follow [`references/atomic-rules-init/protocol.md`](../references/atomic-rules-init/protocol.md) (protocol SSOT). Behavior is unchanged — only structure moved for multi-harness reuse.

`$ARGUMENTS` are unchanged from the pre-split command.
