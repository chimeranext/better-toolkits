# logistics-supply-chain Specification

## Purpose

Supply chain management domain for startups importing goods into Costa Rica (or any LATAM market). Covers procurement (P2P, SRM, Kraljic), customs regimes, import documentation, INCOTERMS 2020, free trade agreements, and inventory management. Reusable by any startup building import/supply-chain features.

## ADDED Requirements

### Requirement: Procurement process reference

The toolkit SHALL provide a structured reference for the Procure-to-Pay process (10 steps from Requisition to Vendor Payment), Supplier Relationship Management (SRM), and the Kraljic portfolio matrix for categorizing purchases (strategic/critical/leverage/non-critical).

#### Scenario: Agent retrieves P2P process steps

- **WHEN** a startup asks "what is the procure-to-pay process" or "how does procurement work"
- **THEN** the agent returns the 10-step P2P flow (Requisition → Requisition Approval → Quotation → Quotation Approval → Purchase Order → PO Approval → Goods Receipt → Supplier Performance → Invoice Approval → Vendor Payment)

#### Scenario: Agent retrieves Kraljic matrix guidance

- **WHEN** a startup asks "how do I categorize my suppliers" or "what is the Kraljic matrix"
- **THEN** agent returns the 4 quadrants (Strategic, Leverage, Bottleneck, Non-critical) with risk/profit impact axes and recommended sourcing strategy per quadrant

### Requirement: Customs regime reference

The toolkit SHALL provide a structured reference for Costa Rican customs regimes including the CAUCA framework (Ley 8360), Ley General de Aduanas (7575), territory aduanero (zona primaria/secundaria), and the distinction between importación definitiva, temporal, tránsito, and zonas francas.

#### Scenario: Agent explains customs territory

- **WHEN** a startup asks "what is zona primaria" or "what is zona secundaria" or "how does customs territory work in Costa Rica"
- **THEN** agent returns the definitions: zona primaria = where customs operations occur (ports, borders, airports); zona secundaria = free circulation area

#### Scenario: Agent lists customs regimes

- **WHEN** a startup asks "what are the customs regimes" or "what régime applies to my import"
- **THEN** agent returns the regime taxonomy (importación, exportación, tránsito, depósito aduanero, zonas francas, recinto aduanero) and which legal framework governs each

### Requirement: Import documentation reference

The toolkit SHALL provide a structured reference for the ~19 required import documents in Costa Rica, including factura compraventa, conocimiento de embarque (BL/AWB/carta porte), factura de importación, certificado de origen, INCOTERM, DUA, and the cost breakdown rubros (aranceles, bodegaje, examen previo, póliza, inspección pre-embarque).

#### Scenario: Agent lists required import documents

- **WHEN** a startup asks "what documents do I need to import" or "what paperwork for importación"
- **THEN** agent returns the 19-document checklist with purpose per document

#### Scenario: Agent breaks down import costs

- **WHEN** a startup asks "what costs are in the factura de importación" or "how is CIF calculated" or "what are the rubros"
- **THEN** agent returns the 9 rubros (nacionalización consolidada, transporte, conocimiento de embarque, revisión TLC, gastos despacho, examen previo, bodegaje, inspección pre-embarque, póliza) and the FOB→CIF formula

### Requirement: INCOTERMS 2020 reference

The toolkit SHALL provide a structured reference for INCOTERMS 2020 including the 11 codes, the responsibility matrix per term, and the FOB/CIF distinction with glossary.

#### Scenario: Agent explains FOB vs CIF

- **WHEN** a startup asks "what is FOB" or "what is CIF" or "which INCOTERM should I use"
- **THEN** agent returns: FOB = value at origin port (factory + transport to port + export taxes); CIF = FOB + international transport + insurance + import taxes; and the guidance that FCA applies to air freight from China, FOB to sea freight

### Requirement: Free trade agreements reference

The toolkit SHALL provide a structured reference for Costa Rica's free trade agreements including CR-China, CR-EEUU, CAFTA-DR, and the certificado de origen requirement per TLC.

#### Scenario: Agent lists active TLCs for Costa Rica

- **WHEN** a startup asks "what trade agreements does Costa Rica have" or "is there a TLC with China" or "what is CAFTA-DR"
- **THEN** agent returns the list of active agreements and which ones require a certificado de origen for tariff preferences

### Requirement: Inventory management reference

The toolkit SHALL provide a structured reference for quantitative inventory management including WMS systems, warehouse management, demand forecasting, production planning, and the SCOR/APICS certification paths.

#### Scenario: Agent explains inventory planning methods

- **WHEN** a startup asks "how do I forecast demand" or "what is a WMS" or "how do I plan production"
- **THEN** agent returns: demand forecasting methods, WMS vs ERP distinction, master production scheduling, and the APICS CSCP certification path

# notion-content-ingestion Specification

## Purpose

Machine-readable ingestion of Notion self-study guide databases into local Markdown. Any startup with a Notion "Biblioteca de Guías" style database can use this to produce a local, versioned, agent-searchable content dump.

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
