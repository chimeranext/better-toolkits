# Tasks — /publish-better-toolkits-update

## Build

- [ ] 1.1 Create `shared/bootstrap/scripts/publish-better-toolkits-update.sh`:
      - [ ] generate 5 MCP tarballs → `apps/web/public/mcp/`
      - [ ] marketplace bump via `marketplace_versioning.py write`
      - [ ] `--dry-run` mode
      - [ ] `--deploy` → trigger site build/publish
- [ ] 1.2 Create command entry `shared/bootstrap/commands/publish-better-toolkits-update.md`
- [ ] 1.3 Create protocol SSOT `shared/bootstrap/references/toolkits-initial-setup/adapters/publish-better-toolkits-update.md`
- [ ] 1.4 Wire the command via `setup-opencode-commands.sh` (symlink to `~/.config/opencode/commands/`)
- [ ] 1.5 Add `apps/web/public/mcp/` to `.gitignore`? (No — assets are published but generated; decide if committed or build-time)

## Verify

- [ ] 2.1 `bash -n` + `shellcheck` pass on the script
- [ ] 2.2 `--dry-run` prints the plan and writes nothing
- [ ] 2.3 Running once generates the 5 `.tar.gz` under `apps/web/public/mcp/`
- [ ] 2.4 `install-opencode.sh` (from PR #176) can fetch one asset URL and un-tar it
- [ ] 2.5 `--deploy` triggers the site build
