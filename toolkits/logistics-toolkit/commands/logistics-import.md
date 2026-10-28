---
name: "/logistics-import"
description: Import a Notion self-study guide database into local Markdown (crawl + enrich + verify).
---

Read and follow [`references/logistics-import/protocol.md`](../references/logistics-import/protocol.md) (protocol SSOT).

Usage: `/logistics-import <notion-db-url> [--out <dir>]`

1. Preflight: check `notion-batch` connected + `NOTION_API_KEY` + output destination.
2. `fetch_tree` → sitemap.yaml (recursive).
3. `python3 scripts/notion-enrich.py --sitemap <path> --dry-run`.
4. Enrich + write `manifest.json`.
5. Verify: guides have children + resources, kinds from enum, local_path exists or fails.
