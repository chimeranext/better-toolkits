# TAS — Test Assertion Standards (nota operativa, español)

Esta es la nota en español para operadores. El estándar canónico (SSOT) vive en
inglés en `shared/references/engineering-standards/test-assertion-standards.md`.
Enforcement determinístico: `scripts/lint/detect_code_smells.py` (hook
`code-smells`).

## Principio

Un test asevera un **contrato** (invariante/relación), no un **snapshot**
(conteo absoluto de un registro que crece). Si el test necesita editarse solo
porque el registro creció, aseveró lo incorrecto.

## Qué detecta (multi-lenguaje)

Conteos literales en aserción de longitud o en los lenguajes de las convenciones:

- TS/JS: `toHaveLength(N)`, `assert.equal(x.length, N)`, `expect(x.length).toBe(N)`
- Python: `assert len(x) == N`
- Shell: `${#arr[@]} -eq N`
- PHP: `assertCount(N, $x)`
- PowerShell: `$x.Count -eq N`
- Dart: `expect(x.length, N)` / `hasLength(N)`
- Elixir: `assert length(x) == N`
- Rust: `assert_eq!(x.len(), N)`
- Go: `require.Len(t, x, N)` / `len(x) != N`
- Markdown/JSON/YAML/HTML/Dockerfile: n/a (sin aserciones de test)

## Cómo mitigar cada hit

1. **Derivar del fixture**: `toHaveLength(FIXTURE.comments.length)` (definir la
   constante del fixture en el test).
2. **Nombrar el contrato**: para cardinalidades fijas de dominio (p.ej. JWT = 3
   segmentos), `const JWT_SEGMENTS = 3`.
3. **Igualdad de conjunto**: para mapas/registros, `new Set(Object.keys(X))`
   contra `new Set([...])`.

## Propagación determinística

1. Refinar la regla para **no flaggear** derivados/nombrados/igualdad de conjunto.
2. **Sweep**: dejar el repo en 0 hits.
3. Subir la regla de WARN a **HARD** y aseverar **0 hallazgos** en CI.

Orden: nunca HARD antes de sweep en 0.

## Relación con estándares

- **BDD** (`shared/references/conventions/matcher-contract.md`) — qué y en qué
  lenguaje aseverar; TAS añade el criterio de estabilidad del `assert`.
- **QT4L (#16)** — trazabilidad req→test→QA→HITL; TAS no la sustituye, se
  superpone a la calidad de la aserción.
- **AFIF (#17)** — anti-fragilidad; TAS evita que los tests se rompan por
  crecimiento, no por inyección de fallos.
