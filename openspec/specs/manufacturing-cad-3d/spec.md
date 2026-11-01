# manufacturing-cad-3d Specification

## Purpose

Mechanical and 3D domain for startups building physical products. Covers parametric 3D modeling, additive manufacturing (FDM/SLA/SLS), design-for-manufacturability (DFM) rules, tolerances and fits, CAD/CAM handoff, and the decision of when 3D printing stops being a prototype tool and becomes a production process.

This capability is the **mechanical complement** to `schematics-pcb-design`: it owns enclosures, brackets, jigs, fixtures, and printed parts; it does not cover PCB layout, schematic capture, or electrical rule checks.

## ADDED Requirements

### Requirement: 3D modeling workflow reference

The toolkit SHALL provide a structured reference for parametric 3D modeling including part vs assembly structure, parametric sketches, constraints, and feature history hygiene.

#### Scenario: Agent retrieves the 3D modeling workflow

- **WHEN** a startup asks "how do I model this part" or "parametric vs direct modeling"
- **THEN** the agent returns the part/assembly tree, sketch constraint strategy, feature ordering rules, and naming/versioning conventions

### Requirement: Additive manufacturing process selection

The toolkit SHALL provide a structured reference for choosing between FDM, SLA/DLP, and SLS/MJF based on part size, tolerance, surface finish, material properties, and run size.

#### Scenario: Agent selects a 3D printing process

- **WHEN** a startup asks "which 3D printing process should I use for this part"
- **THEN** the agent returns a comparison table (FDM / SLA / SLS) with tolerance ranges, minimum feature size, typical materials, cost drivers, and a recommendation tied to the stated constraints

### Requirement: DFM rules for printed and machined parts

The toolkit SHALL provide a structured reference for design-for-manufacturability rules: wall thickness, overhangs, support strategy, hole orientation, draft angles for molding, minimum tool radius for CNC, and tolerance stack-up.

#### Scenario: Agent reviews a part for DFM

- **WHEN** a startup asks "is this part manufacturable" or "review my design for 3D printing / CNC"
- **THEN** the agent returns a checklist of violations with the numeric threshold for each rule and the process it applies to

### Requirement: Tolerances and fits reference

The toolkit SHALL provide a structured reference for tolerances, fits, and clearances including ISO 2768 general tolerances, shaft/hole fit classes, and printed-part clearance compensation.

#### Scenario: Agent resolves a fit question

- **WHEN** a startup asks "what clearance do I need for a press fit" or "what tolerance should I specify"
- **THEN** the agent returns the fit class, the nominal clearance range, and the process-specific compensation (e.g. FDM hole shrinkage)

### Requirement: CAD/CAM handoff reference

The toolkit SHALL provide a structured reference for exporting from CAD to CAM and to a manufacturer: STEP/IGES vs native, mesh export settings (STL/3MF), drawing standards, and the quote package a shop needs.

#### Scenario: Agent prepares a manufacturing quote package

- **WHEN** a startup asks "what do I send to the machine shop" or "how do I export for manufacturing"
- **THEN** the agent returns the file format matrix per process, the drawing/annotation checklist, and the minimum package (3D + 2D + material + finish + quantity + tolerance callouts)

### Requirement: Prototype-to-production escalation

The toolkit SHALL provide a decision reference for when to move from 3D printing to injection molding, CNC, or casting, including tooling cost, breakeven volume, and lead time.

#### Scenario: Agent evaluates production escalation

- **WHEN** a startup asks "should I injection mold this" or "when do I stop 3D printing"
- **THEN** the agent returns a breakeven analysis template (tooling cost ÷ per-unit delta) plus the qualitative gates: tolerance, surface finish, material certification, and regulatory requirements
