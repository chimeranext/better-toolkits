# convention: ci-workflows
id: ci-workflows · version: 0.1.0 · status: draft · level: platform
extracted_at: 2026-11-01 · ttl_expires: 2027-05-01
parent: none

## GOAL

Un `.github/workflows/*` (y sus composite actions de respaldo) que esté "bien
escrito" bajo este record usa el vocabulario correcto de las herramientas que
invoca, no el nombre intuitivo — de modo que los gates de CI sean verdes y no
fallen por configuración.

## SOURCES

| # | kind | ref (ID + versión/fecha) | weight | para qué |
|---|------|--------------------------|--------|----------|
| S1 | repo | incidente: CodeQL rechazó `typescript` ("Did not recognize the following languages: typescript") en 6 repos; job murió en `init` | load-bearing | RULE R1 |
| S2 | repo | `github/codeql-action/init@v3` — vocabulario de lenguajes (go, javascript, python, java, cpp, csharp, ruby, swift) | load-bearing | RULE R1 |
| S3 | repo | acción `upload-results@v3` inexistente; `analyze@v3` ya sube SARIF (fallo en elrupets) | load-bearing | RULE R2 |
| S4 | repo | error en template vendorizado se propagó a todos los clientes | load-bearing | RULE R3 |

## RULES

- R1 [pipe-discipline] Los inputs de herramientas de CI deben usar el
  **vocabulario de la herramienta**, no el nombre popular. `typescript` NO es
  un lenguaje de CodeQL; usar `javascript` (cubre TS/JS) → S1, S2
- R2 [pipe-discipline] No invocar pasos que no existen en la versión de la
  acción (p.ej. `codeql-action/upload-results@v3`). El `analyze@v3` ya sube
  SARIF → S3
- R3 [pipe-discipline] Un template/composite vendorizado es la fuente de verdad;
  un defecto ahí se corrige una vez y se re-deriva a todos los repos, no seis
  veces a mano → S4

## COUNTEREXAMPLES

```yaml
# ❌ wrong: CodeQL rechaza "typescript" y el job muere en init
with:
  languages: |
    typescript
    javascript

# ✅ right: vocabulario válido de CodeQL
with:
  languages: |
    javascript
```

## GATES

- local: `python3 -c "import yaml; yaml.safe_load(open('workflow.yml'))"` +
  revisión manual del vocabulario de `languages`/inputs
- CI: el propio gate de seguridad (`Security Scan`) — si CodeQL se inicializa,
  el vocabulario es válido

## LESSONS

- L1: Un nombre intuitivo puede ser inválido (typescript). Validar contra la
  doc de la herramienta, no contra la intuición. → RULE R1
- L2: Un defecto en un template vendorizado se amplifica a todos los repos;
  la corrección va en la fuente, no en cada cliente. → RULE R3

## RECEIPT

<!-- candidate_sha + risk tier + lenses + verdict — emitido en el dogfood del
     template workflow-security.yml.tpl -->
