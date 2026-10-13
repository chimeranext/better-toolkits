# convention: php
id: php · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-10-13 · ttl_expires: 2027-01-11
parent: none

## GOAL

PHP 8.4+ con tipos explícitos, namespaces PSR-4 y estilo consistente antes de
cualquier framework: el intérprete y el analizador estático no deben sorprender
en CI.

## SOURCES

| # | kind | ref | weight | para qué |
|---|------|-----|--------|----------|
| S1 | docs | php.net `language.types.declarations` + `strict` | load-bearing | `strict_types`, firmas |
| S2 | docs | PSR-12 (via framework formatter en hijo Laravel) | context | estilo cuando no hay hijo |
| S3 | docs | phpstan.org user guide (nivel pineado en el repo) | context | análisis estático opcional |

## RULES

- P1 [strict] `declare(strict_types=1);` en archivos nuevos bajo `app/` y
  `src/` → S1.
- P2 [types] Parámetros y retornos tipados en APIs públicas; sin `mixed` salvo
  frontera documentada → S1.
- P3 [psr4] Autoload PSR-4 en `composer.json`; un namespace raíz por bounded
  context → S1.
- P4 [static] Cuando el repo declara PHPStan/Psalm, el nivel pineado pasa en CI
  (no solo en IDE) → S3.

## COUNTEREXAMPLES

```php
// ❌ wrong: sin strict_types, sin tipos (P1, P2)
function cut($pct) {
    return $pct * 100;
}

// ✅ right
declare(strict_types=1);

function cutPercent(float $pct): float
{
    return $pct * 100.0;
}
```

## GATES

- local: `php -l` en archivos PHP tocados.
- CI: lo local + analizador estático cuando esté declarado en el record del
  repo (nivel fijado en `phpstan.neon` o equivalente).

## LESSONS

- (vacía)

## RECEIPT

Ver hijo `laravel` y `_dogfood/php/` para gates ejecutables del stack web.
