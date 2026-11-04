# Tasks — /publish-better-toolkits-update

## Build

- [x] 1.1 Create `shared/bootstrap/scripts/publish-better-toolkits-update.sh`:
      - [x] generate 5 MCP tarballs → `apps/web/public/mcp/`
      - [x] marketplace bump via `marketplace_versioning.py write`
      - [x] `--dry-run` mode
      - [x] `--deploy` → trigger site build/publish
- [x] 1.2 Create command entry `shared/bootstrap/commands/publish-better-toolkits-update.md`
- [x] 1.3 Create protocol SSOT `shared/bootstrap/references/toolkits-initial-setup/adapters/publish-better-toolkits-update.md`
- [ ] 1.4 Wire the command via `setup-opencode-commands.sh` (symlink to `~/.config/opencode/commands/`)
- [x] 1.5 Assets generate `apps/web/public/mcp/*.tar.gz` (committed so the deploy publishes them)

## Verify

- [x] 2.1 `bash -n` + `shellcheck` pass on the script
- [x] 2.2 `--dry-run` prints the plan and writes nothing
- [x] 2.3 Running once generates the 5 `.tar.gz` under `apps/web/public/mcp/`
- [ ] 2.4 `install-opencode.sh` (from PR #176) can fetch one asset URL and un-tar it
- [ ] 2.5 `--deploy` triggers the site build
