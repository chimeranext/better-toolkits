# Tasks

## 1. Scaffold server module

- [x] 1.1 Create `shared/mcp/posthog-chimeranext/` with `package.json` (deps: `@vitemcp/server`, `zod`), `README.md`, and `test/`; verify `npm ci` installs without error.
- [x] 1.2 Author `README.md` documenting the Podman hobby-deploy command (`podman run -p 8000:8000 -e POSTHOG_SECRET_KEY=... -e POSTHOG_HOST=http://localhost:8000 docker.io/posthog/posthog:latest`), env vars (`POSTHOG_HOST`, `POSTHOG_PERSONAL_API_KEY`), registration snippet, and test command.

## 2. Core server implementation

- [x] 2.1 Implement `server.js` as a ViteMCP stdio server with a `requireEnv` helper; verify it boots (`npm start`) and registers with `@vitemcp/server`.
- [x] 2.2 Implement stateless per-call auth: read `POSTHOG_HOST` (default `http://localhost:8000`) and `POSTHOG_PERSONAL_API_KEY` from env at call time; when a required var is missing, throw a clear `UserError` naming the variable; verify with a unit test that mocks env absence.
- [x] 2.3 Implement query tools (insights/funnel/retention) that call the self-hosted PostHog REST API at `POSTHOG_HOST` with `Authorization: Bearer <key>` and return structured content; verify with unit tests mocking `fetch` (no network, no token) asserting the request targets `POSTHOG_HOST`, never `mcp.posthog.com`.

## 3. Registration and cleanup

- [x] 3.1 Update root `opencode.json`: register `posthog-chimeranext` as a local server (`command: ["node", "shared/mcp/posthog-chimeranext/server.js"]`, env passthrough) and remove the remote `posthog` SaaS entry; verify `v8r opencode.json` passes.
- [ ] 3.2 Revert the cloud-oriented `opencode.json` state on PR #167 (branch `feat/conventions-matcher-harness`, commit `b7c176d`) — replace with the local registration; verify `v8r` + `openspec validate` pass and push to the PR branch.
- [ ] 3.3 Revert the cloud-oriented `opencode.json` state on PR #169 (branch `feat/disk-cleanup-multiplatform`, commit `5eb1973`) — replace with the local registration; verify `v8r` passes and push to the PR branch.

## 4. Verification and dogfood

- [x] 4.1 `openspec validate posthog-chimeranext-mcp` passes (exit 0).
- [x] 4.2 Run `npm test` in the new server dir; all tests pass.
- [ ] 4.3 Dogfood: start the self-hosted PostHog instance via Podman (or confirm a local instance is up), boot `server.js`, and call a tool against `POSTHOG_HOST`; verify a real structured result is returned (not an empty exit), confirming no cloud traffic.
