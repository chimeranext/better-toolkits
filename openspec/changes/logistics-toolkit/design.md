# Design — logistics-toolkit

## D1 — Procurement process reference

The procurement reference covers:
- **Procure-to-Pay (P2P)**: 10-step flow from Requisition to Vendor Payment.
- **Supplier Relationship Management (SRM)**: supplier onboarding, performance evaluation, Kraljic portfolio matrix (Strategic / Leverage / Bottleneck / Non-critical).
- **Kraljic matrix**: 4 quadrants with risk (supply) vs profit impact axes; recommended sourcing strategy per quadrant.

SSOT: `references/procurement/p2p-process.md`, `references/procurement/kraljic-matrix.md`.

## D2 — Customs regime reference

- **CAUCA (Ley 8360)**: Central American Uniform Customs Code; régimen aduanero = destination of merchandise under customs control.
- **Ley General de Aduanas (7575)**: territorio aduanero = zona primaria (operation) + zona secundaria (free circulation).
- **Regimes**: importación definitiva, temporal, tránsito, depósito aduanero, zonas francas, recinto aduanero.
- **Almacén fiscal**: storage under customs control; DUA confección; agencia aduanal responsibility.

SSOT: `references/customs/regimes.md`, `references/customs/territory.md`.

## D3 — Import documentation reference

19 required documents, grouped by function:
- Commercial: factura compraventa, factura importación
- Transport: BL (marítimo), AWB (aéreo), carta porte (terrestre)
- Customs: DUA, declaración única aduanera
- Origin/compliance: certificado de origen, certificado de análisis, INCOTERM
- Financial: póliza (insurance), forma de pago

Cost breakdown rubros (9): nacionalización consolidada, transporte, conocimiento de embarque, revisión TLC, gastos despacho, examen previo, bodegaje, inspección pre-embarque, póliza.

FOB → CIF formula: CIF = FOB + transporte + insurance + aranceles + gastos.

SSOT: `references/customs/import-documents.md`, `references/customs/cost-breakdown.md`.

## D4 — INCOTERMS 2020 reference

11 codes, responsibility matrix per term:
- FCA (air from China, sensors from NYC): seller delivers to carrier at named place; buyer arranges main carriage.
- FOB (sea): seller delivers on board vessel; buyer arranges main carriage + insurance.
- CIF: seller pays freight + insurance to destination port.

Glossary: FOB = value at origin port; CIF = FOB + freight + insurance + import taxes.

SSOT: `references/incoterms/incoterms-2020.md`.

## D5 — Free trade agreements reference

Costa Rica active TLCs: CR-China, CR-EEUU (CAFTA-DR), CR-UE, CR-México, CR-Canadá, CR-Singapur, CR-Colombia, CR-Perú, CR-Gatemala, CR-Honduras, CR-Panamá, CR-Nicaragua, CR-Rep. Dom., CR-Cuba, CR-Caricom, CR-EFTA, CR-Corea, CR-Chile, CR-UK, CR-ACP.

Certificado de origen per TLC: required for tariff preference; auto-generated in J06.

SSOT: `references/trade-agreements/tlcs.md`, `references/trade-agreements/certificado-origen.md`.

## D6 — Inventory management reference

- **WMS vs ERP**: WMS = warehouse operations (pick/pack/ship); ERP = financial + inventory valuation. Both needed.
- **Demand forecasting**: qualitative (expert, Delphi) + quantitative (time series, regression).
- **Master production scheduling (MPS)**: what to produce, when, how much.
- **Production planning**: plant-level scheduling, capacity planning.

Certification path: APICS CSCP → SCOR → SCOR-DS.

SSOT: `references/inventory/wms-vs-erp.md`, `references/inventory/forecasting.md`, `references/inventory/certifications.md`.

## D7 — Notion content ingestion pipeline

Two-phase pipeline:
1. **Crawl** (`skills/deep-research/`, shared from `instructional-design-toolkit`): walks DB tree → sitemap.yaml with recursive children + resources.
2. **Enrich** (`scripts/notion-enrich.py`): classifies resources by kind → yt-dlp / crw / Scrapling / webfetch → manifest.json.

The sitemap is the contract: the enricher never invents URLs, only resolves them. If local_path is missing → fail explicitly.

## D8 — Sitemap YAML contract

```yaml
version: 1
source:
  notion_database: <url>
  data_source: collection://<id>
  guides_count: 38
  extracted_at: "<ISO>"
  extraction_mode: recursive
guides:
  - id: "01"
    skill: "..."
    type: Dura Tecnológica | Dura en Finanzas | Blanda Corporativa | Blanda Personal
    notion_url: https://app.notion.com/p/<id>
    local_path: docs/vertivo/<slug>/
    children:
      - { kind: notion_page, title: "...", notion_url: ..., local_path: ... }
    resources:
      - { kind: youtube | article | pdf | image | notion_page | bookmark, url: "...", local_path: ... }
```

## D9 — Node kinds (fixed enum v1)

`notion_page | youtube | article | pdf | image | notion_page_mention | bookmark`

## D10 — Reusability

The toolkit is Notion-agnostic: any startup with a "Biblioteca de Guías" DB can point the crawler at their own DB URL and get a local dump + sitemap. The Vertivo DB is the reference instance.
