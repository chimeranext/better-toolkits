# /schematics-import — protocol SSOT

Same ingestion pipeline as logistics-toolkit (shared crawler + enricher). The electronics
content lives in guides #27 (IoT, 29 subpages) and #31 (Modelado 3D).

- Preflight: `notion-batch` connected + `NOTION_API_KEY` + output destination.
- `fetch_tree` → sitemap.yaml.
- `notion-enrich.py --sitemap <path> --dry-run` → expect would-enrich count, 0 failed.
- Verify: guides have children + resources; kinds from enum; local_path exists or fails; no `2>/dev/null` in scripts.
