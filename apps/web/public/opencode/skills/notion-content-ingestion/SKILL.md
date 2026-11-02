---
name: notion-content-ingestion
description: >
  Ingests Notion self-study guide databases into local, versioned Markdown via a
  recursive crawler (sitemap.yaml) and an enricher
  (yt-dlp/crw/Scrapling/webfetch -> manifest.json). Use when producing an
  agent-searchable local content dump from a Notion library.
---

# Notion Content Ingestion Skill — Multi-Tool Reference

## Purpose

This skill provides machine-readable ingestion of Notion self-study guide databases into local Markdown: recursive crawler → sitemap.yaml, then an enricher (yt-dlp / crw / Scrapling / webfetch) → manifest.json. Any startup with a Notion "Biblioteca de Guías" database can produce a local, versioned, agent-searchable content dump.

## Capabilities

- **Recursive crawl**: walk page/database tree → sitemap.yaml (children + resources)
- **Bookmark resolution**: verbatim `bookmark.url` via Notion REST API (not the native MCP `<unknown>` blind spot)
- **Enrichment**: classify resources by kind (youtube/article/pdf/image/notion_page); fetch via yt-dlp / crw / Scrapling / webfetch
- **Resilience**: unresolvable bookmarks recorded as `resolved: false` (never crash)
- **Manifest**: per-resource status (dumped/enriched/pending/failed) + per-guide hub status

## Usage

This skill enables Notion-content ingestion for agents operating across Claude Code, Cursor, and OpenCode. Runs the shared pipeline (`notion-batch` MCP + `scripts/notion-enrich.py`); protocol SSOT is `references/logistics-import/protocol.md`.

## References (APA)

- Notion. (2026). *Notion API*. https://developers.notion.com/
- yt-dlp. (2026). *yt-dlp — youtube-dl fork with additional features*. https://github.com/yt-dlp/yt-dlp
- Scrapling. (2026). *Scrapling — stealth web scraping*. https://github.com/D4Vinci/Scrapling
