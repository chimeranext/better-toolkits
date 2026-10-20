# Proposal

## Why

Startups importing goods into Costa Rica lack a structured toolkit for supply chain management — procurement, customs regimes, import documentation, INCOTERMS, free trade agreements, and inventory planning. The Vertivo Notion "Biblioteca de Guías de Auto-Estudio" contains 38 guides covering these topics, but they are unstructured Notion pages with opaque bookmarks and no machine-readable index. This change creates a logistics-toolkit that turns that content into a reusable, agent-invocable resource for any startup building import/supply-chain features (e.g., AduaNext's DUA flow).

## What Changes

- New `logistics-toolkit` under `toolkits/` with:
  - `references/` — structured Markdown per domain: procurement (P2P, SRM, Kraljic), customs regimes (CAUCA, Ley 7575, zona primaria/secundaria), import documentation (~19 doc types), INCOTERMS 2020, free trade agreements (CR-China, CR-EEUU), inventory management (WMS, forecasting).
  - `skills/deep-research/` — shared crawl skill (Notion tree → `sitemap.yaml` with verbatim bookmark URLs via the `notion-batch` MCP). Reused from `instructional-design-toolkit`, not reimplemented.
  - `scripts/notion-enrich.py` — enricher that classifies each external URL (youtube/article/pdf/image/bookmark) and fetches content via yt-dlp / crw / Scrapling / webfetch.
  - `commands/logistics-import.md` — thin entry: `/logistics-import <notion-url>`.
  - `references/logistics-import/protocol.md` — protocol SSOT (preflight, DFS fetch, enrich, verify).
- Sitemap YAML contract: `version`, `source`, `guides[]` with `id`, `skill`, `type`, `notion_url`, `local_path`, `children[]` (recursive), `resources[]` (external URLs with `kind` enum: youtube|article|pdf|image|notion_page|bookmark).
- Reusable by any startup: the toolkit reads any Notion "Biblioteca de Guías" style database and produces local Markdown + a manifest.

## Capabilities

### New Capabilities
- `logistics-supply-chain`: Supply chain management domain — procurement (P2P, SRM, Kraljic matrix), customs regimes and territory, import documentation, INCOTERMS 2020, free trade agreements, inventory management (WMS, forecasting, demand planning).
- `notion-content-ingestion`: Machine-readable ingestion of Notion self-study guide databases — recursive page/DB crawl, bookmark URL resolution, external resource classification and enrichment, sitemap YAML generation.

### Modified Capabilities
- (none — new toolkit, no existing spec affected)

## Impact

- New toolkit: `toolkits/logistics-toolkit/`.
- Reuses the shared `deep-research` crawl skill + `scripts/notion-enrich.py` (no duplicate crawler).
- New command: `commands/logistics-import.md`.
- New protocol: `references/logistics-import/protocol.md`.
- No changes to existing toolkits or specs.
- Academy repo: `docs/vertivo/sitemap.yaml` + `docs/vertivo/<slug>/` dumps (separate repo, coordinated via issue).
- AduaNext SRD: this toolkit feeds the `CustomsRegime`, `ImportDocument`, and `FreeTradeAgreement` entities proposed in the SRD delta (separate change).

## Non-goals

- No binary downloads by default (images/files stay as URLs; download only on explicit `--fetch-assets`).
- No real-time Notion sync (the toolkit is a one-shot importer; re-run to refresh).
- No UI/Flutter dashboard (this is a content toolkit, not a feature module).

## Success criteria

- `/deep-research <vertivo-db-url>` produces a `sitemap.yaml` with all 38 guides, their children, and all external URLs classified by kind.
- Every bookmark URL resolves to a real destination (via REST API, not the native MCP).
- The enricher produces local `.md` files for each guide + a `manifest.json` with status per resource.
- A startup can point the toolkit at their own Notion "Biblioteca" and get a local Markdown dump + sitemap.
