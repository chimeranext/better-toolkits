# Tasks — add-conventions-platform-docs-diagrams

## 1. Records platform

- [x] 1.1 `platform/markdown/README.md` (level platform, GOAL + RULES docs)
- [x] 1.2 `platform/diagrams/mermaid-github.md` (SOURCES GitHub + Mermaid docs, RULES D1–D6)
- [x] 1.3 Actualizar `shared/references/conventions/README.md` con filas platform

## 2. Dogfood

- [x] 2.1 `_dogfood/docs-diagrams/hub-flowchart.mmd` y `hub-sequence.mmd` (copia canónica assurance hub)
- [x] 2.2 `_dogfood/docs-diagrams/README.md` con gate manual GitHub preview
- [ ] 2.3 (opcional) Job CI `mmdc -i` cuando runner tenga Chromium

## 3. OpenSpec

- [x] 3.1 `specs/shared/conventions-platform-docs-diagrams/spec.md`
- [x] 3.2 `openspec validate add-conventions-platform-docs-diagrams`
- [ ] 3.3 Archive → living spec tras merge

## QA traceability

| Layer | Artifact |
| --- | --- |
| 1 — Normative AC | `spec.md` escenarios D1–D3 |
| 3 — Automated | (pendiente mmdc en CI) |
| Manual | Checklist en `_dogfood/docs-diagrams/README.md` |
