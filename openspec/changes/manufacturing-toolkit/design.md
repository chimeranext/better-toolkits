# Design — manufacturing-toolkit

## D1 — Toyota Production System reference

SSOT: `references/manufacturing/tps.md`.
- Two pillars: Jidoka (autonomation) + Just-in-Time.
- Foundation: Heijunka (level scheduling) + 5S.
- Jidoka: process autocontrol; line stops on anomaly; prevents defect propagation.
- JIT: right part, right time, right amount; 8 fundamentals.

## D2 — 5S methodology reference

SSOT: `references/manufacturing/5s.md`.
- Table: Clasificación (Seiri), Orden (Seiton), Limpieza (Seiso), Estandarización (Seiketsu), Disciplina (Shitsuke).
- Each with Japanese term, English translation, practical description.

## D3 — Kraljic matrix reference

SSOT: `references/procurement/kraljic-matrix.md` (shared with logistics-toolkit).
- 4 quadrants: Strategic, Leverage, Bottleneck, Non-critical.
- Axes: supply risk vs profit impact.
- Recommended strategy per quadrant.

## D4 — TPM and SMED reference

SSOT: `references/manufacturing/tpm-smed.md`.
- TPM: integrated maintenance; zero unplanned downtime.
- SMED: quick changeover; reduce lot sizes.

## D5 — Six Sigma reference

SSOT: `references/manufacturing/six-sigma.md`.
- DMAIC: Define, Measure, Analyze, Improve, Control.
- Certifications: SCOR, SCOR-DS, APICS CSCP.

## D6 — Waste elimination reference

SSOT: `references/manufacturing/waste.md`.
- 3 types: muda (non-value), mura (unevenness), muri (overburden).
- 8 wastes of Lean.

## D7 — Notion content ingestion (shared pipeline)

Same as logistics-toolkit D7: `deep-research` skill + `notion-enrich.py` + manifest. The manufacturing content lives in guides #31 (Modelado 3D), #24 (Impresión 3D), #27 (IoT), #37 (Soldadura/CNC), #25 (Ingeniería Cloud).

## D7b — 3D / CAD boundary

SSOT: `references/cad/`. This toolkit owns the mechanical domain: parametric modeling, additive manufacturing, DFM, tolerances/fits, CAD/CAM handoff, and prototype-to-production escalation. `schematics-pcb-design-toolkit` owns the electrical domain (schematic → PCB → fab outputs) and explicitly delegates enclosures, brackets, jigs, and printed parts here. The handoff artifact between the two is the mechanical envelope + mounting hole pattern that the PCB must respect.

## D8 — Reusability

Same as logistics-toolkit D10: Notion-agnostic; any startup with a "Biblioteca" DB can use it.
