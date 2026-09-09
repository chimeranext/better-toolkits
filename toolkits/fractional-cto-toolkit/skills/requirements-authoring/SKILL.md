---
name: requirements-authoring
description: >
  Author a Product Requirements Document (PRD) or Software Requirements Specification
  (SRS) that any startup can adopt from day one, per ISO/IEEE 830 and ISO/IEC/IEEE
  29148:2018, using the bare SRS template vendored from jam01/SRS-Template (CC0).
  Use this skill when the user mentions "PRD", "SRS", "product requirements", "software
  requirements specification", "especificación de requisitos", "requisitos de producto",
  "requisitos de software", "29148", "IEEE 830", "write the requirements", "requirement
  spec", "write the spec for this feature", "convertir la idea en requisitos", or any
  situation where a fractional CTO needs to formalize a client's product idea into
  verifiable, testable requirements BEFORE any code or OpenSpec is written.
  This is the FRONT DOOR of the requirements-first pipeline: PRD first, OpenSpec derived
  from the PRD, Linear issues with Bilingual briefs, then the /opsx-* workflow.
  NOT for authoring operational SOPs (that is /sop-authoring) nor contracts.
---

# Requirements Authoring

Turns a fuzzy product idea into a versioned **PRD / SRS** compliant with
**ISO/IEEE 830:1998** and **ISO/IEC/IEEE 29148:2018**, using a blank template derived
from [`jam01/SRS-Template`](https://github.com/jam01/SRS-Template) (CCO). This is the
**source of truth** for everything downstream:

```
PRD / SRS (fuente de verdad, autor: Product Owner)
   │  se genera DERIVADO del PRD  (NO al revés)
   ▼
OpenSpec specs + changes  (guías de implementación de los issues)
   │
   ▼
Issue Linear (formato Bilingual Layer)  →  /opsx-explore → /opsx-propose
   → revisión humana → /opsx-apply → PR vinculado → /opsx-sync → /opsx-archive
```

> ⚠️ **Orden crítico:** OpenSpec **NUNCA** es fuente de verdad de los requisitos.
> El PRD/SRS se escribe primero según el estándar; los archivos OpenSpec se
> **derivan** de él para guiar la implementación de cada issue.

Read and follow [`references/requirements-authoring/protocol.md`](../../references/requirements-authoring/protocol.md) (protocol SSOT), the vendored
[`references/requirements-authoring/srs-bare-template.md`](../../references/requirements-authoring/srs-bare-template.md), and
[`references/requirements-authoring/openspec-quick-guide.md`](../../references/requirements-authoring/openspec-quick-guide.md).
Frontmatter triggers unchanged.