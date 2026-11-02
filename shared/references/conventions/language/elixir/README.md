# convention: elixir

id: elixir · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-10-13 · ttl_expires: 2027-01-11
parent: none

## GOAL

Elixir code that the compiler, the formatter, Credo, and Dialyzer accept without
objections: zero warnings, consistent style, bounded complexity.

## SOURCES

| # | kind | ref | weight | why |
|---|------|-----|--------|----------|
| S1 | repo | `rrrene/credo` ~> 1.7 @ `90c5541` (MIT), dep `only: [:dev, :test], runtime: false` | load-bearing | checks + `mix credo` |
| S2 | docs | hexdocs.pm/credo v1.7.19 — exact list of checks verified 2026-10-13 | load-bearing | each check cited below exists in that version |
| S3 | docs | elixir-lang.org getting-started mix-otp + `introduction`/`learning` | context | toolchain and mix flow |

## RULES

- R1 [compiler] Zero warnings: `mix compile --warnings-as-errors` → S1/S3.
- R2 [format] `mix format --check` clean before each commit → S3.
- R3 [pipes] Linear pipes: `Readability.SinglePipe`, `OnePipePerLine`,
  `BlockPipe`, `PipeIntoAnonymousFunctions`, `Refactor.PipeChainStart`,
  `Refactor.SingleFunctionToBlockPipe` → S2.
- R4 [naming] `Readability.FunctionNames`, `PredicateFunctionNames`,
  `VariableNames`, `ModuleNames`, `AliasOrder`, `MaxLineLength` → S2.
- R5 [warnings] Nothing delivered from `Warning.IoInspect`, `IExPry`, `Dbg`,
  `UnsafeToAtom`, `UnsafeExec`, `MixEnv`, `LazyLogging` → S2.
- R6 [complexity] Ceilings: `Refactor.ABCSize`, `CyclomaticComplexity`,
  `PerceivedComplexity`, `Nesting`, `FunctionArity` → S2.
- R7 [with] `with` over nested `case`: `Refactor.WithClauses`,
  `RedundantWithClauseResult`, `Readability.WithSingleClause`,
  `WithCustomTaggedTuple`. Edges with `{:ok,_}/{:error,_}` → S2.
- R8 [design] `Design.TagTODO`, `TagFIXME`, `AliasUsage`,
  `SkipTestWithoutComment` → S2.
- R9 [types] `@spec` (`Readability.Specs`) + clean Dialyzer → S2.
- R10 [consistency] `Consistency.SpaceAroundOperators`, `TabsOrSpaces`,
  `LineEndings`, `MultiAliasImportRequireUse` → S2.
- R11 [errors] Error messages **prescriptive** (suggest an alternative), except `[SECRECY]`
  in `@doc` (security through obscurity). `{:error, _}` for expected failures, not `raise` →
  `conventions/prescriptive-error-messages.md`.

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

```elixir
# ❌ wrong: mensaje de error prohibitivo sin alternativa (R11)
{:error, "configuración inválida"}

# ✅ right: prescriptivo — dice qué hacer
{:error, "configuración inválida; revisa config.exs"}

# ❌ wrong: raise con mensaje genérico SIN marca de secrecía (R11)
raise "error de autenticación"

# ✅ right: @doc con [SECRECY]; retorna {:error, _} en vez de raise
@doc """
Autentica al usuario.
[SECRECY] no revelar el motivo exacto (seguridad por secrecía).
"""
def login(u, p), do: {:error, :invalid_credentials}
```

## GATES

- local: `mix compile --warnings-as-errors` + `mix format --check` +
  `mix credo --strict` (Credo `~> 1.7`).
- CI: Run the local checks and Dialyzer via `dialyxir` (`mix dialyzer`). Pin the
  Elixir/OTP toolchain in `.tool-versions`. We pin exact versions in dogfood 3.1
  with the sandbox. Without a pin, there is no receipt.
- R11 (prescriptive): **warn non-blocking** — `conventions-warn-recorder.sh elixir/R11 <file> @<author>`. It does not block and records in `internal-audits`.

## LESSONS

- L1 (current session) A prohibitive message without an alternative confuses the agent. The cure is
  prescriptive or `[SECRECY]` in `@doc` → R11 (ref: `conventions/prescriptive-error-messages.md`).

## RECEIPT

Format: `candidate_sha` + risk tier + lenses + verdict + tree-check-at-commit.
The issued dogfood specimen lives next to the sample (see task 3.2).
