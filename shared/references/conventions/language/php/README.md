# convention: php

id: php · version: 0.1.0 · status: draft · level: language
extracted_at: 2026-10-13 · ttl_expires: 2027-01-11
parent: none

## GOAL

PHP 8.4+ with explicit types, PSR-4 namespaces, and consistent style before any
framework: the interpreter and the static analyzer must not surprise in CI.

## SOURCES

| # | kind | ref | weight | purpose |
|---|------|-----|--------|----------|
| S1 | docs | php.net `language.types.declarations` + `strict` | load-bearing | `strict_types`, signatures |
| S2 | docs | PSR-12 (via framework formatter in child Laravel) | context | style when there is no child |
| S3 | docs | phpstan.org user guide (level pinned in the repo) | context | optional static analysis |

## RULES

- P1 [strict] `declare(strict_types=1);` in new files under `app/` and
  `src/` → S1.
- P2 [types] Typed parameters and returns on public APIs. No `mixed` except at
  a documented boundary → S1.
- P3 [psr4] PSR-4 autoload in `composer.json`. One root namespace per bounded
  context → S1.
- P4 [static] When the repo declares PHPStan/Psalm, the pinned level passes in CI
  (not only in the IDE) → S3.
- P5 [errors] **Prescriptive** error messages (suggest an alternative), except
  `[SECRECY]` in the PHPDoc (security through obscurity). Do not use exceptions
  for expected flow →
  `conventions/prescriptive-error-messages.md`.

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

```php
// ❌ wrong: mensaje de error prohibitivo sin alternativa (P5)
throw new InvalidArgumentException("Configuración inválida");

// ✅ right: prescriptivo — dice qué hacer
throw new InvalidArgumentException("Configuración inválida; revisa config.php");

// ❌ wrong: mensaje genérico SIN marca de secrecía (P5)
throw new DomainException("Credenciales inválidas");

// ✅ right: genérico PERO marcado [SECRECY] en el PHPDoc
/**
 * Autentica al usuario.
 * [SECRECY] no revelar qué campo falló (seguridad por secrecía).
 */
function login(string $u, string $p): void {
    throw new DomainException("Credenciales inválidas");
}
```

## GATES

- local: `php -l` on touched PHP files.
- CI: local plus static analyzer when the repo declares it in its record (level
  fixed in `phpstan.neon` or equivalent).
- P5 (prescriptive): **warn no-block** — `conventions-warn-recorder.sh php/P5 <file> @<author>`. It does not block. It records in `internal-audits`.

## LESSONS

- L1 (current session) A prohibitive message without an alternative confuses the
  agent. The cure is prescriptive or `[SECRECY]` in PHPDoc → P5 (ref:
  `conventions/prescriptive-error-messages.md`).

## RECEIPT

See child `laravel` and `_exemplars/php/` for executable gates of the web stack.
