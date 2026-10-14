# Proposal — add-conventions-platform-docs-diagrams

Change ID: `add-conventions-platform-docs-diagrams`

## Why

Epic #77 reservó `platform/` en el árbol de convenciones pero sin records.
Los protocolos de assurance (y futuros toolkits) usan Mermaid en Markdown; el
renderizador de **github.com** es más estricto que editores locales o CLI
recientes. El fallo en `assurance-triage/protocol.md` demostró que hace falta un
perfil pineado **platform/diagrams/mermaid-github**, no reglas mezcladas en
`language/*`.

## What Changes

- `platform/markdown/README.md` — record nivel platform para docs Markdown
  (estructura, enlaces, cuándo diagramar).
- `platform/diagrams/mermaid-github.md` — perfil GitHub: RULES de sintaxis
  flowchart/sequence (`flowchart TD` por defecto en procesos secuenciales),
  COUNTEREXAMPLES del incidente assurance hub.
- `_dogfood/docs-diagrams/` — bloques Mermaid canónicos + instrucción de gate
  manual (preview GitHub) hasta automatizar parse en CI.
- OpenSpec delta `shared/conventions-platform-docs-diagrams`.

## Capabilities

### New Capabilities

- `shared/conventions-platform-docs-diagrams`: records `platform/markdown` +
  `platform/diagrams/mermaid-github`.

### Modified Capabilities

- (vacío)

## Impact

- Solo `shared/references/conventions/platform/` + dogfood + OpenSpec.
- Relacionado: assurance PR que arregla `protocol.md` (sintaxis); este change
  fija el método para no repetir el incidente.

## Non-goals

- PlantUML / OpenSpec `diagrams.md` UML completo (follow-up `platform/diagrams/uml`).
- Gate CI con `mmdc` obligatorio en todos los repos (solo dogfood + documentado).
