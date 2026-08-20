---
description: "Guided .NET MAUI multi-target shipping — build signed Android AAB + iOS IPA + Windows MSIX (delegates to /ship-msstore for Microsoft Store) + optional macOS pkg, prepare per-store listings, and submit. 5 gates with persistent checkpoints."
argument-hint: "[--what-if | --gate N | --resume | --target android,ios,windows,maccatalyst]"
---
# /ship-maui

Read and follow [`references/ship-maui/protocol.md`](../references/ship-maui/protocol.md) (protocol SSOT). Behavior is unchanged — only structure moved for multi-harness reuse.

`$ARGUMENTS` are unchanged from the pre-split command.
