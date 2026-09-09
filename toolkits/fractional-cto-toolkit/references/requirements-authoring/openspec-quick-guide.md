# OpenSpec quick guide — derived FROM the PRD

> **Orden correcto:** el PRD/SRS del Product Owner (estándar ISO/IEEE 830 +
> ISO/IEC/IEEE 29148:2018, template bare) es la **fuente de verdad de los requisitos**.
> Los archivos OpenSpec se **derivan** de ese PRD y funcionan como **guías de
> implementación de los issues** de Linear. OpenSpec nunca es la fuente de verdad
> upstream: si PRD y OpenSpec divergen, manda el PRD (y se re-deriva).

Referencia: [Fission-AI/OpenSpec — getting-started](https://github.com/Fission-AI/OpenSpec/blob/main/docs/getting-started.md).

## Cadena completa

```
PRD / SRS  (Product Owner, std 830 + 29148, template bare)
   │  prioridad 1: fuente de verdad de requisitos
   ▼
OpenSpec specs/changes   (derivados del PRD; guías de implementación)
   ▼
Issue Linear  (brief formato Bilingual Layer + taxonomía Type/Size/Strategy)
   ▼
/opsx-explore  →  /opsx-propose  →  revisión humana (HITL)
   →  /opsx-apply  →  PR vinculado al issue  →  /opsx-sync (opcional)
   →  /opsx-archive  (SOLO con OK humano)
```

## Derivación PRD → OpenSpec

Cuando el PRD esté **aprobado** por revisión humana, generar desde el contenido del PRD:

| Artefacto OpenSpec | Se deriva de la sección del PRD |
| --- | --- |
| `openspec/config.yaml` | stack/contexto global (§1.4 References, §3.5) |
| `openspec/specs/{dominio}/spec.md` | §3.1–§3.3 (requisitos → MUST/SHALL + escenarios) |
| cambio `{slug}/proposal.md` | §1.2 scope + §2.5 assumptions + §2.6 apportioning |
| cambio `{slug}/design.md` | §3.5 (Design and Implementation) + decisión técnica |
| cambio `{slug}/tasks.md` | §2.6 apportioning + §3.5.8 deadline → desglose atómico |
| delta specs (ADDED/MODIFIED) | requisitos afectados de §3.2 / §3.3 |

Reglas de derivación:

1. Cada requisito del PRD (`FR-xxx`, `NFR-xxx`) se traduce a requisito OpenSpec con
   `MUST`/`SHALL` (RFC 2119) y escenarios `GIVEN/WHEN/THEN`.
2. Si un requisito del PRD **no** aparece en la spec derivada, es un error de derivación.
3. El `proposal.md` del cambio DEBE citar el PRD como fuente upstream (`src: PRD vX.Y`).
4. Verbatim de cambios de requisitos → `openspec validate` para comprobar el formato.

## Flujo /opsx-* (rápido)

Después de crear el **issue nuevo en Linear** (con el formato Bilingual Layer, ver
`make-no-mistakes-toolkit/templates/bilingual-issue-brief.md`):

| Paso | Comando | Qué pasa | Gate |
| --- | --- | --- | --- |
| 1 | `/opsx-explore` | Pensar, NO implementar (opcional si el problema ya está claro) | — |
| 2 | `/opsx-propose` | Planning only — el agente redacta el plan (proposal/specs/design/tasks); el humano lo revisa | revisión humana (HITL) |
| 3 | — | Revisión con criterio humano del plan antes de tocar código | **humano aprueba** |
| 4 | `/opsx-apply` | Implementa el cambio aprobado (código en satélites/worktrees) | — |
| 5 | `gh pr create` | Nuevo PR vinculado al issue de Linear (`Fixes HAB-N`/`CLN-N`...) | — |
| 6 | `/opsx-sync` | Opcional — reconcilia specs/pendientes con lo entregado | — |
| 7 | `/opsx-archive` | Archiva el cambio (merge specs → `specs/`, mover a `changes/archive/`) | **SOLO con OK humano** |

HITL doctrine del monorepo: tras producir un plan cuya acción natural muta estado
compartido (merge, create-PR-mediado, archive, status → Done), **preguntar y esperar**.
Nunca ejcutar `--apply`/`--archive` sin aprobación humana.

## Issues Linear — formato Bilingual Layer

El brief del issue usa la plantilla `bilingual-issue-brief.md` (HUMAN LAYER + AGENT
LAYER) y la taxonomía obligatoria de labels: **Type** (Bug/Chore/Feature/Spike/
Improvement/Design) + **Size** (XS–XL, mapea a presupuesto de tokens) + **Strategy**
(Solo/Explore/Team/Human/Worktree/Review), más los combinables (Component, Impact,
Flags). Referenciar el PRD y el slug de OpenSpec en el cuerpo del issue.

## Instalación

```bash
npm install -g @fission-ai/openspec@latest
cd <repo del cliente> && openspec init
```

Setup con asistente: pegar el prompt de instalación de
`OpenSpec/docs/installation.md#install-with-your-ai-assistant`.

## Anti-patrones

1. **Invertir la cadena** — escribir OpenSpec y "sacarle" un PRD a posteriori. El PRD es
   primero; OpenSpec se deriva.
2. **/opsx-propose → /opsx-apply sin HITL** — el humano aprueba el plan antes de código.
3. **/opsx-archive sin OK** — archivar es mutación de estado compartido; requiere OK humano.
4. **Issues con brief débil** — sin Bilingual Layer y/o sin Type/Size/Strategy.
5. **Derivación selectiva** — requisitos del PRD que no aparecen en specs derivadas.