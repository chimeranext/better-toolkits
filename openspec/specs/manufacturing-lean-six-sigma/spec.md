# manufacturing-lean-six-sigma Specification

## Purpose

Lean manufacturing and Six Sigma domain for startups building manufacturing features (3D printing, CNC, electronics, IoT hardware). Covers Toyota Production System, Jidoka, Just-in-Time, 5S, TPM, SMED, Six Sigma DMAIC, and Kraljic portfolio matrix.

## ADDED Requirements

### Requirement: Toyota Production System reference

The toolkit SHALL provide a structured reference for the Toyota Production System including its two pillars (Jidoka and Just-in-Time), the foundation (Heijunka/level scheduling), and the 5S methodology.

#### Scenario: Agent retrieves TPS overview

- **WHEN** a startup asks "what is the Toyota Production System" or "explain Lean manufacturing"
- **THEN** the agent returns the TPS two pillars (Jidoka = automation with a human touch; JIT = right part, right time, right amount), Heijunka leveling, and 5S (Seiri, Seiton, Seiso, Seiketsu, Shitsuke)

#### Scenario: Agent explains Jidoka

- **WHEN** a startup asks "what is Jidoka" or "autonomation"
- **THEN** the agent returns: processes with built-in autocontrol; if anomaly occurs, line stops; prevents defective parts from advancing

### Requirement: 5S methodology reference

The toolkit SHALL provide a structured reference for the 5S methodology with the Japanese terms, English translations, and practical descriptions.

#### Scenario: Agent retrieves 5S table

- **WHEN** a startup asks "what is 5S" or "explain the 5S methodology"
- **THEN** the agent returns the 5-row table: Clasificación (Seiri), Orden (Seiton), Limpieza (Seiso), Estandarización (Seiketsu), Disciplina (Shitsuke) with descriptions

### Requirement: Just-in-Time reference

The toolkit SHALL provide a structured reference for JIT including its 8 fundamentals and the Kraljic portfolio matrix.

#### Scenario: Agent explains JIT

- **WHEN** a startup asks "what is Just-in-Time" or "explain JIT"
- **THEN** the agent returns: "have on hand what is needed, in the amount needed, at the moment needed"; 8 fundamentals (flexible resources, cellular layout, pull system, reduced setup times, zero stock, zero errors tolerance, quality at source, total productive maintenance)

#### Scenario: Agent retrieves Kraljic matrix

- **WHEN** a startup asks "what is the Kraljic matrix" or "how do I categorize suppliers"
- **THEN** the agent returns the 4 quadrants (Strategic, Leverage, Bottleneck, Non-critical) with risk vs profit impact axes and recommended strategy per quadrant

### Requirement: TPM and SMED reference

The toolkit SHALL provide a structured reference for Total Productive Maintenance (TPM) and Single-Minute Exchange of Die (SMED).

#### Scenario: Agent explains TPM

- **WHEN** a startup asks "what is TPM" or "total productive maintenance"
- **THEN** the agent returns: integrated maintenance where equipment stops automatically if anomaly detected; zero unplanned downtime goal

#### Scenario: Agent explains SMED

- **WHEN** a startup asks "what is SMED" or "quick changeover"
- **THEN** the agent returns: reduce setup/changeover times; adapt machinery quickly; reduce lot sizes

### Requirement: Six Sigma reference

The toolkit SHALL provide a structured reference for Six Sigma including the DMAIC cycle and certification paths.

#### Scenario: Agent explains DMAIC

- **WHEN** a startup asks "what is Six Sigma" or "explain DMAIC"
- **THEN** the agent returns: Define, Measure, Analyze, Improve, Control; data-driven defect reduction; 3.4 defects per million target

#### Scenario: Agent retrieves certification paths

- **WHEN** a startup asks "what certifications are available" or "SCOR vs CSCP"
- **THEN** the agent returns: SCOR, SCOR-DS, APICS CSCP with descriptions and exam requirements

### Requirement: Waste elimination reference

The toolkit SHALL provide a structured reference for the 3 types of waste (muda/mura/muri) and the 8 wastes of Lean.

#### Scenario: Agent explains muda/mura/muri

- **WHEN** a startup asks "what are the types of waste in Lean" or "muda mura muri"
- **THEN** the agent returns: muda (non-value-adding activity), mura (unevenness), uri (overburden)
