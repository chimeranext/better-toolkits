# Schematics & PCB Design Toolkit

[![Version](https://img.shields.io/badge/version-0.1.5-blue)](.claude-plugin/plugin.json) [![License: BSL-1.1](https://img.shields.io/badge/license-BSL--1.1-important)](LICENSE)

Schematic capture and PCB layout domain for startups building hardware/IoT products: KiCad
project structure, schematic design rules, PCB layout guidelines, design rule checks,
manufacturing outputs, and netlist comparison. Notion-agnostic content ingestion (shared).

## Layout

- `references/schematics/` — KiCad project structure, schematic design rules
- `references/pcb/` — layout guidelines, manufacturing outputs
- `scripts/kicad-cli.sh` — ERC/DRC/Gerber/BOM wrapper
- `scripts/netlist-diff.py` — compare two .net files
- `skills/deep-research/` — shared from `instructional-design-toolkit`
- `commands/schematics-import.md` — thin entry
