# Schematics / PCB Design Skill — Multi-Tool Reference

## Purpose

This skill provides the schematic capture and PCB layout domain for startups building hardware/IoT products: KiCad project structure, schematic design rules, PCB layout guidelines, ERC/DRC, manufacturing outputs, and netlist comparison.

## Capabilities

- **KiCad structure**: project file tree + recommended layout
- **Schematic rules**: hierarchical vs flat, net naming, power symbols, off-sheet connectors, annotation
- **PCB guidelines**: layer stackup (2/4-layer), trace-width vs current, via sizing, copper pour, clearance
- **ERC/DRC**: checklists + `kicad-cli sch erc` / `kicad-cli pcb drc`
- **Manufacturing outputs**: Gerbers, drill, BOM, pick-and-place
- **Netlist diff**: `scripts/netlist-diff.py old.net new.net` → JSON diff

## Usage

This skill enables hardware design guidance for agents operating across Claude Code, Cursor, and OpenCode. Given a "structure a KiCad project / design rules / layout / export Gerbers / diff netlists" question, the agent returns the structured reference and runs the scripts.

## References (APA)

- KiCad. (2026). *KiCad EDA*. https://www.kicad.org/
- KiCad. (2026). *KiCad command line interface (kicad-cli)*. https://docs.kicad.org/
