# QA hooks — prod write guard

`pre-tool-prod-write-guard.sh` blocks browser-mutating MCP tools against hosts
listed in the consumer's `.claude/qa/prod-origins.json`, unless a human creates
a single-use armed token.

**No contract file → no-op (fail open).**

Copy [`examples/prod-origins.example.json`](examples/prod-origins.example.json)
to `.claude/qa/prod-origins.json` and replace `prodOrigins` with your production
hosts. Optional env: `MNM_QA_ORIGIN`, `MNM_QA_ARMED_TOKEN`.

## OpenCode V2 adapter

[`adapters/opencode-qa-prod-guard.ts`](adapters/opencode-qa-prod-guard.ts)
(`local.mnm-qa-prod-guard`): same contract, same origin-union resolution,
same single-use armed-token consumption — enforced in `execute.before`
for tools matching `mutatingToolPatterns`. Adapt those patterns to your
harness's tool ids (the example targets Claude MCP names). Opt-out:
remove the plugin from `plugins`, `MNM_DISABLE_QA_GUARD=1`, or
`CLAUDE_DISABLE_PLUGIN_HOOKS=1`. Keep in sync with
`pre-tool-prod-write-guard.sh`.
