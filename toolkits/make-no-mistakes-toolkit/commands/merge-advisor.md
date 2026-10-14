---
description: Calcula el ORDEN en que se deben mergear varios PRs abiertos contra una misma base, para que cada uno siga siendo mergeable cuando le toque. Mide colisiones de archivos, conflictos latentes que solo aparecen después de que otro PR aterriza, artefactos anclados a un SHA de la base, y capacidad de la flota de CI. Accepts base branch como $ARGUMENTS.
argument-hint: "[<base-branch>] [--repo <owner/name>] [--only <pr-numbers>] [--out <path>]"
priority: 80
---
# /merge-advisor

Read and follow [`references/merge-advisor/protocol.md`](../references/merge-advisor/protocol.md) (protocol SSOT).

**Hard stops (protocol SSOT):** no subagents unless the user explicitly asks;
on **detener subagents** / **stop goal** → halt (no merges, no new PRs). Before
any `gh pr create`, resolve **issue anchor + existing PR** — append to that PR,
do not open a duplicate for the same issue (GitHub **one number sequence** for
issues and PRs; link with `Fixes #N`, numbers need not match). `/merge-advisor`
orders **existing** PRs; it does not authorize a mega-PR that replays the stack.

`$ARGUMENTS` unchanged from the upstream protocol.
