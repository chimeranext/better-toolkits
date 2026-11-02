# PowerShell — language convention record

Convention for `.ps1` scripts in the monorepo (build tools, MCP servers,
emergency cleanup scripts, etc.).

## Gate stack

| Tool | What it verifies | How to run it |
|---|---|---|
| **Parser** | Syntax (parses correctly) | `[System.Management.Automation.Language.Parser]::ParseFile` — `PRE_COMMANDS` in MegaLinter |
| **PSScriptAnalyzer** | Style rules, best practice, potential bugs | `POWERSHELL` descriptor of MegaLinter |

Both generate SARIF. They integrate into the `/assurance` gate.

## Rules

- **R-PS1 [parser]**: every `.ps1` must parse without errors. A script that does
  not parse is a lint failure, not something that is "fixed" by omitting it.
- **R-PS2 [PSScriptAnalyzer]**: pass `Invoke-ScriptAnalyzer` with no errors of
  severity `Error`/`Warning` (`Information` ones may be aspirational).
- **R-PS3 [unix-style]**: in cross-platform scripts, keep the stream protocol:
  never discard stderr. Use `-ErrorAction SilentlyContinue` only where you expect
  the error and handle it.
- **R-PS4 [no secrets]**: do not embed secrets. Use environment variables or
  `{env:...}` (same as bash).

## Relationship

- Sibling of `language/bash` (not yet a formal record. The stderr rules are the
  same).
- `.mega-linter.yml` (`POWERSHELL`) and the parser `PRE_COMMANDS` consume it in
  CI.
