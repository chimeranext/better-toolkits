---
description: "Guided Snap Store shipping for Linux desktop apps — author snapcraft.yaml, build via LXD/Multipass, register name on snapcraft.io, publish through edge/beta/candidate/stable channels, set visibility (public/unlisted/private). Persistent checkpoints across the lifecycle."
argument-hint: "[--what-if | --gate N | --resume | --channel edge|beta|candidate|stable]"
---
# /ship-snap

Read and follow [`references/ship-snap/protocol.md`](../references/ship-snap/protocol.md) (protocol SSOT). Behavior is unchanged — only structure moved for multi-harness reuse.

`$ARGUMENTS` are unchanged from the pre-split command.
