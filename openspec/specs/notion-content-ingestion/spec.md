# notion-content-ingestion Specification

## Purpose

Machine-readable ingestion of Notion self-study guide databases into local Markdown. Any startup with a Notion "Biblioteca de Guías" style database can use this to produce a local, versioned, agent-searchable content dump with verbatim URLs.

## ADDED Requirements

### Requirement: Recursive Notion page tree crawl

The crawler SHALL walk a Notion database page tree recursively, visiting every `child_page` and `child_database` node up to a configurable depth, and produce a sitemap YAML with the full tree.

#### Scenario: Crawler walks the Vertivo DB tree

- **WHEN** given the Vertivo "Biblioteca de Guías de Auto-Estudio" database URL
- **THEN** the crawler produces `sitemap.yaml` with 38 guide entries, each with `id`, `skill`, `type`, `notion_url`, `local_path`, and `children[]` (recursive, 133 subpages total)

#### Scenario: Crawler handles nested databases

- **WHEN** a guide page contains an inline database (e.g., "Procesos Aduanales en Costa Rica", "Procesos Aduanales Internacionales")
- **THEN** the crawler recurses into the database's pages as `child_database` nodes and includes their URLs in the sitemap

### Requirement: Bookmark URL resolution via REST API

The crawler SHALL resolve Notion bookmark destinations via the REST API (not the native MCP, which renders them as `<unknown>`), producing verbatim `bookmark.url` values in the sitemap.

#### Scenario: Crawler resolves bookmark destinations

- **WHEN** a page contains bookmark blocks with `bookmark.url` pointing to YouTube, articles, or other Notion pages
- **THEN** the crawler resolves each to its real URL and classifies by `kind`: youtube, article, pdf, image, notion_page, bookmark

#### Scenario: Crawler handles unresolvable bookmarks

- **WHEN** a bookmark URL is inaccessible (deleted page, private page, expired)
- **THEN** the crawler records it as `kind: bookmark` with `resolved: false` and continues (never crashes)

### Requirement: External resource enrichment

The enricher SHALL classify each external URL by `kind` and fetch content via the appropriate tool: yt-dlp for YouTube transcripts, crw for articles/PDFs, Scrapling as stealth fallback, webfetch as last resort.

#### Scenario: Enricher fetches YouTube transcripts

- **WHEN** a resource has `kind: youtube`
- **THEN** the enricher runs `yt-dlp --write-subs --skip-download` and saves the transcript as `.md` next to the guide

#### Scenario: Enricher fetches articles via crw

- **WHEN** a resource has `kind: article`
- **THEN** the enricher runs `crw <url>` and saves the Markdown output

#### Scenario: Enricher falls back to Scrapling

- **WHEN** crw fails or is unavailable for an article
- **THEN** the enricher attempts `pip install scrapling` + stealth fetch

#### Scenario: Enricher records pending for manual fetch

- **WHEN** all automated fetchers fail for a URL
- **THEN** the enricher records it as `status: pending` in the manifest and continues

### Requirement: Manifest generation

The enricher SHALL produce a `manifest.json` next to the sitemap with per-resource status (dumped/enriched/pending/failed) and per-guide hub status (exists/missing).

#### Scenario: Manifest records all statuses

- **WHEN** the pipeline completes
- **THEN** `manifest.json` contains `{"total_guides": 38, "enriched": N, "pending": M, "failed": K}` and a per-guide breakdown
