---
description: "Bootstrap better-toolkits marketplace and harness wiring (Cursor, Claude, OpenCode). HITL: detect → audit → propose → ask → install → verify. Accepts optional harness hint as $ARGUMENTS."
priority: 5
---
# /toolkits-initial-setup

Read and follow [`references/toolkits-initial-setup/protocol.md`](../references/toolkits-initial-setup/protocol.md) (protocol SSOT).

`$ARGUMENTS` may narrow the harness (`cursor`, `claude`, `opencode`) or list product toolkit names to install after bootstrap. When empty, detect all active harnesses.

Flags: `--expert-mode` (author flow — never switch the clone's branch, leave a dirty tree alone; default is consumer, always `main`) and `--no-auto-update` (skip the auto-update plugin).

**Not** a make-no-mistakes product command — this lives in `shared/bootstrap/`, not `toolkits/make-no-mistakes-toolkit/`.
