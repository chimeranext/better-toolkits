# Proposal

## Why

Startups building hardware/IoT products (PCB design, electronics) need a structured toolkit for schematic capture and PCB layout using KiCad. The Vertivo Notion contains detailed content on electronics, IoT, and hardware design. This change creates a schematics-pcb-design-toolkit that turns that content into reusable, agent-invocable resources for any startup building hardware features, inspired by open-source KiCad tooling (aklofas/kicad-happy, mixelpixx/Konnect, kicad-api-rs).

## What Changes

- New `schematics-pcb-design-toolkit` under `toolkits/` with:
  - `references/` — structured Markdown: KiCad workflow, schematic design rules, PCB layout guidelines, ERC/DRC checklist, component library management, manufacturing outputs (Gerbers, BOM, pick-and-place)
  - `scripts/kicad-cli.sh` — wrapper around KiCad CLI for batch operations (ERC, DRC, Gerber export, BOM generation)
  - `scripts/netlist-diff.py` — compare two KiCad netlists for schematic changes
  - `commands/schematics-import.md` — thin entry: `/schematics-import <notion-url>`
  - `references/schematics-import/protocol.md` — protocol SSOT

## Capabilities

### New Capabilities
- `schematics-pcb-design`: Schematic capture and PCB layout domain — KiCad project structure, schematic design rules, PCB layout guidelines, design rule checks, manufacturing outputs (Gerbers, BOM, pick-and-place), netlist comparison.

### Modified Capabilities
- (none)

## Impact

- New toolkit: `toolkits/schematics-pcb-design-toolkit/`
- Inspired by: aklofas/kicad-happy (workflow automation), mixelpixx/Konnect (connectivity), kicad-api-rs (Rust API for KiCad file manipulation)
- Academy repo: `docs/vertivo/<slug>/` dumps (coordinated via issue)

## Non-goals

- **3D modeling, CAD/mechanical design, and DFM are out of scope** — they belong to
  `manufacturing-toolkit`. This toolkit stops at the electrical domain (schematic →
  PCB → fabrication outputs). Mechanical enclosures, 3D printing, and CAD/CAM
  handoff are referenced only as upstream/downstream boundaries.
- No CAMPUS/cmi5 course mapping (owned by `instructional-design-toolkit`)
- No binary downloads by default
- No real-time Notion sync

## Success criteria

- `/deep-research <vertivo-db-url>` produces a sitemap.yaml
- The enricher produces local `.md` files for each guide + KiCad-specific references
- A startup can point the toolkit at their own Notion "Biblioteca" and get a local dump
