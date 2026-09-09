# buildwithclaude marketplace prep

Prep notes for listing **better-toolkits** on
[Build with Claude](https://www.buildwithclaude.com) /
[`davepoon/buildwithclaude`](https://github.com/davepoon/buildwithclaude).

Upstream contribution guide:
[CONTRIBUTING.md § Contributing Plugins](https://github.com/davepoon/buildwithclaude/blob/main/CONTRIBUTING.md#contributing-plugins).

**This doc prepares our monorepo.** Do **not** open a PR against
`davepoon/buildwithclaude` until a maintainer explicitly asks.

---

## How users install *this* marketplace

```bash
claude plugin marketplace add chimeranext/better-toolkits
claude plugin install make-no-mistakes@better-toolkits
# …or any other name from .claude-plugin/marketplace.json
```

Landing: https://toolkits.chimeranext.dev · Manifest SSOT:
[`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json).

---

## Strategy (preferred vs not)

| Path | When | Notes |
| --- | --- | --- |
| **External marketplace discovery** (preferred) | Always for this monorepo | buildwithclaude’s indexer seeds `KNOWN_MARKETPLACES` and also GitHub-searches `filename:marketplace.json path:.claude-plugin`. Users still add us with `marketplace add chimeranext/better-toolkits`. |
| **Seed `KNOWN_MARKETPLACES`** | Optional featured / accurate fallback counts | Small PR to their `web-ui/lib/indexer/marketplace-indexer.ts` — see draft below. Does **not** copy our trees. |
| **Copy plugins into `plugins/<name>/`** | Avoid for better-toolkits | Their CONTRIBUTING expects in-repo MIT-style plugin packages. We are a **BSL-1.1 source-available monorepo** with ten toolkits, shared hooks, and multi-harness SSOT. Vendoring into their tree would fork license + version drift. |

Do **not** dump the whole BSL monorepo into `davepoon/buildwithclaude/plugins/`
without a clear dual-path agreement.

---

## Contribution checklist (our side)

- [x] Root [`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json) validates (`claude plugin validate` / `--strict`).
- [x] Each toolkit has [`.claude-plugin/plugin.json`](../toolkits/make-no-mistakes-toolkit/.claude-plugin/plugin.json) (identity + version). **Forbidden:** per-toolkit `marketplace.json` (see [`AGENTS.md`](../AGENTS.md)).
- [x] Root [README](../README.md) documents `claude plugin marketplace add chimeranext/better-toolkits`.
- [x] License honesty: toolkits are **BSL-1.1** (source-available; converts to Non-Profit OSL 3.0 after the Change Date) — not MIT. State this in any listing PR.
- [x] Categories / keywords on marketplace plugin entries (discovery quality).
- [x] `owner.url` on the marketplace manifest; plugin entries may carry `homepage` / `repository` / `license` / `author` (schema-supported; keep top-level marketplace `homepage`/`repository` off — Claude Code warns on those).
- [ ] Optional: open seed PR to buildwithclaude `KNOWN_MARKETPLACES` (draft text below) — **HITL before opening**.

Validate locally:

```bash
claude plugin validate --strict .claude-plugin/marketplace.json
claude plugin validate --strict toolkits/make-no-mistakes-toolkit
```

Their in-repo plugin PR flow (`npm test`, `plugins/<name>/`, MIT-oriented manifests) applies when contributing **individual** agents/commands into *their* tree — not when listing an external marketplace.

---

## Draft PR text (seed `KNOWN_MARKETPLACES` only)

Target file (upstream):
`web-ui/lib/indexer/marketplace-indexer.ts` → `KNOWN_MARKETPLACES` array.

Suggested entry:

```ts
{
  repo: 'chimeranext/better-toolkits',
  url: 'https://toolkits.chimeranext.dev',
  displayName: 'better-toolkits',
  description:
    'Source-available Claude Code toolkits monorepo (BSL-1.1) — workflow, GTM, UX research, growth, fractional CTO, and more. Add with: claude plugin marketplace add chimeranext/better-toolkits',
  categories: ['plugins', 'skills', 'workflow'],
  badges: [], // ask maintainers if 'featured' is appropriate later
  fallbackPluginCount: 10,
  fallbackSkillCount: 40, // approximate; indexer recomputes from marketplace.json
},
```

### PR body template

```markdown
## Summary

Seed `chimeranext/better-toolkits` into `KNOWN_MARKETPLACES` so the community
indexer picks up this external Claude Code marketplace with stable display
metadata (and fallback counts if parse fails).

## Why not copy into `plugins/`?

better-toolkits is a multi-toolkit **BSL-1.1** monorepo with a root
`.claude-plugin/marketplace.json`. Prefer external marketplace discovery over
vendoring individual plugins into this repository.

## Install (for reviewers)

```bash
claude plugin marketplace add chimeranext/better-toolkits
claude plugin install make-no-mistakes@better-toolkits
```

## License note

Listed plugins are **source-available under BSL-1.1** (not MIT). Please keep that
visible in any UI copy derived from this seed.

## Testing

- [ ] Indexer includes `chimeranext/better-toolkits`
- [ ] marketplace.json fetch/parse succeeds
- [ ] No change to in-repo `plugins/` tree
```

Branch name suggestion (on *their* repo, when authorized): `add-better-toolkits-marketplace`.

---

## Related

- Anthropic marketplaces: https://code.claude.com/docs/en/plugin-marketplaces  
- Monorepo agent rules: [`AGENTS.md`](../AGENTS.md)  
- HITL doctrine: [`docs/hitl.md`](hitl.md)
