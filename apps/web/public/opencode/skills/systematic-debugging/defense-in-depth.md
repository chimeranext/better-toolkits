# Defense In Depth

After finding and fixing a root cause, add validation at multiple layers so the same class of failure cannot pass silently again.

Layers (example for MCP/catalog/auth flow):
- Input layer: schema validation (`jsonschema`, SDK `safeParse`)
- Protocol layer: JSON-RPC framing, method dispatch, notification handling
- Auth layer: token expiry check, client_id verification, scope enforcement
- Integration layer: rclone command exit code verification, `.json` presence
- Output layer: assertion scripts (`PASS/FAIL`) with Hurl-style assertions
