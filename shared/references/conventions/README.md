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
| [`platform/markdown`](./platform/markdown/README.md) | platform | draft | docs SSOT en toolkits |
| [`platform/diagrams/mermaid-github`](./platform/diagrams/mermaid-github.md) | platform | draft | Mermaid en vista GitHub |
| [`prescriptive-error-messages`](./prescriptive-error-messages.md) | language (transversal) | draft | integrada como RULE en cada record de lenguaje |
| [`matcher-contract`](./matcher-contract.md) | language (transversal) | draft | BDD multi-lenguaje; traduce afirmaciones a matchers nativos |
| [`language/powershell`](./language/powershell/README.md) | language | draft | PSScriptAnalyzer + parser (`Parser::ParseFile`) |

## Linters de PowerShell (scripts .ps1)

El monorepo valida los scripts PowerShell (p.ej. `disk-cleanup-build.ps1`) con **dos capas**:

1. **Parser** (sintaxis): `[System.Management.Automation.Language.Parser]::ParseFile` — se corre como `PRE_COMMANDS` en MegaLinter y aborta si algún `.ps1` no parsea.
2. **PSScriptAnalyzer** (reglas/estilo): se corre vía el descriptor `POWERSHELL` de MegaLinter.

Ambos producen evidencia SARIF y se integran al gate de `/assurance`.

## Ejemplares 2-4 (change `add-conventions-exemplars`)

Rust → Flutter → TypeScript, con fuentes ya pineadas en su `references.md`.
