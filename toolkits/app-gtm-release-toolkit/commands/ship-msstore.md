---
description: "Local Windows build/install and sideload validation by default; pass --store to opt into Microsoft Store assessment, packaging, listing, and submission."
argument-hint: "[--local | --store] [--what-if | --gate N | --resume] [--path A|B]"
---
# /ship-msstore

Read and follow [`references/ship-msstore/protocol.md`](../references/ship-msstore/protocol.md) (protocol SSOT). No mode argument defaults to local validation; pass `--store` to enter the Microsoft Store workflow.

Use `$ARGUMENTS` as listed above; `--path A|B` applies only with `--store`.
