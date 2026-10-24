# Proposal

## Why

Startups in manufacturing (3D printing, CNC, electronics, IoT hardware) need a structured toolkit for Lean manufacturing, Six Sigma, and production optimization. The Vertivo Notion "Biblioteca de Guías de Auto-Estudio" contains detailed content on Toyota Production System, Jidoka, JIT, 5S, TPM, SMED, and Six Sigma — but as unstructured Notion pages with opaque bookmarks. This change creates a manufacturing-toolkit that turns that content into reusable, agent-invocable resources for any startup building manufacturing features.

## What Changes

- New `manufacturing-toolkit` under `toolkits/` with:
  - `references/` — structured Markdown: Toyota Production System (Jidoka, JIT), 5S methodology, TPM, SMED, Six Sigma (DMAIC), Kraljic matrix
  - `references/cad/` — 3D modeling, CAD/CAM and additive manufacturing boundary (owns the mechanical/3D domain that `schematics-pcb-design-toolkit` explicitly excludes)
  - `skills/deep-research/` + `scripts/notion-enrich.py` — same crawl/enrich pipeline as `instructional-design-toolkit` (shared, reusable)
  - `commands/manufacturing-import.md` — thin entry: `/manufacturing-import <notion-url>`
  - `references/manufacturing-import/protocol.md` — protocol SSOT
- The Notion content feeds the toolkit: Modelado 3D, Impresión 3D, Soldadura/CNC, IoT guides contain the manufacturing domain knowledge
- The crawler/enricher is shared infrastructure — any startup can point it at their own Notion "Biblioteca"

## Capabilities

### New Capabilities
- `manufacturing-lean-six-sigma`: Lean manufacturing domain — Toyota Production System, Jidoka (autonomation), Just-in-Time, 5S, TPM (Total Productive Maintenance), SMED (Single-minute exchange of die), Six Sigma DMAIC, Kraljic portfolio matrix, waste elimination (muda/mura/muri).
- `manufacturing-cad-3d`: Mechanical/3D domain — parametric 3D modeling, additive manufacturing (FDM/SLA/SLS), DFM rules, tolerances and fits, CAD/CAM handoff, and 3D-print-to-production escalation. Absorbs the "Modelado 3D" and "Impresión 3D" guides; `schematics-pcb-design-toolkit` is the electrical complement, not a replacement.

### Modified Capabilities
- (none)

## Impact

- New toolkit: `toolkits/manufacturing-toolkit/`
- Reuses the `deep-research` crawl/enrich pipeline from `instructional-design-toolkit`
- **Domain boundary:** this toolkit owns 3D/CAD/mechanical/DFM; `schematics-pcb-design-toolkit` owns schematic → PCB → fabrication outputs. Neither duplicates the other.
- Academy repo: `docs/vertivo/<slug>/` dumps (coordinated via issue)
- AduaNext SRD: this toolkit is content-only; no direct spec delta

## Non-goals

- No CAMPUS/cmi5 course mapping
- No binary downloads by default
- No real-time Notion sync

## Success criteria

- `/deep-research <vertivo-db-url>` produces sitemap.yaml with all 38 guides
- The enricher produces local `.md` files for each guide
- A startup can point the toolkit at their own Notion "Biblioteca" and get a local dump
