---
description: "Guided Flathub shipping for Linux desktop apps — author a flatpak-builder manifest + AppStream metainfo, generate offline Node/Rust sources, build & smoke-test locally in a sandbox, and submit via GitHub PR to flathub/flathub. 5 gates with persistent checkpoints. Pair with /ship-snap for maximum Linux reach."
argument-hint: "[--what-if | --gate N | --resume]"
---
# /ship-flatpak

Read and follow [`references/ship-flatpak/protocol.md`](../references/ship-flatpak/protocol.md) (protocol SSOT). Behavior is unchanged — only structure moved for multi-harness reuse.

`$ARGUMENTS` are unchanged from the pre-split command.
