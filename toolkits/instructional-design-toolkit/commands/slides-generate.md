---
description: Generate a slide deck from a video brief
arguments:
  - name: video-brief-path
    description: Path to the video brief markdown file
    required: true
  - name: theme
    description: "Theme variant: light (default, for video recording) or dark (for platform/social)"
    required: false
    default: light
---
# /slides-generate

Read and follow [`references/slides-generate/protocol.md`](../references/slides-generate/protocol.md) (protocol SSOT). Behavior is unchanged — only structure moved for multi-harness reuse.

`$ARGUMENTS` are unchanged from the pre-split command.
