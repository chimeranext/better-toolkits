# /logistics-import — protocol SSOT

Harness-agnostic body. Thin entry: `commands/logistics-import.md`.

## Preflight

1. Verify `notion-batch` MCP is connected (tool available) and `NOTION_API_KEY` is set.
2. Parse root id (server accepts full URLs).
3. Confirm output destination (writes outside workspace need explicit human OK).

## Enrich

- `notion-enrich.py --sitemap <path>` → classifies resources by kind.
- `--dry-run` previews would-enrich counts (0 failed expected).

## Verify

- Every sitemap guide has `children[]` and `resources[]`.
- Every resource `kind` is in the enum.
- Every `local_path` either exists or fails explicitly (never silent).
- No `2>/dev/null` redirection in any script.
