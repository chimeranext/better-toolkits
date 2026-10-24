# Design — schematics-pcb-design-toolkit

## D1 — KiCad project structure reference

SSOT: `references/schematics/kicad-project-structure.md`.
- File tree: .kicad_pro (project), .kicad_sch (schematic), .kicad_pcb (PCB), .kicad_sym (symbol library), .net (netlist), Gerbers/, BOM/.
- Recommended directory layout per project.

## D2 — Schematic design rules reference

SSOT: `references/schematics/design-rules.md`.
- Hierarchical vs flat design.
- Net naming conventions (PWR, GND, signals).
- Power symbols, off-sheet connectors.
- Annotation rules.
- ERC checklist.

## D3 — PCB layout guidelines reference

SSOT: `references/pcb/layout-guidelines.md`.
- Layer stackup (2-layer, 4-layer).
- Trace width vs current table.
- Via sizing.
- Copper pour.
- Clearance rules.
- DRC checklist.

## D4 — Manufacturing outputs reference

SSOT: `references/pcb/manufacturing-outputs.md`.
- Gerber export steps.
- Drill file export.
- BOM generation.
- Pick-and-place file generation.
- Manufacturer-specific requirements.

## D5 — KiCad CLI batch operations script

SSOT: `scripts/kicad-cli.sh`.
- Wrapper around `kicad-cli` for ERC, DRC, Gerber export, BOM generation.
- Usage: `kicad-cli.sh erc <file>`, `kicad-cli.sh drc <file>`, `kicad-cli.sh gerbers <file>`, `kicad-cli.sh bom <file>`.

## D6 — Netlist comparison script

SSOT: `scripts/netlist-diff.py`.
- Parse two KiCad .net files.
- Report: added/removed components, added/removed nets, connectivity changes.
- Output: JSON diff report.

## D7 — Notion content ingestion (shared pipeline)

Same as logistics-toolkit D7: crawler + enricher + manifest. The electronics content lives in guides #27 (IoT, 29 subpages) and #31 (Modelado 3D).

## D8 — Reusability

Same as logistics-toolkit D10: Notion-agnostic; any startup with a hardware/electronics Notion DB can use it.
