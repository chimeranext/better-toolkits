# schematics-pcb-design Specification

## Purpose

Schematic capture and PCB layout domain for startups building hardware/IoT products. Covers KiCad project structure, schematic design rules, PCB layout guidelines, design rule checks, manufacturing outputs, and netlist comparison.

## ADDED Requirements

### Requirement: KiCad project structure reference

The toolkit SHALL provide a structured reference for KiCad project structure including schematic files (.kicad_sch), PCB files (.kicad_pcb), symbol libraries (.kicad_sym), and output files.

#### Scenario: Agent retrieves KiCad project structure

- **WHEN** a startup asks "how do I structure a KiCad project" or "what files does KiCad use"
- **THEN** the agent returns the KiCad file tree (.kicad_pro, .kicad_sch, .kicad_pcb, .kicad_sym, Gerbers/, BOM/) and recommended directory layout

### Requirement: Schematic design rules reference

The toolkit SHALL provide a structured reference for schematic design rules including component placement, wire routing, power distribution, and annotation.

#### Scenario: Agent retrieves schematic design rules

- **WHEN** a startup asks "how do I design a schematic" or "schematic best practices"
- **THEN** the agent returns: hierarchical vs flat design, net naming conventions, power symbols, off-sheet connectors, and annotation rules

### Requirement: PCB layout guidelines reference

The toolkit SHALL provide a structured reference for PCB layout guidelines including component placement, routing, layer stackup, copper pour, and clearance rules.

#### Scenario: Agent retrieves PCB layout guidelines

- **WHEN** a startup asks "how do I lay out a PCB" or "PCB routing guidelines"
- **THEN** the agent returns: layer stackup (2-layer, 4-layer), trace width vs current, via sizing, copper pour, and clearance rules

### Requirement: ERC/DRC checklist

The toolkit SHALL provide a structured reference for Electrical Rule Check (ERC) and Design Rule Check (DRC) checklists.

#### Scenario: Agent runs ERC checklist

- **WHEN** a startup asks "run electrical rule check" or "validate my schematic"
- **THEN** the agent runs `kicad-cli sch erc --output report.json <file.kicad_sch>` and reports errors

#### Scenario: Agent runs DRC checklist

- **WHEN** a startup asks "run design rule check" or "validate my PCB"
- **THEN** the agent runs `kicad-cli pcb drc --output report.json <file.kicad_pcb>` and reports errors

### Requirement: Manufacturing outputs reference

The toolkit SHALL provide a structured reference for KiCad manufacturing outputs including Gerber files, drill files, BOM, and pick-and-place files.

#### Scenario: Agent exports Gerbers

- **WHEN** a startup asks "export Gerbers" or "generate manufacturing files"
- **THEN** the agent runs `kicad-cli pcb export gerbers --output <dir> <file.kicad_pcb>` and reports the output files

#### Scenario: Agent generates BOM

- **WHEN** a startup asks "generate BOM" or "bill of materials"
- **THEN** the agent runs `kicad-cli sch export bom --output bom.csv <file.kicad_sch>` and reports the BOM

### Requirement: Netlist comparison script

The toolkit SHALL provide a `scripts/netlist-diff.py` that compares two KiCad netlists (.net files) and reports added/removed components, added/removed nets, and connectivity changes.

#### Scenario: Agent compares two netlists

- **WHEN** a startup asks "what changed between these two schematic versions" or "diff my netlists"
- **THEN** the agent runs `netlist-diff.py old.net new.net` and returns a structured diff report
