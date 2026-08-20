# QA hooks — prod write guard

`pre-tool-prod-write-guard.sh` blocks browser-mutating MCP tools against hosts
listed in the consumer's `.claude/qa/prod-origins.json`, unless a human creates
a single-use armed token.

**No contract file → no-op (fail open).**

Copy [`examples/prod-origins.example.json`](examples/prod-origins.example.json)
to `.claude/qa/prod-origins.json` and replace `prodOrigins` with your production
hosts. Optional env: `MNM_QA_ORIGIN`, `MNM_QA_ARMED_TOKEN`.
