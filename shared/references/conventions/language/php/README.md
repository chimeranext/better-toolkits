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
- P5 [errors] Mensajes de error **prescriptivos** (sugieren alternativa), salvo `[SECRECY]`
  en el PHPDoc (seguridad por secrecía). No usar excepciones para flujo esperado →
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

- local: `php -l` en archivos PHP tocados.
- CI: lo local + analizador estático cuando esté declarado en el record del
  repo (nivel fijado en `phpstan.neon` o equivalente).
- P5 (prescriptivo): **warn no-block** — `conventions-warn-recorder.sh php/P5 <file> @<author>`; no bloquea, registra en `internal-audits`.

## LESSONS

- L1 (sesión actual) Mensaje prohibitivo sin alternativa confunde al agente; la cura es
  prescriptivo o `[SECRECY]` en PHPDoc → P5 (ref: `conventions/prescriptive-error-messages.md`).

## RECEIPT

Ver hijo `laravel` y `_exemplars/php/` para gates ejecutables del stack web.
