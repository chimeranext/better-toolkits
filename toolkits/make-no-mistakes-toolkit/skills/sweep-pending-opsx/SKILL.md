---
name: sweep-pending-opsx
description: Sweep OpenSpec changes for artifacts with incomplete /opsx-apply checklists and other pipeline gaps (tasks not all [x], proposal-only changes, spec-drift not synced). Read-only; maps each unfinished change to its next command in the OpenSpec flow. Pairs with /sweep-unstaged.
allowed-tools: Bash
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: chimeranext
  version: "0.1"
---

# /sweep-pending-opsx

Read and follow [`references/sweep-pending-opsx/protocol.md`](../references/sweep-pending-opsx/protocol.md) (protocol SSOT).

Engine: `scripts/ci/sweep-pending-opsx.sh` (in this repo).

$ARGUMENTS is a repo path (default: current directory).
