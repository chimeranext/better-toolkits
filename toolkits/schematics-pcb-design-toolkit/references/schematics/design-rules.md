# Schematic Design Rules

## Approach

- **Hierarchical vs flat**: flat for small boards; hierarchical for reuse/team.
- **Net naming**: explicit signal names (PWR, GND, net labels). Never rely on auto-generated names for critical buses.
- **Power symbols**: use dedicated power symbols (not dangling pins).
- **Off-sheet connectors**: label every page entry/exit.
- **Annotation**: annotate before DRC; keep numbering stable for the BOM.

## ERC checklist

- No unconnected input pins.
- No shorted outputs.
- Power pins tied to correct rails.
- No duplicate reference designators.
- No missing off-sheet connectors / labels on multi-sheet designs.

Run: `kicad-cli sch erc --output report.json <file.kicad_sch>`.
