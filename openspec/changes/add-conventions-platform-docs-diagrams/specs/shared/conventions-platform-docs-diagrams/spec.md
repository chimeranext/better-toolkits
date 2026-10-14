# Spec Delta — shared/conventions-platform-docs-diagrams

## Purpose

Records platform para Markdown y Mermaid compatible con el renderizador de GitHub.

## ADDED Requirements

### Requirement: Record platform/markdown

El sistema SHALL proveer `platform/markdown/README.md` con `level: platform` y
RULES mínimas para documentación en repos (encabezados, tablas, enlaces relativos).

#### Scenario: Doc enlaza otro record

- **WHEN** un protocolo referencia convenciones
- **THEN** usa ruta relativa bajo `shared/references/conventions/` sin URL de producto

### Requirement: Record platform/diagrams/mermaid-github

El sistema SHALL proveer `platform/diagrams/mermaid-github.md` con RULES que
prohíben `:` en etiquetas de arista flowchart, nodos sin comillas cuando llevan
`/`, `§` o acentos, y `opt` anidado sin cerrar en sequenceDiagram.

#### Scenario: Flowchart PASS en GitHub

- **WHEN** un bloque flowchart usa etiquetas `|yes|` / `|no BLOCKED|` sin `:`
- **THEN** el record clasifica el bloque como conforme al perfil github

#### Scenario: Sequence sin opt frágil

- **WHEN** un sequenceDiagram modela ramas PASS/BLOCKED
- **THEN** usa `alt`/`else` lineal o cierra `opt` antes de `alt` (RULE D5)
