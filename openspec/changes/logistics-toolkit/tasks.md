# Tasks — logistics-toolkit

## Implementation

- [x] T1: Create `toolkits/logistics-toolkit/` scaffold (README, CHANGELOG, .claude-plugin/plugin.json, references/, scripts/, commands/)
- [x] T2: Write `references/procurement/p2p-process.md` (10-step P2P flow)
- [x] T3: Write `references/procurement/kraljic-matrix.md` (4 quadrants + sourcing strategy)
- [x] T4: Write `references/customs/regimes.md` (CAUCA, Ley 7575, zona primaria/secundaria, 6+ regimes)
- [x] T5: Write `references/customs/import-documents.md` (19 documents grouped by function)
- [x] T6: Write `references/customs/cost-breakdown.md` (9 rubros + FOB→CIF formula)
- [x] T7: Write `references/incoterms/incoterms-2020.md` (11 codes + responsibility matrix + FOB/CIF glossary)
- [x] T8: Write `references/trade-agreements/tlcs.md` (20 TLCs + certificado de origen)
- [x] T9: Write `references/trade-agreements/certificado-origen.md` (auto-generated per TLC, J06)
- [x] T10: Write `references/inventory/wms-vs-erp.md` + `references/inventory/forecasting.md` + `references/inventory/certifications.md` (SCOR/APICS)
- [x] T11: Reuse `skills/deep-research/` from `instructional-design-toolkit` (no local crawler)
- [x] T12: Write `scripts/notion-enrich.py` (enricher: sitemap → manifest.json + .md files)
- [x] T13: Write `references/logistics-import/protocol.md` (protocol SSOT: preflight, DFS, enrich, verify)
- [x] T14: Write `commands/logistics-import.md` (thin entry: /logistics-import <notion-url>)
- [ ] T15: Validate: every sitemap guide has children + resources; every resource has kind from enum; every local_path either exists or fails explicitly

## Verification

- [ ] T16: Run `/deep-research <vertivo-db-url>` → produces sitemap.yaml with 38 guides, 133 children
- [ ] T17: Run `notion-enrich.py --sitemap docs/vertivo/sitemap.yaml --dry-run` → reports 89 would-enrich, 0 failed
- [ ] T18: Verify no stderr-to-devnull redirection in any script (grep check)
- [ ] T19: Verify toolkit is reusable: change DB URL → still works
