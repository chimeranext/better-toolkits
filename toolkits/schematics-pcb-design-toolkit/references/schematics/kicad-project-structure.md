# KiCad Project Structure

## File tree

- `.kicad_pro` — project file (settings)
- `.kicad_sch` — schematic
- `.kicad_pcb` — PCB layout
- `.kicad_sym` — symbol library
- `.net` — netlist
- `Gerbers/` — manufacturing outputs
- `BOM/` — bill of materials output

## Recommended layout per project

```
project/
├── project.kicad_pro
├── schematic.kicad_sch
├── board.kicad_pcb
├── libs/            # symbol + footprint libraries
├── Gerbers/
├── BOM/
└── docs/
```

- Keep one project per board/assembly.
- Version symbol/footprint libraries with the design.
- Name nets and refdes consis.

ly (see `design-rules.md`).
