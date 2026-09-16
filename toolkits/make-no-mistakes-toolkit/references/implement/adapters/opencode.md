# OpenCode2 — invoke `/implement` SSOT

1. Bootstrap the monorepo (`npx @chimeranext/better-toolkits setup` or `/toolkits-initial-setup` after `better-toolkits-bootstrap@better-toolkits`). Legacy: `npx @lapc506/make-no-mistakes install` (deprecated).
2. Invoke the `implement` command/skill exposed by the plugin, **or** instruct the agent:

   > Read and follow `references/implement/` in the order listed in `commands/implement.md`. Arguments: `{issue-ids}`.

3. Ensure stderr baseline is registered (see monorepo `shared/hooks/stderr/` / toolkit hooks). Shell redirects that discard stderr must remain blocked.
