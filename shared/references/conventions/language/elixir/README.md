# convention: elixir
id: elixir · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-10-13 · ttl_expires: 2027-01-11
parent: none

## GOAL

Código Elixir que el compilador, el formatter, Credo y Dialyzer aceptan sin
observaciones: cero warnings, estilo consistente, complejidad acotada.

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | repo | `rrrene/credo` ~> 1.7 @ `90c5541` (MIT), dep `only: [:dev, :test], runtime: false` | load-bearing | checks + `mix credo` |
| S2 | docs | hexdocs.pm/credo v1.7.19 — lista exacta de checks verificada 2026-10-13 | load-bearing | cada check citado abajo existe en esa versión |
| S3 | docs | elixir-lang.org getting-started mix-otp + `introduction`/`learning` | context | toolchain y flujo mix |

## RULES

- R1 [compiler] Cero warnings: `mix compile --warnings-as-errors` → S1/S3.
- R2 [format] `mix format --check` limpio antes de cada commit → S3.
- R3 [pipes] Pipes lineales: `Readability.SinglePipe`, `OnePipePerLine`,
  `BlockPipe`, `PipeIntoAnonymousFunctions`, `Refactor.PipeChainStart`,
  `Refactor.SingleFunctionToBlockPipe` → S2.
- R4 [naming] `Readability.FunctionNames`, `PredicateFunctionNames`,
  `VariableNames`, `ModuleNames`, `AliasOrder`, `MaxLineLength` → S2.
- R5 [warnings] Nada entregado de `Warning.IoInspect`, `IExPry`, `Dbg`,
  `UnsafeToAtom`, `UnsafeExec`, `MixEnv`, `LazyLogging` → S2.
- R6 [complexity] Techos: `Refactor.ABCSize`, `CyclomaticComplexity`,
  `PerceivedComplexity`, `Nesting`, `FunctionArity` → S2.
- R7 [with] `with` sobre `case` anidado: `Refactor.WithClauses`,
  `RedundantWithClauseResult`, `Readability.WithSingleClause`,
  `WithCustomTaggedTuple`; bordes con `{:ok,_}/{:error,_}` → S2.
- R8 [design] `Design.TagTODO`, `TagFIXME`, `AliasUsage`,
  `SkipTestWithoutComment` → S2.
- R9 [types] `@spec` (`Readability.Specs`) + Dialyzer limpio → S2.
- R10 [consistency] `Consistency.SpaceAroundOperators`, `TabsOrSpaces`,
  `LineEndings`, `MultiAliasImportRequireUse` → S2.

## COUNTEREXAMPLES

```elixir
# ❌ wrong: case anidado + inspect entregado (R5, R7)
def fetch(id) do
  case Store.get(id) do
    {:ok, rec} ->
      IO.inspect(rec)
      case Authz.allow?(rec) do
        true -> {:ok, rec}
        false -> {:error, :forbidden}
      end
    err -> err
  end
end

# ✅ right: with + tagged tuples, sin inspect
@spec fetch(id()) :: {:ok, rec()} | {:error, term()}
def fetch(id) do
  with {:ok, rec} <- Store.get(id),
       :ok <- Authz.check(rec) do
    {:ok, rec}
  end
end
```

## GATES

- local: `mix compile --warnings-as-errors` + `mix format --check` +
  `mix credo --strict` (Credo `~> 1.7`).
- CI: lo local + Dialyzer vía `dialyxir` (`mix dialyzer`) + toolchain
  Elixir/OTP fijada en `.tool-versions` (versiones exactas se fijan en el
  dogfood 3.1 con el sandbox; sin pin no hay receipt).
- R11 (prescriptivo): **warn no-block** — `conventions-warn-recorder.sh elixir/R11 <file> @<author>`; no bloquea, registra en `internal-audits`.

## LESSONS

- (vacía — serie continua; la #1 nacerá del dogfood o del primer PR que la use)

## RECEIPT

Formato: `candidate_sha` + risk tier + lenses + verdict + tree-check-at-commit.
El ejemplar emitido del dogfood vive junto al sample (ver tarea 3.2).
