---
name: requirements-authoring-ieee29148
description: >
  Write software-requirements-specification.md per ISO/IEC/IEEE 29148:2018,
  using the bare template vendored from jam01/SRS-Template (CC0). The product
  overview is a section of that file. Do not emit a separate PRD.md.
  Use this skill when the user mentions "PRD", "SRS", "product requirements", "software
  requirements specification", "especificación de requisitos", "requisitos de producto",
  "requisitos de software", "29148", "IEEE 830", "write the requirements", "requirement
  spec", "write the spec for this feature", "convertir la idea en requisitos", or any
  situation where a fractional CTO needs to formalize a client's product idea into
  verifiable, testable requirements BEFORE any code or OpenSpec is written.
  This is the front door of the requirements file: the specification first, OpenSpec
  derived from it, then Linear issues with bilingual briefs. The /opsx-* command
  order stays explore, propose, human review, apply, PR, optional sync, archive
  only with a human yes.
  NOT for authoring operational SOPs (that is /sop-authoring) nor contracts.
---

# Requirements Authoring (shared)

Turns a fuzzy product idea into `software-requirements-specification.md`
(ISO/IEC/IEEE 29148:2018). The section structure comes from the jam01 template.
That file is the source of truth. Do not emit a separate PRD.

```
software-requirements-specification.md (fuente de verdad, autor: Product Owner)
   │  se genera DERIVADO de la especificación  (NO al revés)
   ▼
OpenSpec specs + changes  (guías de implementación de los issues)
   │
   ▼
Issue Linear (formato Bilingual Layer)  →  /opsx-explore → /opsx-propose
   → revisión humana → /opsx-apply → PR vinculado → /opsx-sync → /opsx-archive
```

> OpenSpec is not the requirements source of truth. The specification is written
> first. OpenSpec is derived from it.

Shared home (deduped from `fractional-cto-toolkit`, same as engineering-standards):
read and follow [`references/requirements-authoring-ieee29148/protocol.md`](../../references/requirements-authoring-ieee29148/protocol.md)
(protocol SSOT), the vendored
[`references/requirements-authoring-ieee29148/srs-bare-template.md`](../../references/requirements-authoring-ieee29148/srs-bare-template.md),
and
[`references/requirements-authoring-ieee29148/openspec-quick-guide.md`](../../references/requirements-authoring-ieee29148/openspec-quick-guide.md).
Frontmatter triggers unchanged.

## Defaults

- Customer-facing specification, checklist, and verification: no skill/`generated_by`/dogfood attribution; descriptive executive voice per `shared/references/engineering-standards/customer-facing-management-docs.md` (not STE procedure imperatives)
- The filled file says the engineering standards index is implemented as added value of the deliverable. It does not say the client already operates them, and it does not attribute them to an internal team codename. It does not list four code practices as that index.
- Filled body in the engagement working language. Default Spanish: Preparado por, Versión, debe / no debe / debería / puede. The bare template stays English.
