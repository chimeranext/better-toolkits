# Design — add-conventions-platform-docs-diagrams

## Context

`add-conventions-layer` definió `level: platform` para stacks no ligados a un
solo lenguaje (OpenPLC, IEC, **documentación**). Los diagramas en Markdown son
transversales: assurance, make-no-mistakes, OpenSpec changes en cualquier repo.

## Decisions

1. **Perfil `mermaid-github`** — target explícito github.com blob/PR view, no
   Mermaid Live Editor genérico ni GitLab.
2. **Hijo de `platform/markdown`** — `mermaid-github` hereda GOAL de “docs
   legibles en PR” y añade RULES solo de diagramas.
3. **LESSONS L1** vive en assurance `protocol.md` (PR previo); el record
   platform referencia L1 sin duplicar narrativa del incidente.
4. **Dogfood** — carpeta `_dogfood/docs-diagrams/` con los mismos bloques que
   assurance hub; gate local = checklist + opcional `npx @mermaid-js/mermaid-cli`
   cuando Chromium esté disponible (no bloquear PR por Puppeteer en dev).

## Migration Plan

Aditivo. Otros `.md` con Mermaid se migran incrementalmente al perfil; no mas-refactor.
