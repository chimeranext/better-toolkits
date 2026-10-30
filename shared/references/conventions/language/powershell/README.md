# PowerShell — language convention record

Convención para scripts `.ps1` en el monorepo (build tools, MCP servers,
emergency scripts de limpieza, etc.).

## Gate stack

| Herramienta | Qué verifica | Cómo se corre |
|---|---|---|
| **Parser** | Sintaxis (parsea correctamente) | `[System.Management.Automation.Language.Parser]::ParseFile` — `PRE_COMMANDS` en MegaLinter |
| **PSScriptAnalyzer** | Reglas de estilo, práctica recomendada, bugs potenciales | descriptor `POWERSHELL` de MegaLinter |

Ambos generan SARIF; se integran al gate de `/assurance`.

## Reglas

- **R-PS1 [parser]**: todo `.ps1` debe parsear sin errores; un script que no
  parsea es un fallo de lint, no algo que se "arregla" omitiéndolo.
- **R-PS2 [PSScriptAnalyzer]**: pasar `Invoke-ScriptAnalyzer` sin errores de
  severidad `Error`/`Warning` (los de `Information` pueden ser aspiracionales).
- **R-PS3 [unix-style]**: en scripts cross-platform, mantener el protocolo de
  streams: nunca descartar stderr; usar `-ErrorAction SilentlyContinue` solo donde
  el error es esperado y se maneja.
- **R-PS4 [no secrets]**: no incrustar secrets; usar variables de entorno o
  `{env:...}` (igual que bash).

## Relación

- Hermano de `language/bash` (no existe aún como record formal; las reglas de
  stderr son las mismas).
- Consumido por `.mega-linter.yml` (`POWERSHELL`) y por el `PRE_COMMANDS` de
  parser en CI.
