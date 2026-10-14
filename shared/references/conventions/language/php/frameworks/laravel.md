# convention: laravel
id: laravel · version: 0.1.0 · status: draft · level: framework
extracted_at: 2026-10-13 · ttl_expires: 2027-01-11
parent: php@0.1.0

## GOAL

Aplicaciones Laravel 12+ con formato Pint, suite Pest (Feature/Unit/Architecture),
mocks/fakes de primera parte y entorno de test aislado. Hereda reglas de
`php@0.1.0` sin duplicarlas.

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | docs | laravel.com/docs/testing | load-bearing | HTTP tests, RefreshDatabase, `.env.testing` |
| S2 | docs | laravel.com/docs/mocking | load-bearing | `Http::fake`, `Bus::fake`, `Event::fake`, Mockery |
| S3 | docs | laravel.com/docs/pint | load-bearing | `vendor/bin/pint` / `--test` |
| S4 | docs | pestphp.com/docs/configuring-tests | load-bearing | `tests/Pest.php`, plugins, paralelismo |
| S5 | docs | pestphp.com/docs/arch-testing | load-bearing | `tests/Architecture`, presets y reglas `arch()` |
| S6 | docs | laravel.com/docs/sail | context | entorno local reproducible (opcional vs CI nativo) |
| S7 | docs | laravel.com/docs/horizon, octane, reverb, sanctum, scout, etc. | context | solo cuando el repo los usa; no RULE genérica |

Paquetes en S7 no generan gates en este record base: cada adopción documenta
SOURCES propias en un change de producto.

## RULES

- L1 [format] `vendor/bin/pint --test` en CI; `vendor/bin/pint` antes de push
  → S3.
- L2 [pest] Runner primario **Pest** vía `php artisan test` (o
  `./vendor/bin/pest`); PHPUnit legacy solo si el record del repo lo declara
  explícitamente como excepción → S1/S4.
- L3 [env] Tests con `APP_ENV=testing`; base de datos de test aislada
  (`RefreshDatabase` / `DatabaseMigrations` según el caso) → S1.
- L4 [fakes] Preferir fakes de Laravel sobre mocks profundos de implementación
  → S2.
- L5 [arch] Al menos un test de arquitectura por bounded context (`arch()`
  preset `laravel` + reglas de capas Domain/Http) → S5.
- L6 [parallel] CI con `--parallel` cuando use Postgres/MySQL y
  `ParallelTesting` / DB por proceso esté configurado → S4/S1.
- L7 [coverage] Cobertura con `--coverage --min=N` solo cuando el repo fija N en
  el record (no inventar umbral en el molde) → S1.
- L8 [dsms] `app/Domain/**` no importa HTTP/Inertia/rutas/copy de UI; el adaptador
  HTTP compone props → S5 + ADR-style adapter composition (ver `references.md`
  del change).
- L9 [static] Cuando el repo declara PHPStan/Larastan, CI ejecuta el nivel
  pineado; no ampliar baseline en archivos tocados → hereda P4 + S3 context.
- L10 [ci-tiers] CI de rama: subset smoke acordado; release o flag full-suite:
  Pest completo + Postgres efímero + build de assets cuando aplique; Clover
  (`--coverage-clover`) es auditoría, no gate por defecto → S1.

## NOTA (runner)

El molde better-toolkits asume **Pest + Pint + pest-plugin-arch**. Records de repos
legacy pueden declarar excepción PHPUnit-only en el frontmatter del record hijo.

## COUNTEREXAMPLES

```php
// ❌ wrong: lógica de dominio en el controller + test sin fake (L4, P2)
public function store(Request $request)
{
    $total = $request->amount * 1.2;
    Http::post('https://payments.example/charge', ['total' => $total]);
}

// ✅ right: Form Request + acción + Http::fake en test Feature
Http::fake(['payments.example/*' => Http::response(['ok' => true])]);
$this->post(route('charges.store'), ['amount' => 10])->assertRedirect();
```

## GATES

Hereda `php@0.1.0`. Propios:

- local: `vendor/bin/pint --test` + `php artisan test` (subset: Unit + un Feature
  smoke si el repo es grande).
- CI: lo local + suite Architecture + `--parallel` cuando aplique L6 + cobertura
  mínima si el record del repo fija `--min`.

## LESSONS

- Antes de push en monorepos grandes, `vendor/bin/pint --dirty` en archivos PHP tocados
  (práctica de producto; CI sigue usando `pint --test`).
- Product repos may document Pest `arch()` adoption in consumer docs (see change
  `references.md`); upstream: https://pestphp.com/docs/arch-testing

## RECEIPT

Formato del padre; dogfood en `_dogfood/php/` (comandos pineados, sin `vendor/`
en git).
