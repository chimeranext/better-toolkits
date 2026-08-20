# OpenCode2 — invoke `/implement` SSOT

1. Install the make-no-mistakes OpenCode package (`npx @lapc506/make-no-mistakes install` or marketplace equivalent).
2. Invoke the `implement` command/skill exposed by the plugin, **or** instruct the agent:

   > Read and follow `references/implement/` in the order listed in `commands/implement.md`. Arguments: `{issue-ids}`.

3. Ensure stderr baseline is registered (see monorepo `shared/hooks/stderr/` / toolkit hooks). Shell redirects that discard stderr must remain blocked.
