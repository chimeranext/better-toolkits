# Convention record — template

> Plantilla del molde `shared/conventions-record`. Cada sección marcada
> **[R]** es requerida; **[O]** opcional. Sin `[R]` completo, el record no sale
> de `draft`.

```markdown
# convention: <id-kebab>
id: <id> · version: 0.1.0 · status: draft · level: <language|framework|platform|dataset>
extracted_at: YYYY-MM-DD · ttl_expires: YYYY-MM-DD
parent: <id del padre o "none"> <!-- [R] en framework; "none" en raíz -->

## GOAL <!-- [R] -->
Una frase: qué código queda "bien escrito" bajo este record.

## SOURCES <!-- [R] -->
| # | kind | ref (ID + versión/fecha) | weight | para qué |
|---|------|--------------------------|--------|----------|
<!-- kind: context7|repo|docs|video-transcript. weight: load-bearing|context.
     Cada RULE traza a ≥1 load-bearing. Nada `listed` sostiene RULE. -->

## RULES <!-- [R] -->
<!-- Por mecanismo (`pipe-discipline`), no por lenguaje. Formato:
     `R<n> [<mecanismo>] <regla> → <source #>` -->
- R1 ...

## COUNTEREXAMPLES <!-- [R], ≥1 par wrong/right -->
```<lang>
# ❌ wrong: <por qué>
...
# ✅ right:
...
```

## GATES <!-- [R] -->
<!-- local = subset pineado y rápido; CI = completo pineado.
     Formato: `<comando exacto>` + versión + lane. -->
- local: ...
- CI: ...

## LESSONS <!-- [O], serie continua -->
<!-- `L<n> (<origin_pr|incidente>) <texto> → RULE que origina/refina` -->

## RECEIPT <!-- [R] formato; el ejemplar emitido vive con el dogfood -->
<!-- candidate_sha + risk tier (0|1|high) + lenses + verdict
     (APPROVE|REQUEST_CHANGES|INCONCLUSIVE); tree-check-at-commit. -->
```

## Niveles del árbol

```
shared/references/conventions/
  _template.md | README.md
  language/<id>/README.md              (level: language)
  language/<id>/frameworks/<fw>.md     (level: framework, parent: <id>)
  platform/<id>/...                    (reservado, misma plantilla)
  dataset/<id>/...                     (reservado, misma plantilla)
```

Un hijo referencia los GATES del padre por id+versión exacta, sin duplicarlos.
