# convention: csharp
id: csharp · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-11-03 · ttl_expires: 2027-02-03
parent: none

## GOAL

C#/.NET que compila sin warnings, pasa analyzers (Roslyn) y usa `dotnet`
con lockfile reproducibile.

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | docs | `dotnet restore --locked-mode` | load-bearing | lockfile reproducible |
| S2 | docs | .NET analyzers (Roslyn) | load-bearing | análisis estático |
| S3 | repo | `dotnet/roslyn-analyzers` | load-bearing | reglas |
| S4 | docs | `packages.lock.json` schema | load-bearing | lockfile |

## RULES

- R1 [lock] `packages.lock.json` commiteado + `--locked-mode` en CI → S1/S4.
- R2 [restore] `dotnet restore --locked-mode` → S1.
- R3 [analyze] `dotnet build -warnaserror` (analyzers on) → S2/S3.
- R4 [fmt] formato de archivo (`.editorconfig` + `dotnet format --verify-no-changes`) → S2.
- R5 [test] `dotnet test` sin `--no-restore` silencioso → S2.

## COUNTEREXAMPLES

```csharp
// ❌ wrong: suppress de analyzer sin justificación (R3)
#pragma warning disable CA2000

// ✅ right: dispose con using; documentar si se suprime
```

## GATES

- local: `dotnet restore --locked-mode && dotnet build -warnaserror`
- CI: mismos + `dotnet format --verify-no-changes`.
