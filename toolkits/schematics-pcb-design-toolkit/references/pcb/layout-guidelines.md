# PCB Layout Guidelines

## Layer stackup

- **2-layer**: signal + ground plane (return path discipline).
- **4-layer**: signal / GND / PWR / signal — better EMI + power integrity.

## Trace width vs current

| Current | 1oz Cu width (approx) |
| --- | --- |
| 1A | ~10 mil |
| 3A | ~30 mil |
| 5A | ~50 mil |

(Verify against your fab's tables and temperature rise.)

## Via sizing

- Use small vias for signals; larger vias for power/current.
- Include proper annular ring per fab constraints.

## Copper pour & clearance

- Ground pour on unused layers where practical.
- Observe minimum clearance rules per fab class.

## DRC checklist

- Clearance violations (trace-trace, trace-pad).
- Missing/mis-sized drill holes.
- Silk/refdes overlaps.
- Copper slivers / acute angles.

Run: `kicad-cli pcb drc --output report.json <file.kicad_pcb>`.
