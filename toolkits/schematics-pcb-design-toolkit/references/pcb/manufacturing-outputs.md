# Manufacturing Outputs

## Gerber export

- `kicad-cli pcb export gerbers --output <dir> <file.kicad_pcb>`
- Export all layers (copper, mask, silkscreen, outline) + drill file.

## Drill

- Generate Excellon drill file alongside Gerbers.

## BOM

- `kicad-cli sch export bom --output bom.csv <file.kicad_sch>`
- Include refdes, value, footprint, manufacturer part number.

## Pick-and-place

- Generate centroid/pick-and-place file for assembly.

## Manufacturer requirements

- Match fab impedance/stackup spec.
- Provide outline + drill tables + BOM + pick-place.
- Confirm file naming per fab's preferred convention.
