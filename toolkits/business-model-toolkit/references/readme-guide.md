# README Generation Guide

## Structure Pattern

The generated README follows the structure established by Vertivo and AltruPets READMEs,
adapted for any business/startup project.

## Required Sections

### 1. Header

```markdown
# [Project Name] - [One-line descriptor]

[![Badge1](url)](link)
[![Badge2](url)](link)

[2-3 sentence description of what the product does, who it's for, and the core value proposition]

> **"[Slogan]"** — [Expanded tagline explaining the product's promise]
```

Badges should reflect actual tech stack or certifications. Common badges:
- Framework badges (Flutter, React, NestJS, etc.)
- Infrastructure badges (Kubernetes, AWS, etc.)
- Compliance badges if relevant (PCI DSS, ISO, etc.)

### 2. Problem Section

```markdown
## Problema que Resuelve

[1-2 paragraph description of the problem space]

| # | Problema | Quién lo sufre | Alternativa actual |
|---|----------|---------------|-------------------|
| 1 | **[Problem 1]** — [detailed description] | [Segment] | [Current workaround] |
| 2 | **[Problem 2]** — [detailed description] | [Segment] | [Current workaround] |
| 3 | **[Problem 3]** — [detailed description] | [Segment] | [Current workaround] |
```

### 3. Solution Section

```markdown
## Solución

- **[Feature 1]** — [how it solves problem 1]
- **[Feature 2]** — [how it solves problem 2]
- **[Feature 3]** — [how it solves problem 3]
- **[Feature 4]** — [additional capability]
```

### 4. Business Verticals (if applicable)

```markdown
## Verticales de Negocio

| Vertical | Modelo | Target |
|----------|--------|--------|
| **[Vertical 1]** | [Revenue model] | [Customer segment] |
| **[Vertical 2]** | [Revenue model] | [Customer segment] |
```

### 5. User Segments

```markdown
## Segmentos de Usuario

| Segmento | Plan | Precio | Hardware/Service | % Usuarios | % Revenue |
|----------|------|--------|-----------------|-----------|-----------|
| **[Segment 1]** | [Plan] | $X/mo | [What they get] | X% | X% |
```

### 6. Implementation Status

```markdown
## Estado Actual de Implementación

> **Madurez general: ~X%** — [Brief summary of current state]

| Componente | Madurez | Lo que funciona | Gaps principales |
|------------|---------|----------------|-----------------|
| **[Component 1]** | X% | [Working features] | [Missing features] |

### Lo que funciona hoy

- **[Area 1]**: [Description]
- **[Area 2]**: [Description]

### Lo que se está construyendo

1. **[Task 1]**: [Description]
2. **[Task 2]**: [Description]
```

### 7. Architecture

```markdown
## Arquitectura del Sistema

\```mermaid
flowchart TB
    subgraph Layer1["Layer Name"]
        A[Component] --> B[Component]
    end
    subgraph Layer2["Layer Name"]
        C[Component] --> D[Component]
    end
    Layer1 --> Layer2
\```

### Principios de Diseño

1. **[Principle]** — [Explanation]
2. **[Principle]** — [Explanation]
```

### 8. Tech Stack

```markdown
## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Mobile** | [tech] |
| **Backend** | [tech] |
| **Database** | [tech] |
| **Infrastructure** | [tech] |
```

### 9. Directory Structure

```markdown
## Estructura del Proyecto

\```
project/
  apps/
    backend/
    mobile/
  business/           # Business model documents
  docs/
  infrastructure/
\```
```

### 10. Quick Start

```markdown
## Inicio Rápido

### Prerrequisitos

- [Requirement 1]
- [Requirement 2]

### Setup

\```bash
git clone [repo]
cd [project]
[setup commands]
\```
```

### 11. Competitive Advantage

```markdown
## Ventaja Competitiva

| Ventaja | Difícil de copiar porque... |
|---------|---------------------------|
| **[Advantage 1]** | [Explanation] |
```

### 12. Roadmap

```markdown
## Roadmap

| Tier | Versión | Deadline | Revenue at risk | Foco |
|------|---------|----------|-----------------|------|
| **T0** | v0.1.0 | [Date] | 100% ($X) | [Focus] |
| **T1** | v0.2.0 | [Date] | X% ($X) | [Focus] |
```

### 13. Brand Identity

```markdown
## Identidad de Marca

- **Razón Social**: [Legal name]
- **Slogan**: "[Slogan]"
- **Misión**: [Mission statement]
- **Visión**: [Vision statement]
- **Valores**: [Core values]
```

### 14. Business Model Reference

```markdown
## Modelo de Negocio

La documentación completa del modelo de negocio está en [`business/`](business/):

- [Modelo de Negocio (índice)](business/00-modelo-de-negocio.md)
- [Entrevista del Problema](business/entrevista-problema.md)
- [Perfil de Cliente](business/perfil-expectativas-cliente.md)
- [Pitch Deck](business/pitch-deck.md)
```

## Adaptation Rules

- Only include sections relevant to the project's current state
- If no codebase exists yet, skip Architecture, Tech Stack, Directory Structure, Quick Start
- If pre-revenue, mark financial projections as estimates
- If idea-stage, focus on Problem, Solution, Segments, Business Model — skip Implementation Status
- Always include the link to `business/` directory
- Use Spanish for all content unless user specifies otherwise
- Include mermaid diagrams where they add clarity
- Tables are preferred over prose for structured information
