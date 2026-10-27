# Logistics Toolkit

Supply chain management domain for startups importing goods into Costa Rica (or any LATAM
market): procurement (P2P, SRM, Kraljic), customs regimes, import documentation, INCOTERMS
2020, free trade agreements, and inventory management. Notion-agnostic: point the crawler at
any "Biblioteca de Guías" database and get a local, versioned, agent-searchable dump.

## Layout

- `references/procurement/` — P2P (10 steps), SRM, Kraljic matrix
- `references/customs/` — regimes (CAUCA / Ley 7575 / zonas), import documents, cost breakdown (FOB→CIF)
- `references/incoterms/` — INCOTERMS 2020 (11 codes + responsibility matrix)
- `references/trade-agreements/` — Costa Rica TLCs + certificado de origen
- `references/inventory/` — WMS vs ERP, forecasting, certifications (SCOR/APICS)
- `scripts/notion-enrich.py` — enricher (sitemap → manifest.json + .md files)
- `skills/deep-research/` — shared from `instructional-design-toolkit` (no local crawler)
- `commands/logistics-import.md` — thin entry
