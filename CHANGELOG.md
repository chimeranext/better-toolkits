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

- **OpenCode stderr SSOT:** consolidated into
  [`setup-opencode.md`](shared/bootstrap/references/toolkits-initial-setup/adapters/setup-opencode.md)
  (`/toolkits-initial-setup` / `npx @chimeranext/better-toolkits setup`). Removed duplicate
  `/make-no-mistakes:opencode-setup`. See [`docs/opencode-stderr.md`](docs/opencode-stderr.md).
- **better-toolkits-bootstrap** marketplace entry **0.1.0 → 0.1.1** (full OpenCode adapter protocol).
- **make-no-mistakes** marketplace entry **1.37.0 → 1.38.0** (drops `/opencode-setup`).
- **Product toolkits** (PRDS README OpenCode pointer only): patch bumps —
  **aaarrr-flywheel** 0.3.0→0.3.1, **app-gtm-release** 2.4.0→2.4.1,
  **atomic-design** 1.3.0→1.3.1, **business-model** 2.2.0→2.2.1,
  **fractional-cto** 1.3.0→1.3.1, **instructional-design** 1.2.0→1.2.1,
  **launchpad** 0.6.0→0.6.1, **ux-research** 2.1.0→2.1.1, **venture-studio** 1.2.0→1.2.1.
- **HITL / Cursor:** `AskQuestion` is the Cursor equivalent of Claude `AskUserQuestion`
  (`/resolve-open-questions`, `docs/hitl.md`, `/doctrine`, merge-advisor).
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
