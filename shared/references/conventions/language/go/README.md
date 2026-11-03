# convention: go
id: go · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-11-03 · ttl_expires: 2027-02-03
parent: none

## GOAL

Go que compila sin warnings, pasa gofmt+vet+staticcheck y no deja dependencias
flotantes (go.sum pineado, `go mod tidy` en CI).

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | docs | `pkg.go.dev` + Go modules reference | load-bearing | módulos/lockfile |
| S2 | repo | `dominikh/go-tools` (staticcheck) | load-bearing | lint estático |
| S3 | repo | `golangci/golangci-lint` | load-bearing | orquesta linters |
| S4 | docs | OpenTelemetry Go conventions | context | traces/logs |
| S5 | repo | `golang/go` (effective go) | load-bearing | idioms |

## RULES

- R1 [fmt] `gofmt -l .` vacío → toolchain.
- R2 [vet] `go vet ./...` limpio → toolchain.
- R3 [lint] `golangci-lint run` (staticcheck incluido) → S2/S3.
- R4 [deps] `go.mod` + `go.sum` commiteados; `go mod verify` en CI → S1.
- R5 [tidy] `go mod tidy` sin diff en CI → S1.
- R6 [errors] errores con contexto (`fmt.Errorf` con `%w`), sin panic en libs → S5.
- R7 [concurrency] goroutines con context + `go vet` (race) → S2.

## COUNTEREXAMPLES

```go
// ❌ wrong: error sin wrap pierde cadena (R6)
return errors.New("failed to open")

// ✅ right:
return fmt.Errorf("open %s: %w", path, err)
```

## GATES

- local: `gofmt -l . && go vet ./... && golangci-lint run`
- CI: los mismos, en orden, más `go mod verify && go mod tidy` check.
