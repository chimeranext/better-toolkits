# Conventions (capa shared)

Convenciones de "código bien escrito" por lenguaje/framework, versionadas y
enforceables. Lo transversal vive acá; los toolkits (incl. assurance) las
**consumen**, no las ownéan.

- Molde y reglas: [`_template.md`](./_template.md) (`shared/conventions-record`).
- Licencias: reinterpretar con atribución (MIT/Apache-2.0/BSD). AGPL solo como
  referencia de catálogo, nunca vendorado. Marcas de terceros no se adoptan.
- Ramas `platform/` y `dataset/` reservadas (misma plantilla, `level` distinto).

## Records

| Record | Level | Status | Gate stack |
|---|---|---|---|
| [`language/elixir`](./language/elixir/README.md) | language | draft | mix compile + format + Credo + Dialyzer |
| [`language/elixir/frameworks/phoenix`](./language/elixir/frameworks/phoenix.md) | framework | draft | hereda Elixir |
| [`language/php`](./language/php/README.md) | language | draft | `php -l` + Pint `--test` |
| [`language/php/frameworks/laravel`](./language/php/frameworks/laravel.md) | framework | draft | hereda PHP + Pest + arch |

## Ejemplares 2-4 (change `add-conventions-exemplars`)

Rust → Flutter → TypeScript, con fuentes ya pineadas en su `references.md`.
