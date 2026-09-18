---
description: Run one command with admin rights through the OS-native auth dialog — pkexec on Ubuntu/Linux, osascript with administrator privileges on macOS, Start-Process -Verb RunAs on Windows UAC. Warms up with a no-op, confirms once, logs everything. Takes $ARGUMENTS as the command to elevate (--check for warmup-only).
priority: 80
---

# /admin-rights

Read and follow [`references/admin-rights/protocol.md`](../references/admin-rights/protocol.md) (protocol SSOT).

`$ARGUMENTS` unchanged from the upstream protocol (the command to elevate, or `--check` for warmup-only).
