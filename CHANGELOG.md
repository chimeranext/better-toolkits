# Changelog — better-toolkits (monorepo)

Notable changes to the **monorepo** itself (marketplace, doctrine, landing, shared
hooks). Per-toolkit releases continue in `toolkits/<name>/CHANGELOG.md` when that
file exists.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **`/make-no-mistakes:evaluate-agent-skills`:** wrap NVIDIA SkillSpector / SkillEvaluator
  (peer CLIs; auto-install via `uv tool install` unless `--no-install` — see
  [`docs/evaluate-agent-skills.md`](docs/evaluate-agent-skills.md)).
- **buildwithclaude marketplace prep:** [`docs/buildwithclaude-marketplace.md`](docs/buildwithclaude-marketplace.md)
  (external marketplace discovery preferred; draft `KNOWN_MARKETPLACES` seed text;
  BSL honesty). Do not open upstream PR until asked.

### Changed

- **Marketplace SSOT:** only [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json)
  is the Claude Code marketplace for this repo. Removed leftover
  `toolkits/*/.claude-plugin/marketplace.json` files (standalone-repo import residue).
  Do not recreate them — see [`AGENTS.md`](AGENTS.md).
- Enriched root marketplace discovery fields (`owner.url`, per-plugin
  `homepage` / `repository` / `license` / `author`, categories/keywords for sparse
  entries). Validated with `claude plugin validate --strict`.
- **app-gtm-release** entry in the root marketplace bumped **2.3.0 → 2.4.0** to match
  the toolkit `plugin.json` / `package.json` (fixes install-surface drift after
  `/ship-flatpak`).
- **make-no-mistakes** marketplace entry **1.36.1** (auto-install peers for
  `/evaluate-agent-skills`).
