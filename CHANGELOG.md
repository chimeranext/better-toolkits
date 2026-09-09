# Changelog — better-toolkits (monorepo)

Notable changes to the **monorepo** itself (marketplace, doctrine, landing, shared
hooks). Per-toolkit releases continue in `toolkits/<name>/CHANGELOG.md` when that
file exists.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **`/make-no-mistakes:opencode-setup`:** one-shot audit/install/verify for OpenCode
  `"plugin"` registration of the shared stderr baseline (optional `--also-npm`).
  See [`docs/opencode-stderr.md`](docs/opencode-stderr.md).

### Changed

- **Marketplace SSOT:** only [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json)
  is the Claude Code marketplace for this repo. Removed leftover
  `toolkits/*/.claude-plugin/marketplace.json` files (standalone-repo import residue).
  Do not recreate them — see [`AGENTS.md`](AGENTS.md).
- **app-gtm-release** entry in the root marketplace bumped **2.3.0 → 2.4.0** to match
  the toolkit `plugin.json` / `package.json` (fixes install-surface drift after
  `/ship-flatpak`).
- **make-no-mistakes** marketplace entry bumped **1.34.0 → 1.35.0** (`/opencode-setup`).
