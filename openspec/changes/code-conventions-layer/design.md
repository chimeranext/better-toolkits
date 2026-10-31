# Design — code-conventions-layer

Unifica `add-conventions-layer` + `code-conventions-audit` en una sola capa.

## Estructura

```
shared/references/conventions/
├── README.md               # índice + reglas de casa
├── _template.md            # plantilla convention-record (level, id, SemVer, TTL, sources, rules, gates, receipt)
├── language/
│   ├── elixir/README.md    # record ejemplar v0.1.0
│   ├── elixir/frameworks/phoenix.md
│   └── powershell/README.md (nuevo, ver petición de linters)
└── (platform/ y dataset/ reservados)
```

## Auditoría

```
checks warn-no-block → registrador warn (make-no-mistakes) → internal-audits (append-only)
                                        ↓
                      /code-conventions-audit (assurance) → reporte de cumplimiento
```

## Decisiones

- Un solo spec (`shared/conventions-record`) cubre estructura + auditoría.
- `language/*` GATES pasan de block a warn + registro.
- `internal-audits` default por entidad; centralización opt-in vía `auditsRepo`.
- Primera instancia ejemplar: `elixir` (+ `phoenix`); `powershell` se agrega
  por la petición de linter.

## Nota sobre la consolidación

Los dos changes previos (`add-conventions-layer`, `code-conventions-audit`)
quedan **obsoletos**: su contenido se absorbe en este change. Al archivar, se
archivan ambos o se marcan superseded por `code-conventions-layer`.
